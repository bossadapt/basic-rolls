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
  const [abilityScores, setAbilityScores] = useState(defailtAbility);

  let defailtRoll: { roll_name: string; default_roll: string }[] = [];
  const [rolls, setRolls] = useState(defailtRoll);
  useEffect(() => {
    invoke<
      [
        { roll_name: string; default_roll: string }[],
        { ability: string; score: number }[]
      ]
    >("get_lists", {})
      .then((returnTuple) => {
        setRolls(returnTuple[0]);
        setAbilityScores(returnTuple[1]);
      })
      .catch(console.error);
  }, []);
  return (
    <div className="root">
      <div className="horiz">
        <div>
          <h2>Character</h2>
          <Character abilityScores={abilityScores} />
        </div>
        <div>
          <h2>Conditions</h2>
          <Conditions />
        </div>
        <div>
          <h2>Currency</h2>
          <Currency />
        </div>
      </div>
      <DiceBuilder rolls={rolls} abilityScores={abilityScores} />
    </div>
  );
};
export default Home;
