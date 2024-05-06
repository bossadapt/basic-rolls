"use client";
import { useState } from "react";
import { CharacterEffectTable } from "./CharacterEffectTable";
import "./conditions.css";
import { Roll, AbilityScore, CharacterInfo } from "@/app/globalInterfaces";
interface ConditionProps {
  rolls: Roll[];
  abilityScores: AbilityScore[];
  characterInfoList: CharacterInfo[];
}
export interface Change {
  name: string;
  changeEffect: string;
}
export interface ChangeList {
  category: string;
  changes: Change[];
}
export interface Condition {
  conditionName: string;
  conditionLength: number;
  changeList: ChangeList[];
}
export const Conditions: React.FC<ConditionProps> = ({
  abilityScores,
  rolls,
  characterInfoList,
}) => {
  const [focusedCondition, setFocusedCondition] = useState<Condition>();
  const [conditions, setConditions] = useState<Condition[]>([]);
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
          <div className="conditionContainerSelected">
            <h3 className="conditionContainerTitle">Name Example</h3>
            <h4 className="conditionContainerLength">12 turns</h4>
            <p className="conditionContainerChanges">
              Character, Ability Score, Rolls
            </p>
          </div>
          <div className="conditionContainerUnselected">
            <h3 className="conditionContainerTitle">Name Example</h3>
            <h4 className="conditionContainerLength">12 turns</h4>
            <p className="conditionContainerChanges">
              Character, Ability Score, Rolls
            </p>
          </div>
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
