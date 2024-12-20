"use client";
import { SyntheticEvent, useEffect, useState } from "react";
import "./rolls.css";
import {
  checkRoll,
  getVarList,
  nameValidation,
  rollTraceTest,
  generateID,
} from "../../helperFunctions";
import { RollEditCard } from "./RollEditCard";
import { invoke } from '@tauri-apps/api/core';
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
    invoke<ListsResult>("grab_lists", {})
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
  let defaultRoll = {
    id: "",
    name: "",
    roll: "",
    healthCost: "",
    manaCost: "",
    actionTypes: [],
    conditions: [],
  };
  const [editorInputs, setEditorInputs] = useState<Roll>(defaultRoll);

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
    if (rolls.length > 0) {
      invoke<boolean>("overwrite_rolls", {
        newRolls: rolls,
      })
        .then((result) => {
          //move back to the basic menu to see if they are ready
          console.log("finished adding to sql");
          router.push("../../home");
        })
        .catch(console.error);
    } else {
      setTooltip("Must have at least one roll to leave this page");
    }
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
    let currentActionTypes: string[] = [];
    for (let i = 0; i < selectList.length; i++) {
      currentActionTypes.push(selectList[i].value);
    }
    setEditorInputs((prevEditorRoll) => {
      return { ...prevEditorRoll, actionTypes: currentActionTypes };
    });
  }
  function setEditorConditions(
    selectList: MultiValue<{ value: string; label: string }>
  ) {
    let currentConditions: string[] = [];
    for (let i = 0; i < selectList.length; i++) {
      currentConditions.push(selectList[i].value);
    }
    setEditorInputs((prevEditorRoll) => {
      return { ...prevEditorRoll, conditions: currentConditions };
    });
  }

  //need to add the ability to edit existing rolls without deleting them and generating a new ID
  function addRollHandler() {
    let currentEditorRoll = editorInputs;
    //check if it fits a regix and refresh the roll list if it mactches and is added
    currentEditorRoll.name = currentEditorRoll.name.trim();
    currentEditorRoll.roll = currentEditorRoll.roll.trim();
    currentEditorRoll.healthCost = currentEditorRoll.healthCost.trim();
    currentEditorRoll.manaCost = currentEditorRoll.manaCost.trim();

    let nameTest = nameValidation(currentEditorRoll.name);
    if (!nameTest.result) {
      setTooltip("add failed: " + nameTest.desc);
      return;
    }
    if (
      !rolls.some(
        (ex) =>
          (ex.name.toLocaleLowerCase() ===
            currentEditorRoll.name.toLocaleLowerCase() &&
            ex.id !== currentEditorRoll.id) ||
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
        if (currentEditorRoll.id === "") {
          currentEditorRoll.id = generateID(prev);
          console.log(' "' + currentEditorRoll.name + '" has been added');
          prev.push({ ...currentEditorRoll });
        } else {
          console.log(
            ' "' + currentEditorRoll.name + '" has been used as an update'
          );
          prev[prev.findIndex((item) => item.id === currentEditorRoll.id)] =
            currentEditorRoll;
        }
        return prev;
      });

      setEditorInputs(defaultRoll);
      setTooltip(' "' + currentEditorRoll.name + '" has been added');
      console.log(rolls);
    } else {
      setTooltip("Failed add: This name is already taken");
    }
  }

  function removeRollHandler(removedID: string) {
    setRolls((prev) => {
      console.log(prev);
      let output = prev.filter((e) => e.id !== removedID);
      console.log(output);
      return output;
    });
  }
  function editRollHandler(currentRoll: Roll) {
    setEditorInputs(currentRoll);
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
            value={editorInputs.actionTypes.map((actionID) => {
              return {
                value: actionID,
                label: actionTypes.find((actionType) => {
                  return actionType.id == actionID;
                })!.name,
              };
            })}
            hideSelectedOptions={true}
            isMulti={true}
            onChange={setEditorActionTypes}
            options={actionTypes.map((actionType) => {
              return { value: actionType.id, label: actionType.name };
            })}
          ></Select>

          <Select
            placeholder="Conditions Aplied to self"
            className="actionsTypeSelect"
            closeMenuOnSelect={false}
            value={editorInputs.conditions.map((condition) => {
              return {
                value: condition,
                label: conditions.find((condit) => {
                  return condit.id == condition;
                })!.name,
              };
            })}
            hideSelectedOptions={true}
            isMulti={true}
            onChange={setEditorConditions}
            options={conditions.map((condition) => {
              return { value: condition.id, label: condition.name };
            })}
          ></Select>
        </div>
        <button className="addRoleButton" onClick={addRollHandler}>
          +
        </button>
      </div>
      <h3>{tooltip}</h3>
      <div
        className="horiz"
        style={{ marginRight: "70%", marginLeft: "5%", maxHeight: "5vh" }}
      >
        <input
          style={{ width: "100%", height: "50%" }}
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
                conditions={conditions}
                actionTypes={actionTypes}
                removeRoll={() => removeRollHandler(currentRoll.id)}
                editRoll={() => editRollHandler(currentRoll)}
              ></RollEditCard>
            );
          })}
      </div>
    </div>
  );
};
export default EditRolls;
