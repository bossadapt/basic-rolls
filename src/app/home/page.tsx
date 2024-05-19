"use client";
import "./home.css";
import { Character } from "./character/Character";
import { Conditions } from "./conditions/Conditions";
import { Currency } from "./currency/Currency";
import { DiceBuilder } from "./diceBuilder/DiceBuilder";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import {
  AbilityScore,
  Roll,
  CharacterInfo,
  Condition,
  ListsResult,
} from "../globalInterfaces";
interface homeProps {}
export const Home: React.FC = () => {
  let defailtAbility: AbilityScore[] = [
    { ability: "str", score: 10 },
    { ability: "dex", score: 10 },
    { ability: "con", score: 10 },
    { ability: "int", score: 10 },
    { ability: "wis", score: 10 },
    { ability: "cha", score: 10 },
  ];
  let defailtCharacterInfo: CharacterInfo[] = [
    { info_type: "name", input: "Character" },
    { info_type: "hp", input: "0" },
    { info_type: "ac", input: "10" },
    { info_type: "mana", input: "2" },
  ];
  const [abilityScores, setAbilityScores] = useState(defailtAbility);
  const [characterInfo, setCharacterInfo] = useState(defailtCharacterInfo);
  const [conditions, setConditions] = useState<Condition[]>([]);
  let defailtRoll: Roll[] = [];
  const [rolls, setRolls] = useState(defailtRoll);
  useEffect(() => {
    console.log("listsCalledStart");
    invoke<ListsResult>("get_lists", {})
      .then((result) => {
        setRolls(result.rolls);
        setAbilityScores(result.abilityScores);
        setCharacterInfo(result.characterInfo);
        setConditions(result.conditions);
      })
      .catch(console.error);
    console.log("listsCalledEnded");
  }, []);
  return (
    <div className="root">
      <div className="horiz">
        <div>
          <Character
            characterInfo={characterInfo}
            setCharacterInfo={setCharacterInfo}
          />
        </div>
        <div>
          <Conditions conditions={conditions} />
        </div>
        <div>
          <Currency />
        </div>
      </div>
      <DiceBuilder rolls={rolls} abilityScores={abilityScores} />
    </div>
  );
};
export default Home;
