"use client";
import { useEffect, useState } from "react";
import { CharacterEffectTable } from "./CharacterEffectTable";
import { AbilityScoreEffectsTable } from "./AbilityScoreEffectTable";
import { useRouter } from "next/navigation";
import "./conditions.css";
import {
  Roll,
  AbilityScore,
  CharacterInfo,
  Condition,
  ListsResult,
} from "@/app/globalInterfaces";
import { invoke } from "@tauri-apps/api";
import RollsEffectsTable from "./RollsEffectTable";
import EditorTitleAndFinish from "../editorTitleAndFinish";
import { checkRoll, generateID, nameValidation } from "@/app/helperFunctions";
interface ConditionProps {
  listsProp: ListsResult;
}
export const Conditions: React.FC<ConditionProps> = ({ listsProp }) => {
  const defaultCondition: Condition = {
    id: "",
    name: "",
    turnBased: false,
    length: "1",
    abilityScoreChanges: [],
    characterInfoChanges: [],
    rollChanges: [],
  };
  const defaultLists: ListsResult = {
    rolls: [],
    abilityScores: [],
    characterInfo: [],
    conditions: [],
    actionTypes: [],
  };
  const router = useRouter();
  //for error info displayed
  const [finishedConditionButtonInfo, setFinishedConditionButtonInfo] =
    useState("");
  const [lists, setLists] = useState<ListsResult>(defaultLists || listsProp);
  const [turnsTillOver, setTurnsTillOver] = useState("1");
  const [manaPerTurn, setManaPerTurn] = useState("0");
  useEffect(() => {
    invoke<ListsResult>("grab_lists", {}).then((result) => setLists(result));
  }, []);
  const [conditions, setConditions] = useState(lists.conditions);
  let abilityScoresList = lists.abilityScores;
  let characterInfoList = lists.characterInfo;
  let rollsList = lists.rolls;
  const [focusedCondition, setFocusedCondition] = useState(defaultCondition);
  function handleEndTypeCheckbox(type: string) {
    setFocusedCondition((prev) => {
      return {
        ...prev,
        turnBased: type === "mana" ? false : true,
        length: type === "mana" ? manaPerTurn : turnsTillOver,
      };
    });
  }
  function checkAllRolls(): boolean {
    let currentFocused = focusedCondition;
    let lastChecked = true;
    let i = 0;
    while (i != currentFocused.abilityScoreChanges.length) {
      let currentCheck = checkRoll(
        currentFocused.abilityScoreChanges[i].changeEffect,
        rollsList
      );
      if (!currentCheck.result) {
        setFinishedConditionButtonInfo(
          "Cannot add: " +
            currentCheck.desc +
            "(ability score " +
            currentFocused.abilityScoreChanges[i].name +
            ")"
        );
        return false;
      }
      i++;
    }
    let d = 0;
    while (d != currentFocused.characterInfoChanges.length) {
      let currentCheck = checkRoll(
        currentFocused.characterInfoChanges[d].changeEffect,
        rollsList
      );
      if (!currentCheck.result) {
        setFinishedConditionButtonInfo(
          "Cannot add: " +
            currentCheck.desc +
            "(character info " +
            currentFocused.characterInfoChanges[d].name +
            ")"
        );
        return false;
      }
      d++;
    }
    let x = 0;
    while (x != currentFocused.rollChanges.length) {
      let currentCheck = checkRoll(
        currentFocused.rollChanges[x].changeEffect,
        rollsList
      );
      if (!currentCheck.result) {
        setFinishedConditionButtonInfo(
          "Cannot add: " +
            currentCheck.desc +
            "(roll changes " +
            currentFocused.characterInfoChanges[d].name +
            ")"
        );
        return false;
      }
      x++;
    }
    return true;
  }
  /// saves focused condition to the conditions array or displays error
  function finishCondition() {
    let nameCheck = nameValidation(focusedCondition.name);
    if (!nameCheck.result) {
      setFinishedConditionButtonInfo("Cannot add: " + nameCheck.desc);
      return;
    }
    let lengthCheck = checkRoll(focusedCondition.length, rollsList);
    if (!lengthCheck.result) {
      setFinishedConditionButtonInfo(
        "Cannot add: " + lengthCheck.desc + "(length)"
      );
      return;
    }
    if (!checkAllRolls()) {
      return;
    }
    setConditions((oldConditions) => {
      //rewrote a decent ammount of the project to use IDs for this to be less jank
      if (focusedCondition.id === "") {
        if (
          oldConditions.findIndex((condit) => {
            return condit.name === focusedCondition.name;
          }) != -1
        ) {
          setFinishedConditionButtonInfo("Cannot add: username already exists");
          return oldConditions;
        } else {
          //created new
          focusedCondition.id = generateID(oldConditions);
          setFinishedConditionButtonInfo("Condition Added");
          oldConditions.push(focusedCondition);
          return [...oldConditions];
        }
      } else {
        //update existing
        oldConditions[
          oldConditions.findIndex((item) => {
            item.id === focusedCondition.id;
          })
        ] = focusedCondition;
        setFinishedConditionButtonInfo("Condition Updated");
        return [...oldConditions];
      }
    });
  }

  function handleRefocused(id: string) {
    setFocusedCondition(
      conditions.find((item) => {
        return item.id === id;
      }) || defaultCondition
    );
    setFinishedConditionButtonInfo("");
  }
  function handleNewButton() {
    setFocusedCondition({ ...defaultCondition });
  }
  function finish() {
    invoke<boolean>("overwrite_conditions", {
      newConditions: conditions,
    })
      .then((result) => {
        //move back to the basic menu to see if they are ready to move to the main screen
        router.push("/editor");
      })
      .catch(console.error);
  }

  return (
    <div className="main">
      <EditorTitleAndFinish
        title="Conditions Editor"
        handleFinishButton={finish}
      ></EditorTitleAndFinish>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          height: "100%",
        }}
      >
        <div className="conditionContainerCollection">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input placeholder="Search Name"></input>
            <button
              onClick={() => {
                handleNewButton();
              }}
            >
              NEW
            </button>
          </div>
          {conditions?.map((condit) => {
            // designate wheather its focused or not
            let containerType = "conditionContainerUnselected";
            if (focusedCondition.id === condit.id) {
              containerType = "conditionContainerSelected";
            }

            //create length type
            let lengthType = "mana";
            if (condit.turnBased) {
              lengthType = "rounds";
            }
            //check what lists were altered
            let changeListString = "";
            if (condit.characterInfoChanges.length != 0) {
              changeListString = changeListString + "Character";
            }
            if (condit.abilityScoreChanges.length != 0) {
              if (changeListString !== "") {
                changeListString = changeListString + ",";
              }
              changeListString = changeListString + "Ability Scores";
            }
            if (condit.rollChanges.length != 0) {
              if (changeListString !== "") {
                changeListString = changeListString + ",";
              }
              changeListString = changeListString + "Rolls";
            }
            return (
              <div
                className={containerType}
                onClick={() => {
                  handleRefocused(condit.id);
                }}
              >
                <h3 className="conditionContainerTitle">{condit.name}</h3>
                <h4 className="conditionContainerLength">
                  {condit.length + " " + lengthType}
                </h4>
                <p className="conditionContainerChanges">{changeListString}</p>
              </div>
            );
          })}
        </div>

        <div className="editorContainer">
          <input
            placeholder="Condition Name"
            value={focusedCondition.name}
            onChange={(val) =>
              setFocusedCondition((condit) => {
                return { ...condit, name: val.target.value };
              })
            }
          ></input>
          <h2 style={{ justifyContent: "left" }}>Length</h2>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <h3 style={{ margin: "auto" }}>Turn Count</h3>
            <h3 style={{ margin: "auto" }}>Mana Cost</h3>
          </div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input
              type="Checkbox"
              checked={focusedCondition.turnBased}
              onChange={(eve) => handleEndTypeCheckbox("turn")}
            ></input>
            <input
              type="number"
              disabled={!focusedCondition.turnBased}
              value={turnsTillOver}
              onChange={(eve) => {
                setTurnsTillOver(eve.target.value);
              }}
            ></input>
            <input
              type="Checkbox"
              checked={!focusedCondition.turnBased}
              onChange={(eve) => handleEndTypeCheckbox("mana")}
            ></input>
            <input
              type="number"
              disabled={focusedCondition.turnBased}
              value={manaPerTurn}
              onChange={(eve) => {
                setManaPerTurn(eve.target.value);
              }}
            ></input>
          </div>
          <CharacterEffectTable
            category="Character Info"
            characterInfoList={characterInfoList}
            condition={focusedCondition}
            setCondition={setFocusedCondition}
          ></CharacterEffectTable>
          <AbilityScoreEffectsTable
            category="AbilityScores"
            abilityScoreList={abilityScoresList}
            condition={focusedCondition}
            setCondition={setFocusedCondition}
          ></AbilityScoreEffectsTable>
          <RollsEffectsTable
            category="Rolls"
            rolls={rollsList}
            condition={focusedCondition}
            setCondition={setFocusedCondition}
          ></RollsEffectsTable>
          <h3 style={{ color: "red" }}>{finishedConditionButtonInfo}</h3>
          <button
            style={{
              display: "inline",
              marginTop: "5%",
              width: "100%",
              height: "30px",
              textAlign: "center",
            }}
            onClick={() => {
              finishCondition();
            }}
          >
            Finish Current Condition
          </button>
        </div>
      </div>
    </div>
  );
};
export default Conditions;
