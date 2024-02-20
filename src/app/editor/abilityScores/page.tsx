"use client";
import { useCallback, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from "next/navigation";
import "./editor.css";
interface EditAbilityScoreProps {
  abilityScores: { ability: string; score: number }[];
}
export const EditAbilityScore: React.FC = () => {
  const [strength, setStrength] = useState(10);
  const [dexterity, setDexterity] = useState(10);
  const [constitution, setConstitution] = useState(10);
  const [intelligence, setIntelligence] = useState(10);
  const [wisdom, setWisdom] = useState(10);
  const [charism, setCharism] = useState(10);
  const router = useRouter();
  const [submitDisabled, setSubmitDisabled] = useState(false);

  //{ ability: string; score: number }[]
  useEffect(() => {
    invoke<{ ability: string; score: number }[]>("grab_ability_scores", {})
      .then((abilityScores) => {
        for (let i = 0; i < abilityScores.length; i++) {
          let abilityScore = abilityScores[i];
          switch (abilityScore.ability) {
            case "strength":
              setStrength(abilityScore.score);
              break;
            case "dexterity":
              setDexterity(abilityScore.score);
              break;
            case "constitution":
              setConstitution(abilityScore.score);
              break;
            case "intelligence":
              setIntelligence(abilityScore.score);
              break;
            case "wisdom":
              setWisdom(abilityScore.score);
              break;
            case "charism":
              setCharism(abilityScore.score);
              break;
          }
        }
      })
      .catch(console.error);
  }, []);
  function finalizeScores() {
    setSubmitDisabled(true);
    let abilityScores = [
      { ability: "strength", score: strength },
      { ability: "dexterity", score: dexterity },
      { ability: "constitution", score: constitution },
      { ability: "intelligence", score: intelligence },
      { ability: "wisdom", score: wisdom },
      { ability: "charism", score: charism },
    ];
    for (let i = 0; i < abilityScores.length; i++) {
      let abilityScore = abilityScores[i];
      if (abilityScore.score < -128 || abilityScore.score > 127) {
        alert("Invalid Numbers, Limit:(-128,127)");
        setSubmitDisabled(false);
        return;
      }
    }
    invoke<boolean>("overwrite_ability_scores", {
      abilityScores: abilityScores,
    })
      .then((result) => {
        //move back to the basic menu to see if they are ready
        setSubmitDisabled(false);
        console.log("reached end of editability and now moving");
        router.back;
      })
      .catch(console.error);
  }
  return (
    <div>
      <h2>Ability Score Editor</h2>
      <hr></hr>
      <div>
        <h3>Strength</h3>
        <input
          type="number"
          value={strength}
          onChange={(e) => setStrength(parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <h3>Dexterity</h3>
        <input
          type="number"
          value={dexterity}
          onChange={(e) => setDexterity(parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <h3>Constitution</h3>
        <input
          type="number"
          value={constitution}
          onChange={(e) => setConstitution(parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <h3>Intelligence</h3>
        <input
          type="number"
          value={intelligence}
          onChange={(e) => setIntelligence(parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <h3>Wisdom</h3>
        <input
          type="number"
          value={wisdom}
          onChange={(e) => setWisdom(parseInt(e.target.value) || 0)}
        />
      </div>
      <div>
        <h3>Charism</h3>
        <input
          type="number"
          value={charism}
          onChange={(e) => setCharism(parseInt(e.target.value) || 0)}
        />
      </div>
      <button disabled={submitDisabled} onClick={() => finalizeScores()}>
        Finish
      </button>
    </div>
  );
};
export default EditAbilityScore;
