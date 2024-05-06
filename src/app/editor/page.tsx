"use client";
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from "next/navigation";
import { Roll, AbilityScore, CharacterInfo } from "../globalInterfaces";
export const Editor: React.FC = () => {
  const [view, setView] = useState(<div className="loader"></div>);
  const router = useRouter();
  useEffect(() => {
    invoke<[Roll[], AbilityScore[], CharacterInfo[]]>("get_lists", {})
      .then((result) => {
        const [rolls, abilityScores, characterInfoList] = result;
        if (characterInfoList.length == 0) {
          console.log("character info not there redirecting");
          router.push("/editor/characterInfo");
        } else if (abilityScores.length != 6) {
          console.log("ability scores not there redirecting");
          router.push("/editor/abilityScores");
        } else if (rolls.length == 0) {
          console.log("rolls not there redirecting");
          router.push("/editor/rolls");
        } else {
          console.log("prerequisites fufilled entering main screen");
          router.push("/editor/conditions");
          //router.push("../home");
        }
        console.log("finished grab");
      })
      .catch(console.error);
  }, []);

  return <div>{view}</div>;
};
export default Editor;
