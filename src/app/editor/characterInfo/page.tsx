"use client";
import { SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { invoke } from "@tauri-apps/api/tauri";
import { ToastContainer, toast } from "react-toastify";
import { checkRoll } from "@/app/helperFunctions";
import "react-toastify/dist/ReactToastify.css";
interface CharacterInfoProps {
  characterInfoList: { info_type: string; input: string }[];
}
export const CharacterInfo: React.FC<CharacterInfoProps> = ({
  characterInfoList,
}) => {
  const router = useRouter();
  function sendErrorMessage(message: string) {
    toast.warning(message, {
      position: "bottom-center",
    });
  }
  function finish(e: SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      name: { value: string };
      hp: { value: string };
      ac: { value: string };
      mana: { value: string };
    };
    characterInfoList = [
      { info_type: "name", input: target.name.value.trim() },
      { info_type: "hp", input: target.hp.value.trim() },
      { info_type: "ac", input: target.ac.value.trim() },
      { info_type: "mana", input: target.mana.value.trim() },
    ];
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
      <h1>Character Info</h1>
      <form onSubmit={finish}>
        <h2>Character Name</h2>
        <input name="name"></input>
        <h3>Health Points</h3>
        <input name="hp"></input>
        <h3>Armor Class</h3>
        <input name="ac"></input>
        <h3>Max Mana</h3>
        <input name="mana"></input>
        <button type="submit">Finish</button>
      </form>
      <ToastContainer />
    </div>
  );
};
export default CharacterInfo;
