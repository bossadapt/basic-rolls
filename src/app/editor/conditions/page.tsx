"use client";
import { useEffect, useState } from "react";
import { CharacterEffectTable } from "./CharacterEffectTable";
import { AbilityScoreEffectsTable } from "./AbilityScoreEffectTable";
import "./conditions.css";
import {
  Roll,
  AbilityScore,
  CharacterInfo,
  Condition,
  ListsResult,
} from "@/app/globalInterfaces";
import { invoke } from "@tauri-apps/api";
interface ConditionProps {
  listsProp: ListsResult;
}
export const Conditions: React.FC<ConditionProps> = ({ listsProp }) => {
  const defaultCondition: Condition = {
    name: "",
    turnBased: false,
    length: "",
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
  const [lists, setLists] = useState<ListsResult>(defaultLists || listsProp);
  const [turnsTillOver, setTurnsTillOver] = useState("");
  const [manaPerTurn, setManaPerTurn] = useState("");
  useEffect(() => {
    invoke<ListsResult>("get_lists", {}).then((result) => setLists(result));
  }, []);

  let conditionList = lists.conditions;
  let abilityScoresList = lists.abilityScores;
  let characterInfoList = lists.characterInfo;
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
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        marginLeft: "2%",
        marginRight: "2%",
      }}
    >
      <h1>Conditions Editor</h1>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div className="conditionContainerCollection">
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input placeholder="Search Name"></input>
            <button>NEW</button>
          </div>
          {conditionList?.map((condit) => {
            // designate wheather its focused or not
            let containerType = "conditionContainerUnselected";
            if (focusedCondition === condit) {
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
              <div className={containerType}>
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
          <input placeholder="Condition Name"></input>
          <h2 style={{ justifyContent: "left" }}>Length</h2>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <input
              type="Checkbox"
              checked={focusedCondition.turnBased}
              onChange={(eve) => handleEndTypeCheckbox("turn")}
            ></input>
            <input
              placeholder="Turn Count(5)"
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
              placeholder="Mana Per Turn"
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
          <h2 style={{ justifyContent: "left" }}>Rolls</h2>
        </div>
      </div>
    </div>
  );
};
export default Conditions;
