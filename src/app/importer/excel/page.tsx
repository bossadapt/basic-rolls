"use client";
import { invoke } from "@tauri-apps/api/tauri";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "./excel.css";
export const Excel: React.FC = () => {
  const router = useRouter();
  const [sheet, setSheet] = useState("");
  const [disabled, setdisabled] = useState(false);

  //abilitiesSheet
  const [abilityCombined, setAbilityCombined] = useState("");
  function openFileDialog() {
    setdisabled(true);
    invoke<string>("get_file_path_by_file_dialog", {})
      .then((filePath) => {
        setSheet(filePath);
      })
      .catch();
    setdisabled(false);
  }
  function grabExcelInfo(requestedInfo: string) {
    setdisabled(true);
    invoke<string[]>("get_data_from_excel", {
      sheet,
      requestedInfo,
    })
      .then((cellvalues) => {
        cellvalues.forEach((value) => console.log(value));
      })
      .catch();
    setdisabled(false);
  }
  function testSettings() {
    grabExcelInfo(abilityCombined);
  }

  return (
    <div>
      <h1>Sheet Importer</h1>
      <h2>Choose File</h2>
      <div className="horiz">
        <input
          style={{ marginRight: "0px" }}
          value={sheet}
          disabled={disabled}
          onChange={(e) => {
            setSheet(e.target.value);
          }}
        ></input>
        <button
          style={{ marginLeft: "0px" }}
          disabled={disabled}
          onClick={() => openFileDialog()}
        >
          Browse
        </button>
      </div>
      <h2>Overall Settings</h2>
      <div className="horiz">
        <p style={{ marginRight: "10px" }}>All Text Settings Combined:</p>
        <input style={{ marginLeft: "0px", marginRight: "0px" }}></input>
        <button style={{ marginLeft: "0px" }} onClick={() => testSettings()}>
          Test Import Settings
        </button>
      </div>

      <h2>Ability Scores Settings</h2>
      <div className="horiz">
        <p style={{ marginRight: "10px" }}>Ability Text Settings:</p>
        <input
          style={{ marginLeft: "0px" }}
          placeholder="A1:D1 or A1:A4 or A1,B3,B5"
          onChange={(e) => setAbilityCombined(e.target.value)}
        ></input>
      </div>
      <p style={{ marginLeft: "50%" }}>OR</p>
      <div className="horiz">
        <p>STR:</p>
        <input className="inputAbility" placeholder="A1"></input>
        <p>DEX:</p>
        <input className="inputAbility" placeholder="A2"></input>
        <p>CON:</p>
        <input className="inputAbility" placeholder="A3"></input>
        <p>INT:</p>
        <input className="inputAbility" placeholder="B1"></input>
        <p>WIS:</p>
        <input className="inputAbility" placeholder="B2"></input>
        <p>CHA:</p>
        <input className="inputAbility" placeholder="B3"></input>
      </div>

      <h2>Aditional Rolls Settings</h2>
      <div className="horiz">
        <p>Name:</p>
        <input className="inputAbility"></input>
        <p>Hit:</p>
        <input className="inputAbility"></input>
        <p>Damage:</p>
        <input className="inputAbility"></input>
        <button>Add Roll</button>
      </div>

      <button>Finished Importing</button>
    </div>
  );
};
export default Excel;
