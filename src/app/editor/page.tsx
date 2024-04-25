"use client";
import React, { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from "next/navigation";
export const Editor: React.FC = () => {
  const [view, setView] = useState(<div className="loader"></div>);
  const router = useRouter();
  useEffect(() => {
    invoke<
      [
        { rollName: string; defaultRoll: string; rollType: string }[],
        { ability: string; score: number }[]
      ]
    >("get_lists", {})
      .then((result) => {
        const [rolls, abilityScores] = result;
        if (abilityScores.length != 6) {
          console.log("Ran1");
          router.push("/editor/abilityScores");
        } else if (rolls.length == 0) {
          console.log("Ran2");
          router.push("/editor/rolls");
        } else {
          console.log("Ran3");
          router.push("../home");
        }
        console.log("finished grab");
      })
      .catch(console.error);
  }, []);

  return <div>{view}</div>;
};
export default Editor;
