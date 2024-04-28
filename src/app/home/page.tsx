"use client";
import "./home.css";
import { Character } from "./Character";
import { Conditions } from "./Conditions";
import { Currency } from "./Currency";
import { DiceBuilder } from "./DiceBuilder";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api";
interface homeProps {}
export const Home: React.FC = () => {
  let defailtAbility: { ability: string; score: number }[] = [
    { ability: "str", score: 10 },
    { ability: "dex", score: 10 },
    { ability: "con", score: 10 },
    { ability: "int", score: 10 },
    { ability: "wis", score: 10 },
    { ability: "cha", score: 10 },
  ];
  let defailtCharacterInfo: { info_type: string; input: string }[] = [
    { info_type: "name", input: "Character" },
    { info_type: "hp", input: "0" },
    { info_type: "ac", input: "10" },
    { info_type: "mana", input: "2" },
  ];
  const [abilityScores, setAbilityScores] = useState(defailtAbility);
  const [characterInfo, setCharacterInfo] = useState(defailtCharacterInfo);
  let defailtRoll: { roll_name: string; default_roll: string }[] = [];
  const [rolls, setRolls] = useState(defailtRoll);
  useEffect(() => {
    invoke<
      [
        { roll_name: string; default_roll: string }[],
        { ability: string; score: number }[],
        { info_type: string; input: string }[]
      ]
    >("get_lists", {})
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
