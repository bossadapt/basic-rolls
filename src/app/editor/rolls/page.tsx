"use client";
import { SyntheticEvent, useEffect, useState } from "react";
import "./rolls.css";
import {
  checkRoll,
  getVarList,
  nameValidation,
  rollTraceTest,
} from "../../helperFunctions";
import { RollEditCard } from "./RollEditCard";
import { invoke } from "@tauri-apps/api";
import { useRouter } from "next/navigation";
import {
  AbilityScore,
  ActionType,
  CharacterInfo,
  Condition,
  ListsResult,
  Roll,
} from "@/app/globalInterfaces";
import { defaultRolls } from "./data";
import Select, { ActionMeta, MultiValue } from "react-select";
import EditorTitleAndFinish from "../editorTitleAndFinish";

const legitSymbols: String[] = ["+", "-", "*", "/"];
const defaultVars: String[] = ["str", "dex", "con", "int", "wis", "cha"];
export const EditRolls: React.FC = () => {
  const router = useRouter();
  //database sets needed
  const [rolls, setRolls] = useState(defaultRolls);
  const [abilityScores, setAbilityScores] = useState<AbilityScore[]>([]);
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo[]>([]);
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [actionTypes, setActionTypes] = useState<ActionType[]>([]);
  useEffect(() => {
    invoke<ListsResult>("get_lists", {})
      .then((result) => {
        if (result.rolls.length != 0) {
          setRolls(result.rolls);
        }
        setAbilityScores(result.abilityScores);
        setCharacterInfo(result.characterInfo);
        setConditions(result.conditions);
        setActionTypes(result.actionTypes);
      })
      .catch(console.error);
  }, []);
  //editor info
  const [editorInputs, setEditorInputs] = useState<Roll>({
    name: "",
    roll: "",
    healthCost: "",
    manaCost: "",
    actionTypes: [],
    conditions: [],
  });

  //search
  const [searchInput, setSearchInput] = useState("");

  //help users keep aware of user error and rules
  const [tooltip, setTooltip] = useState(
    'Hit the "+" to add rolls and "Finish" to move on'
  );

  function finish() {
    //just says every loop finishes
    //ensure no infinate loops in the rolls
    for (let i = 0; i < rolls.length; i++) {
      let rollTrace = rollTraceTest(rolls[i], rolls[i], rolls);
      if (!rollTrace.result) {
        setTooltip(rollTrace.desc);
        return;
      }
    }
    //update datasets
    invoke<boolean>("overwrite_rolls", {
      newRolls: rolls,
    })
      .then((result) => {
        //move back to the basic menu to see if they are ready
        console.log("finished adding to sql");
        router.push("../../home");
      })
      .catch(console.error);
  }
  //setters for editorRoll
  function setEditorName(newName: string) {
    setEditorInputs((prevEditorRoll) => {
      prevEditorRoll.name = newName;
      return { ...prevEditorRoll, name: newName };
    });
  }
  function setEditorRoll(newRoll: string) {
    setEditorInputs((prevEditorRoll) => {
      return { ...prevEditorRoll, roll: newRoll };
    });
  }
  function setEditorHealthCost(newHealthCost: string) {
    setEditorInputs((prevEditorRoll) => {
      return { ...prevEditorRoll, healthCost: newHealthCost };
    });
  }
  function setEditorManaCost(newManaCost: string) {
    setEditorInputs((prevEditorRoll) => {
      return { ...prevEditorRoll, manaCost: newManaCost };
    });
  }
  function setEditorActionTypes(
    selectList: MultiValue<{ value: string; label: string }>
  ) {
    let currentActionTypes: ActionType[] = [];
    for (let i = 0; i < selectList.length; i++) {
      currentActionTypes.push(
        actionTypes.find(
          (actionType) => actionType.name === selectList[i].value
        )!
      );
    }
    setEditorInputs((prevEditorRoll) => {
      return { ...prevEditorRoll, actionTypes: currentActionTypes };
    });
  }
  function setEditorConditions(
    selectList: MultiValue<{ value: string; label: string }>
  ) {
    let currentConditions: Condition[] = [];
    for (let i = 0; i < selectList.length; i++) {
      currentConditions.push(
        conditions.find(
          (actionType) => actionType.name === selectList[i].value
        )!
      );
    }
    setEditorInputs((prevEditorRoll) => {
      return { ...prevEditorRoll, conditions: currentConditions };
    });
  }

  //need to add final checks of vars existence in all rolls and trace var loops
  //need to add an ability to refresh the rolls
  function handleAddRoll() {
    let currentEditorRoll = editorInputs;
    //check if it fits a regix and refresh the roll list if it mactches and is added
    console.log("before: " + currentEditorRoll.name);
    currentEditorRoll.name = currentEditorRoll.name.trim();
    console.log("after: " + currentEditorRoll.name);
    currentEditorRoll.roll = currentEditorRoll.roll.trim();
    currentEditorRoll.healthCost = currentEditorRoll.healthCost.trim();
    currentEditorRoll.manaCost = currentEditorRoll.manaCost.trim();

    let nameTest = nameValidation(currentEditorRoll.name);
    console.log("after2: " + currentEditorRoll.name);
    if (!nameTest.result) {
      setTooltip("add failed: " + nameTest.desc);
      return;
    }
    if (
      !rolls.some(
        (ex) =>
          ex.name.toLocaleLowerCase() ==
            currentEditorRoll.name.toLocaleLowerCase() ||
          defaultVars.includes(currentEditorRoll.name.toLocaleLowerCase())
      )
    ) {
      let rollCheck = checkRoll(currentEditorRoll.roll, rolls);
      if (!rollCheck.result) {
        setTooltip("Failed Add: (roll)" + rollCheck.desc);
        return;
      }

      let healthCheck = checkRoll(editorInputs.healthCost, rolls);
      if (!healthCheck.result) {
        setTooltip("Failed Add: (healthCost)" + healthCheck.desc);
        return;
      }

      let manaCheck = checkRoll(editorInputs.manaCost, rolls);
      if (!manaCheck.result) {
        setTooltip("Failed Add: (manaCost)" + manaCheck.desc);
        return;
      }

      setRolls((prev) => {
        if (
          !prev.some(
            (entry) =>
              entry.name.toLocaleLowerCase() ===
              currentEditorRoll.name.toLocaleLowerCase()
          )
        ) {
          // add spacing and remove dumb spacing for dumb display overload
          let idealRoll = "";
          for (let i = 0; i < currentEditorRoll.roll.length; i++) {
            let char = currentEditorRoll.roll.charAt(i);
            if (char === " ") {
              //only my spaces are allowed >:^D
            } else if (legitSymbols.includes(char)) {
              idealRoll += " " + char + " ";
            } else {
              idealRoll += char;
            }
          }
          console.log(' "' + currentEditorRoll.name + '" has been added2');
          prev.push({ ...currentEditorRoll });
        }
        return prev;
      });

      setEditorName("");
      setEditorRoll("");
      setEditorHealthCost("");
      setEditorManaCost("");
      setEditorActionTypes([]);
      setEditorConditions([]);
      setTooltip(' "' + currentEditorRoll.name + '" has been added');
    } else {
      setTooltip("Failed add: This name is already taken");
    }
  }

  function handleRemoveRoll(removedName: string) {
    setRolls((prev) => {
      console.log(prev);
      let output = prev.filter(
        (e) => e.name.toLocaleLowerCase() !== removedName.toLocaleLowerCase()
      );
      console.log(output);
      return output;
    });
  }
  function handleEditRoll(editName: string) {
    let editNameLow = editName.toLocaleLowerCase();
    for (let i = 0; i < rolls.length; i++) {
      if (rolls[i].name.toLocaleLowerCase() === editNameLow) {
        setEditorName(rolls[i].name);
        setEditorRoll(rolls[i].roll);
        setEditorHealthCost(rolls[i].healthCost);
        setEditorManaCost(rolls[i].manaCost);
        setEditorActionTypes(
          rolls[i].actionTypes.map((actionType) => {
            return { label: actionType.name, value: actionType.name };
          })
        );
        setEditorConditions(
          rolls[i].conditions.map((condition) => {
            return { label: condition.name, value: condition.name };
          })
        );
        handleRemoveRoll(editName);
        break;
      }
    }
  }

  return (
    <div className="root">
      <EditorTitleAndFinish
        title="Rolls Editor"
        handleFinishButton={finish}
      ></EditorTitleAndFinish>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            padding: "0%",
            marginLeft: "15%",
          }}
        >
          <input
            placeholder="Perception"
            className="rollInput"
            type="text"
            name="rollName"
            value={editorInputs.name}
            onChange={(e) => setEditorName(e.target.value)}
          />
          <input
            placeholder="d20 + var(wis) + var(another_roll) + 3"
            className="rollInput"
            type="text"
            name="roll"
            value={editorInputs.roll}
            onChange={(e) => setEditorRoll(e.target.value)}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
            }}
          >
            <h4 className="costText">Health Cost</h4>
            <h4 className="costText">Mana Cost</h4>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input
              className="cost"
              type="number"
              value={editorInputs.healthCost}
              onChange={(eve) => setEditorHealthCost(eve.target.value)}
              placeholder="Health Cost"
            />
            <input
              className="cost"
              type="number"
              value={editorInputs.manaCost}
              onChange={(eve) => setEditorManaCost(eve.target.value)}
              placeholder="Mana Cost"
            />
          </div>
          <Select
            placeholder="Action Type"
            className="actionsTypeSelect"
            closeMenuOnSelect={false}
            value={editorInputs.actionTypes.map((actionType) => {
              return { value: actionType.name, label: actionType.name };
            })}
            hideSelectedOptions={true}
            isMulti={true}
            onChange={(eve) => setEditorActionTypes(eve)}
            options={actionTypes.map((actionType) => {
              return { value: actionType.name, label: actionType.name };
            })}
          ></Select>
          <Select
            placeholder="Conditions Aplied to self"
            className="actionsTypeSelect"
            closeMenuOnSelect={false}
            value={editorInputs.conditions.map((condition) => {
              return { value: condition.name, label: condition.name };
            })}
            hideSelectedOptions={true}
            isMulti={true}
            onChange={setEditorConditions}
            options={conditions.map((actionType) => {
              return { value: actionType.name, label: actionType.name };
            })}
          ></Select>
        </div>
        <button className="addButton" onClick={handleAddRoll}>
          +
        </button>
      </div>
      <h3>{tooltip}</h3>
      <hr></hr>
      <div
        className="horiz"
        style={{ marginRight: "70%", marginLeft: "5%", maxHeight: "5vh" }}
      >
        <input
          style={{ width: "100%", height: "80%" }}
          placeholder="search by name"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        ></input>
      </div>
      <div className="rollList">
        {rolls
          .filter((item) =>
            item.name
              .toLocaleLowerCase()
              .includes(searchInput.toLocaleLowerCase())
          )
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((currentRoll) => {
            return (
              <RollEditCard
                key={currentRoll.name}
                currentRoll={currentRoll}
                removeRoll={() => handleRemoveRoll(currentRoll.name)}
                editRoll={() => handleEditRoll(currentRoll.name)}
              ></RollEditCard>
            );
          })}
      </div>
    </div>
  );
};
export default EditRolls;
