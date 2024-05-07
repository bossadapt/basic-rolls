"use client";
import { useEffect, useState } from "react";
import { CharacterEffectTable } from "./CharacterEffectTable";
import "./conditions.css";
import {
  Roll,
  AbilityScore,
  CharacterInfo,
  Condition,
} from "@/app/globalInterfaces";
import { invoke } from "@tauri-apps/api";
interface ConditionProps {
  rolls: Roll[];
  abilityScores: AbilityScore[];
  characterInfoList: CharacterInfo[];
  conditionList: Condition[];
}
export const Conditions: React.FC<ConditionProps> = ({
  rolls,
  abilityScores,
  characterInfoList,
  conditionList,
}) => {
  const [focusedCondition, setFocusedCondition] = useState<Condition>();
  const [conditions, setConditions] = useState<Condition[]>(
    conditionList || []
  );
  if (!abilityScores || !rolls || !characterInfoList) {
    useEffect(() => {
      invoke<AbilityScore[]>("grab_ability_scores", {}).then(
        (abilityScores) => {}
      );
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
          {conditions.map((condit) => {
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
            if (condit.abilityScoresChanges.length != 0) {
              if (changeListString !== "") {
                changeListString = changeListString + ",";
              }
              changeListString = changeListString + "Ability Scores";
            }
            if (condit.rollsChanges.length != 0) {
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
            <input type="Radio"></input>
            <input placeholder="Turn Count(5)"></input>
            <input type="Radio"></input>
            <input placeholder="Mana Cost"></input>
          </div>
          <CharacterEffectTable
            category="Character Info"
            characterInfoList={characterInfoList}
            condition={focusedCondition}
            setCondition={setFocusedCondition}
          ></CharacterEffectTable>
          <h2 style={{ justifyContent: "left" }}>Ability Score</h2>
          <h2 style={{ justifyContent: "left" }}>Rolls</h2>
        </div>
      </div>
    </div>
  );
};
export default Conditions;
