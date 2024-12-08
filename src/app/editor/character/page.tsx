"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { invoke } from "@tauri-apps/api/core";
import { ToastContainer, toast } from "react-toastify";
import { checkRoll } from "@/app/helperFunctions";
import { CharacterInfo } from "@/app/globalInterfaces";
import "react-toastify/dist/ReactToastify.css";
import EditorTitleAndFinish from "../editorTitleAndFinish";
import "./character.css";
export const CharacterEditor: React.FC = () => {
  const router = useRouter();
  let defaultCharacterInfo: CharacterInfo[] = [
    { infoType: "name", input: "" },
    { infoType: "hp", input: "" },
    { infoType: "ac", input: "" },
    { infoType: "mana", input: "" },
  ];
  const [currentCharacterInfoList, setCurrentCharacterInfoList] =
    useState<CharacterInfo[]>(defaultCharacterInfo);
  let nameInfo = currentCharacterInfoList[0]!;
  let hpInfo = currentCharacterInfoList[1]!;
  let acInfo = currentCharacterInfoList[2]!;
  let manaInfo = currentCharacterInfoList[3]!;
  useEffect(() => {
    invoke<CharacterInfo[]>("grab_character_info", {})
      .then((result) => {
        if (result.length > 0) {
          setCurrentCharacterInfoList(result);
        }
      })
      .catch(console.error);
  }, []);
  function sendErrorMessage(message: string) {
    toast.warning(message, {
      position: "bottom-center",
    });
  }
  function updateCurrentCharacterInfo(infoType: string, input: string) {
    setCurrentCharacterInfoList((prev) => {
      prev = prev.map((info) => {
        if (info.infoType === infoType) {
          return { infoType: infoType, input: input };
        }
        return info;
      });
      return prev;
    });
  }
  function finish() {
    let characterInfoList = currentCharacterInfoList.map((currentInfo) => {
      return { infoType: currentInfo.infoType, input: currentInfo.input };
    });
    //checks
    for (let i = 0; i < characterInfoList.length; i++) {
      if (characterInfoList[i].input === "") {
        sendErrorMessage("Field left empty: " + characterInfoList[i].infoType);
        return;
      }
      if (characterInfoList[i].infoType !== "name") {
        let characterInfoCheck = checkRoll(characterInfoList[i].input, []);
        if (!characterInfoCheck.result) {
          sendErrorMessage(
            'Error found in "' +
              characterInfoList[i].infoType +
              '" is: ' +
              characterInfoCheck.desc
          );
          return;
        }
      }
    }
    //passed checks:
    invoke<boolean>("overwrite_character_info", {
      characterInfoList: characterInfoList,
    })
      .then((result) => {
        //move back to the basic menu to see if they are ready to move to the main screen
        router.push("/editor");
      })
      .catch(console.error);
  }
  return (
    <div className="characterContents">
      <EditorTitleAndFinish
        title="Character Info Editor"
        handleFinishButton={finish}
      ></EditorTitleAndFinish>
      <h2>Character Name</h2>
      <input
        value={nameInfo.input}
        onChange={(eve) =>
          updateCurrentCharacterInfo(nameInfo.infoType, eve.target.value)
        }
      ></input>
      <h3>Health Points</h3>
      <input
        value={hpInfo.input}
        onChange={(eve) =>
          updateCurrentCharacterInfo(hpInfo.infoType, eve.target.value)
        }
      ></input>
      <h3>Armor Class</h3>
      <input
        value={acInfo.input}
        onChange={(eve) =>
          updateCurrentCharacterInfo(acInfo.infoType, eve.target.value)
        }
      ></input>
      <h3>Max Mana</h3>
      <input
        value={manaInfo.input}
        onChange={(eve) =>
          updateCurrentCharacterInfo(manaInfo.infoType, eve.target.value)
        }
      ></input>
      <ToastContainer />
    </div>
  );
};
export default CharacterEditor;
