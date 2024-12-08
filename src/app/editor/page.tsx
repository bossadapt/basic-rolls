"use client";
import React, { useEffect, useState } from "react";
import { invoke } from '@tauri-apps/api/core';
import { useRouter } from "next/navigation";
import { ListsResult } from "../globalInterfaces";
export const Editor: React.FC = () => {
  const [view, setView] = useState(<div className="loader"></div>);
  const router = useRouter();
  useEffect(() => {
    invoke<ListsResult>("grab_lists", {})
      .then((result) => {
        console.log("result:", result);
        console.log("charinfo:", result.characterInfo);
        console.log("abilityScore:", result.abilityScores);
        console.log("rolls:", result.rolls);
        console.log("conditions:", result.conditions);
        console.log("actionTypes:", result.actionTypes);

        if (result.characterInfo.length === 0) {
          console.log("character info not there redirecting");
          router.push("/editor/character");
        } else if (result.actionTypes.length === 0) {
          console.log("actionTypes not there redirecting");
          router.push("/editor/actionTypes");
        } else if (result.abilityScores.length != 6) {
          console.log("ability scores not there redirecting");
          router.push("/editor/abilityScores");
        } else if (result.conditions.length === 0) {
          console.log("conditions not there redirecting");
          router.push("/editor/conditions");
        } else if (result.rolls.length === 0) {
          console.log("rolls not there redirecting");
          router.push("/editor/rolls");
        } else {
          console.log("prerequisites fufilled entering main screen");
          router.push("../home");
        }
        console.log("finished grab");
      })
      .catch(console.error);
  }, []);

  return <div>{view}</div>;
};
export default Editor;
