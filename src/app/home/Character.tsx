import { Dispatch, SetStateAction, useEffect, useState } from "react";
import "./character.css";
import "./home.css";
import { ToastContainer, toast } from "react-toastify";
interface CharacterProps {
  characterInfo: { info_type: string; input: string }[];
  setCharacterInfo: Dispatch<
    SetStateAction<{ info_type: string; input: string }[]>
  >;
}

export const Character: React.FC<CharacterProps> = ({
  characterInfo,
  setCharacterInfo,
}) => {
  const [healthChange, setHealthChange] = useState("");
  const [tempHealth, setTempHealth] = useState(0);
  const [manaChange, setManaChange] = useState("");
  //turning array into callable/readable names
  let characterName = characterInfo.find(
    (infoBit) => infoBit.info_type === "name"
  )!.input;
  let characterHealth = characterInfo.find(
    (infoBit) => infoBit.info_type === "hp"
  )!.input;
  let characterAC = characterInfo.find(
    (infoBit) => infoBit.info_type === "ac"
  )!.input;
  let characterMana = characterInfo.find(
    (infoBit) => infoBit.info_type === "mana"
  )!.input;

  function setName(name: string) {
    setCharacterInfo((prevCharacterList) => {
      let index = prevCharacterList.findIndex(
        (infoBit) => infoBit.info_type === "name"
      )!;
      prevCharacterList[index] = { info_type: "name", input: name };
      return prevCharacterList.slice();
    });
  }
  function sendWarning(warning: string) {
    toast.warning(warning, {
      position: "top-left",
    });
  }
  function addHealth() {
    let ammount = healthChange;
    let ammountNumber = Number(ammount);
    if (!Number.isNaN(ammountNumber)) {
      setHP(String(Number(characterHealth) + ammountNumber));
      setHealthChange("");
    } else {
      sendWarning("Invalid Number in health add");
    }
  }
  function subHealth() {
    let ammount = healthChange;
    let ammountNumber = Number(ammount);
    if (!Number.isNaN(ammountNumber)) {
      if (tempHealth > 0) {
        if (tempHealth > ammountNumber) {
          setTempHealth((temp) => {
            return temp - ammountNumber;
          });
          return;
        } else {
          ammountNumber = ammountNumber - tempHealth;
          setTempHealth(0);
        }
      }
      setHP(String(Number(characterHealth) - ammountNumber));
      setHealthChange("");
    } else {
      sendWarning("Invalid Number in health sub");
    }
  }
  function addMana() {
    let ammount = manaChange;
    let ammountNumber = Number(ammount);
    if (!Number.isNaN(ammountNumber)) {
      setMana(String(Number(characterMana) + ammountNumber));
      setManaChange("");
    } else {
      sendWarning("Invalid Number in mana add");
    }
  }
  function subMana() {
    let ammount = manaChange;
    let ammountNumber = Number(ammount);
    if (!Number.isNaN(ammountNumber)) {
      setMana(String(Number(characterMana) - ammountNumber));
      setManaChange("");
    } else {
      sendWarning("Invalid Number in health sub");
    }
  }
  function setHP(hp: string) {
    setCharacterInfo((prevCharacterList) => {
      let index = prevCharacterList.findIndex(
        (infoBit) => infoBit.info_type === "hp"
      )!;
      prevCharacterList[index] = { info_type: "hp", input: hp };
      return prevCharacterList.slice();
    });
  }
  function setAC(ac: string) {
    setCharacterInfo((prevCharacterList) => {
      let index = prevCharacterList.findIndex(
        (infoBit) => infoBit.info_type === "ac"
      )!;
      prevCharacterList[index] = { info_type: "ac", input: ac };
      return prevCharacterList.slice();
    });
  }
  function setMana(mana: string) {
    setCharacterInfo((prevCharacterList) => {
      let index = prevCharacterList.findIndex(
        (infoBit) => infoBit.info_type === "mana"
      )!;
      prevCharacterList[index] = { info_type: "mana", input: mana };
      return prevCharacterList.slice();
    });
  }
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        maxWidth: "100%",
        overflow: "hidden",
      }}
    >
      <h2 className="categoryTitle">{characterName}</h2>
      <h4 className="sectionTitle" style={{ color: "red" }}>
        HEALTH
      </h4>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <h4 className="inputDescription">CUR:</h4>
        <input
          value={characterHealth}
          type="number"
          className="inputCharacterField"
          onChange={(ev) => setHP(ev.target.value)}
        ></input>
        <h4 className="inputDescription">TEMP:</h4>
        <input
          type="number"
          className="inputCharacterField"
          value={tempHealth}
          onChange={(ev) => setTempHealth(Number(ev.target.value))}
        ></input>
        <div style={{ borderBottom: "0px", width: "25%" }}>
          <button className="changeButtonPlus" onClick={() => addHealth()}>
            +
          </button>
          <button className="changeButtonSub" onClick={() => subHealth()}>
            -
          </button>
        </div>
        <input
          className="inputCharacterField"
          type="number"
          value={healthChange}
          onChange={(eve) => {
            setHealthChange(eve.target.value);
          }}
        ></input>
      </div>
      <h4 className="sectionTitle" style={{ color: "blue" }}>
        MANA
      </h4>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <h4 className="inputDescription">CUR:</h4>
        <input
          onChange={(ev) => setMana(ev.target.value)}
          type="number"
          className="inputCharacterField"
          value={characterMana}
        ></input>
        <div style={{ borderBottom: "0px", width: "25%" }}>
          <button className="changeButtonPlus" onClick={() => addMana()}>
            +
          </button>
          <button className="changeButtonSub" onClick={() => subMana()}>
            -
          </button>
        </div>
        <input
          className="inputCharacterField"
          type="number"
          inputMode="numeric"
          value={manaChange}
          onChange={(eve) => {
            setManaChange(eve.target.value);
          }}
        ></input>
      </div>
      <ToastContainer />
    </div>
  );
};
