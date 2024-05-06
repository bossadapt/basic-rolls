"use client";
import "./home.css";
import { Character } from "./Character";
import { Conditions } from "./Conditions";
import { Currency } from "./Currency";
import { DiceBuilder } from "./DiceBuilder";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
import { AbilityScore, Roll, CharacterInfo } from "../globalInterfaces";
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
  let defailtRoll: Roll[] = [];
  const [rolls, setRolls] = useState(defailtRoll);
  useEffect(() => {
    invoke<[Roll[], AbilityScore[], CharacterInfo[]]>("get_lists", {})
      .then((result) => {
        setRolls(result[0]);
        setAbilityScores(result[1]);
        setCharacterInfo(result[2]);
      })
      .catch(console.error);
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
          <Conditions />
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
