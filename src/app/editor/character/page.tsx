"use client";
import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { invoke } from "@tauri-apps/api/tauri";
import { ToastContainer, toast } from "react-toastify";
import { checkRoll } from "@/app/helperFunctions";
import { CharacterInfo } from "@/app/globalInterfaces";
import "react-toastify/dist/ReactToastify.css";
import EditorTitleAndFinish from "../editorTitleAndFinish";
interface CharacterInfoProps {
  characterInfoList: CharacterInfo[];
}
export const CharacterEditor: React.FC<CharacterInfoProps> = ({
  characterInfoList,
}) => {
  const router = useRouter();
  const [currentCharacterInfoList, setCurrentCharacterInfoList] = useState<
    CharacterInfo[]
  >([
    { info_type: "name", input: "" },
    { info_type: "hp", input: "" },
    { info_type: "ac", input: "" },
    { info_type: "mana", input: "" },
  ]);
  let nameInfo = currentCharacterInfoList[0]!;
  let hpInfo = currentCharacterInfoList[1]!;
  let acInfo = currentCharacterInfoList[2]!;
  let manaInfo = currentCharacterInfoList[3]!;
  function sendErrorMessage(message: string) {
    toast.warning(message, {
      position: "bottom-center",
    });
  }
  function updateCurrentCharacterInfo(info_type: string, input: string) {
    setCurrentCharacterInfoList((prev) => {
      prev = prev.map((info) => {
        if (info.info_type === info_type) {
          return { info_type: info_type, input: input };
        }
        return info;
      });
      return prev;
    });
  }
  function finish() {
    characterInfoList = currentCharacterInfoList.map((currentInfo) => {
      return { info_type: currentInfo.info_type, input: currentInfo.input };
    });
    //checks
    for (let i = 0; i < characterInfoList.length; i++) {
      if (characterInfoList[i].input === "") {
        sendErrorMessage("Field left empty: " + characterInfoList[i].info_type);
        return;
      }
      if (characterInfoList[i].info_type !== "name") {
        let characterInfoCheck = checkRoll(characterInfoList[i].input, []);
        if (!characterInfoCheck.result) {
          sendErrorMessage(
            'Error found in "' +
              characterInfoList[i].info_type +
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
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        maxHeight: "100vh",
        width: "100vw",
        maxWidth: "100vw",
      }}
    >
      <EditorTitleAndFinish
        title="Character Info Editor"
        handleFinishButton={finish}
      ></EditorTitleAndFinish>
      <h2>Character Name</h2>
      <input
        value={nameInfo.input}
        onChange={(eve) =>
          updateCurrentCharacterInfo(nameInfo.info_type, eve.target.value)
        }
      ></input>
      <h3>Health Points</h3>
      <input
        value={hpInfo.input}
        onChange={(eve) =>
          updateCurrentCharacterInfo(hpInfo.info_type, eve.target.value)
        }
      ></input>
      <h3>Armor Class</h3>
      <input
        value={acInfo.input}
        onChange={(eve) =>
          updateCurrentCharacterInfo(acInfo.info_type, eve.target.value)
        }
      ></input>
      <h3>Max Mana</h3>
      <input
        value={manaInfo.input}
        onChange={(eve) =>
          updateCurrentCharacterInfo(manaInfo.info_type, eve.target.value)
        }
      ></input>
      <ToastContainer />
    </div>
  );
};
export default CharacterEditor;
