"use client";
import { SyntheticEvent, useState } from "react";
import "./rolls.css";
import { checkRoll, getVarList } from "../../helperFunctions";
import { RollEditCard } from "./RollEditCard";
import { invoke } from "@tauri-apps/api";
import { useRouter } from "next/navigation";
import { Roll } from "@/app/globalInterfaces";
interface EditAbilityScoreProps {
  rolls: Roll[];
}
const legitSymbols: String[] = ["+", "-", "*", "/"];
const defaultVars: String[] = ["str", "dex", "con", "int", "wis", "cha"];
export const EditRolls: React.FC<EditAbilityScoreProps> = ({ rolls }) => {
  const router = useRouter();
  let defaultRolls: Roll[] = [
    {
      roll_name: "Initiative",
      default_roll: "d20 + var(dex)",
    },
    {
      roll_name: "Acrobatics",
      default_roll: "d20 + var(dex)",
    },
    {
      roll_name: "Animal_Handling",
      default_roll: "d20 +var(wis)",
    },
    {
      roll_name: "Arcana",
      default_roll: "d20 + var(int)",
    },
    {
      roll_name: "Athletics",
      default_roll: "d20 + var(str)",
    },
    {
      roll_name: "Deception",
      default_roll: "d20 + var(cha)",
    },
    {
      roll_name: "History",
      default_roll: "d20 + var(int)",
    },
    {
      roll_name: "Insight",
      default_roll: "d20 + var(wis)",
    },
    {
      roll_name: "Intimidation",
      default_roll: "d20 + var(cha)",
    },
    {
      roll_name: "Investigation",
      default_roll: "d20 + var(int)",
    },
    {
      roll_name: "Medicine",
      default_roll: "d20 + var(wis)",
    },
    {
      roll_name: "Nature",
      default_roll: "d20 + var(int)",
    },
    {
      roll_name: "Perception",
      default_roll: "d20 + var(wis)",
    },
    {
      roll_name: "Performance",
      default_roll: "d20 + var(cha)",
    },
    {
      roll_name: "Persuasion",
      default_roll: "d20 + var(cha)",
    },
    {
      roll_name: "Religion",
      default_roll: "d20 + var(int)",
    },
    {
      roll_name: "Slight_of_Hand",
      default_roll: "d20 + var(dex)",
    },
    {
      roll_name: "Stealth",
      default_roll: "d20 + var(dex)",
    },
    {
      roll_name: "Survival",
      default_roll: "d20 + var(wis)",
    },
    {
      roll_name: "Strength_Save",
      default_roll: "d20 + var(str)",
    },
    {
      roll_name: "Dexterity_Save",
      default_roll: "d20 + var(dex)",
    },
    {
      roll_name: "Constitution_Save",
      default_roll: "d20 + var(con)",
    },
    {
      roll_name: "Intelligence_Save",
      default_roll: "d20 + var(int)",
    },
    {
      roll_name: "Wisdom_Save",
      default_roll: "d20 + var(wis)",
    },
    {
      roll_name: "Charisma_Save",
      default_roll: "d20 + var(cha)",
    },
  ];
  const [currentRolls, setCurrentRolls] = useState(rolls || defaultRolls);
  const [rollNameInput, setRollNameInput] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [rollDefaultInput, setRollDefaultInput] = useState("");
  const [tooltip, setTooltip] = useState(
    'Hit the "+" to add rolls and "Finish" to move on'
  );

  function finish() {
    //just says every loop finishes
    //ensure no infinate loops in the rolls
    for (let i = 0; i < currentRolls.length; i++) {
      if (!rollTraceTest(currentRolls[i], currentRolls[i])) {
        return;
      }
    }
    //update datasets
    invoke<boolean>("overwrite_rolls", {
      newRolls: currentRolls,
    })
      .then((result) => {
        //move back to the basic menu to see if they are ready
        console.log("finished adding to sql");
        router.push("../../home");
      })
      .catch(console.error);
  }
  function rollTraceTest(
    initialRoll: {
      roll_name: string;
      default_roll: string;
    },
    currentRoll: {
      roll_name: string;
      default_roll: string;
    }
  ): boolean {
    let currentVarList = getVarList(currentRoll.default_roll);
    //if its empty or only contains
    if (
      !currentVarList.some((e) => !defaultVars.includes(e.toLocaleLowerCase()))
    ) {
      return true;
    } else if (
      currentVarList.some(
        (currentVar) =>
          currentVar.toLocaleLowerCase() ===
          initialRoll.roll_name.toLocaleLowerCase()
      )
    ) {
      setTooltip(
        'Failed Finish: rolls call each other infinitely between "' +
          initialRoll.roll_name +
          '" and "' +
          currentRoll.roll_name +
          '"'
      );
      return false;
    } else {
      let responses: boolean[] = [];
      for (let i = 0; i < currentVarList.length; i++) {
        let currentVar = currentVarList[i].toLocaleLowerCase();
        if (!defaultVars.includes(currentVar)) {
          responses.push(
            rollTraceTest(
              initialRoll,
              currentRolls.find(
                (item) => item.roll_name.toLocaleLowerCase() === currentVar
              ) || { roll_name: "couldnotfind", default_roll: "" }
            )
          );
        }
      }
      return !responses.includes(false);
    }
  }

  //need to add final checks of vars existence in all rolls and trace var loops
  //need to add an ability to refresh the rolls
  function addRoll(e: SyntheticEvent) {
    e.preventDefault();
    const target = e.target as typeof e.target & {
      rollName: { value: string };
      roll: { value: string };
    };
    console.log(currentRolls);
    //check if it fits a regix and refresh the roll list if it mactches and is added
    if (target.rollName.value.length < 21) {
      if (
        !currentRolls.some(
          (ex) =>
            ex.roll_name.toLocaleLowerCase() ==
              target.rollName.value.toLocaleLowerCase() ||
            defaultVars.includes(target.rollName.value.toLocaleLowerCase())
        )
      ) {
        let temp = target.rollName.value.trim();
        let tempRoll = target.roll.value.trim();
        if (temp.includes("(") || temp.includes(")")) {
          setTooltip("Failed add: Name cannot have parentheses");
        }
        if (temp !== "" && tempRoll !== "") {
          if (!temp.includes(" ")) {
            let checkRollResult = checkRoll(target.roll.value, currentRolls);
            if (checkRollResult.result) {
              setCurrentRolls((prev) => {
                if (
                  !prev.some(
                    (entry) =>
                      entry.roll_name.toLocaleLowerCase() ===
                      target.rollName.value.toLocaleLowerCase()
                  )
                ) {
                  // add spacing and remove dumb spacing for dumb display overload
                  let idealRoll = "";
                  for (let i = 0; i < tempRoll.length; i++) {
                    let char = tempRoll.charAt(i);
                    if (char === " ") {
                      //only my spaces are allowed >:^D
                    } else if (legitSymbols.includes(char)) {
                      idealRoll += " " + char + " ";
                    } else {
                      idealRoll += char;
                    }
                  }
                  prev.push({
                    roll_name: target.rollName.value,
                    default_roll: idealRoll,
                  });
                }
                return prev;
              });
              setRollNameInput("");
              setRollDefaultInput("");
              setTooltip(' "' + target.rollName.value + '" has been added');
            } else {
              setTooltip(checkRollResult.desc);
            }
          } else {
            setTooltip("Failed add: Name cannot contain spaces");
          }
        } else {
          setTooltip("Failed add: Name or roll input field empty");
        }
      } else {
        setTooltip("Failed add: This name is already taken");
      }
    } else {
      setTooltip("Failed add: name is limited to 20 characters");
    }
  }

  function removeRoll(removedName: string) {
    setCurrentRolls((prev) => {
      let output = prev.filter(
        (e) =>
          e.roll_name.toLocaleLowerCase() !== removedName.toLocaleLowerCase()
      );
      return output;
    });
  }
  function editRoll(editName: string) {
    let editNameLow = editName.toLocaleLowerCase();
    for (let i = 0; i < currentRolls.length; i++) {
      if (currentRolls[i].roll_name.toLocaleLowerCase() === editNameLow) {
        setRollNameInput(currentRolls[i].roll_name);
        setRollDefaultInput(currentRolls[i].default_roll);
        removeRoll(editName);
        break;
      }
    }
  }

  return (
    <div className="root">
      <h1>Rolls Editor</h1>
      <form
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
        }}
        onSubmit={addRoll}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "50%",
            padding: "0%",
            marginLeft: "15%",
          }}
        >
          <input
            placeholder="Perception"
            className="rollInput"
            name="rollName"
            value={rollNameInput}
            onChange={(e) => setRollNameInput(e.target.value)}
          />
          <input
            placeholder="d20 + var(wis) + var(another_roll) + 3"
            className="rollInput"
            name="roll"
            value={rollDefaultInput}
            onChange={(e) => setRollDefaultInput(e.target.value)}
          />
        </div>
        <button className="addButton" type="submit">
          +
        </button>
        <button className="finishButton" onClick={finish}>
          Finish
        </button>
      </form>
      <h3>{tooltip}</h3>
      <hr></hr>
      <div
        className="horiz"
        style={{ marginRight: "70%", marginLeft: "5%", maxHeight: "5vh" }}
      >
        <input
          style={{ marginLeft: "0px", width: "100%" }}
          placeholder="search by name"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        ></input>
      </div>
      <div className="rollList">
        {currentRolls
          .filter((item) =>
            item.roll_name
              .toLocaleLowerCase()
              .includes(searchInput.toLocaleLowerCase())
          )
          .sort((a, b) => a.roll_name.localeCompare(b.roll_name))
          .map((currentRoll) => {
            return (
              <RollEditCard
                key={currentRoll.roll_name}
                currentRoll={currentRoll}
                removeRoll={() => removeRoll(currentRoll.roll_name)}
                editRoll={() => editRoll(currentRoll.roll_name)}
              ></RollEditCard>
            );
          })}
      </div>
    </div>
  );
};
export default EditRolls;
