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
import { useRouter } from "next/navigation";
export const Home: React.FC = () => {
  const router = useRouter();
  let defailtAbility: AbilityScore[] = [
    { ability: "str", score: 10 },
    { ability: "dex", score: 10 },
    { ability: "con", score: 10 },
    { ability: "int", score: 10 },
    { ability: "wis", score: 10 },
    { ability: "cha", score: 10 },
  ];
  let defailtCharacterInfo: CharacterInfo[] = [
    { infoType: "name", input: "Character" },
    { infoType: "hp", input: "0" },
    { infoType: "ac", input: "10" },
    { infoType: "mana", input: "2" },
  ];
  const [abilityScores, setAbilityScores] = useState(defailtAbility);
  const [characterInfo, setCharacterInfo] = useState(defailtCharacterInfo);
  const [conditions, setConditions] = useState<Condition[]>([]);
  let defailtRoll: Roll[] = [];
  const [rolls, setRolls] = useState(defailtRoll);
  useEffect(() => {
    console.log("listsCalledStart");
    invoke<ListsResult>("grab_lists", {})
      .then((result) => {
        setRolls(result.rolls);
        setAbilityScores(result.abilityScores);
        setCharacterInfo(result.characterInfo);
        setConditions(result.conditions);
      })
      .catch(console.error);
    console.log("listsCalledEnded");
  }, []);
  function editingPageClickedHandler(pageName: String) {
    //save state here when i have added a way
    router.push("../editor/" + pageName);
  }
  return (
    <div className="root">
      <div className="navbar">
        <h3>Time Passing:</h3>
        <button>Turn</button>
        <button>Combat</button>
        <button>Short Rest</button>
        <button>Long Rest</button>
        <h3 style={{ marginLeft: "auto" }}>Editing Pages:</h3>
        <button
          onClick={() => {
            editingPageClickedHandler("abilityScores");
          }}
        >
          Ability Scores
        </button>
        <button
          onClick={() => {
            editingPageClickedHandler("actionTypes");
          }}
        >
          Action Types
        </button>
        <button
          onClick={() => {
            editingPageClickedHandler("character");
          }}
        >
          Character Info
        </button>
        <button
          onClick={() => {
            editingPageClickedHandler("conditions");
          }}
        >
          Conditions
        </button>
        <button
          onClick={() => {
            editingPageClickedHandler("rolls");
          }}
        >
          Rolls
        </button>
      </div>
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
