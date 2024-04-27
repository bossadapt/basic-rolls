"use client";
import { SyntheticEvent, useState } from "react";
import "./rolls.css";
import { RollEditCard } from "./RollEditCard";
import { invoke } from "@tauri-apps/api";
import { useRouter } from "next/navigation";
interface EditAbilityScoreProps {
  rolls: { roll_name: string; default_roll: string }[];
}
const legitSymbols: String[] = ["+", "-", "*", "/"];
const defaultVars: String[] = ["str", "dex", "con", "int", "wis", "cha"];
export const EditRolls: React.FC<EditAbilityScoreProps> = ({ rolls }) => {
  const router = useRouter();
  const [currentRolls, setCurrentRolls] = useState(rolls || []);
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
            if (rollCheck(target.roll.value)) {
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
              //this is covered by case basis inside of roll check
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
  function rollCheck(rollString: String): boolean {
    rollString = rollString.toLowerCase();
    rollString = rollString.replaceAll(" ", "");
    //legal characters:
    //2d20 || d6
    // + || * || /
    //3
    //var(something)
    let paranthesis: string[] = ["(", ")"];
    let legitDigits: string[] = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
    ];
    let legitCharacters: String[] = ["d", "v"];
    //steps to converting:
    //initial                      d20+(3d20 * var(Dex)) -  3 +var(dex)/ 5
    //removing spaces and caps:    d20+(3d20*var(dex))-3+3/5
    //change vars to numbers:      d20+(3d20*12)-3+3/5
    //changing dice to numbers:    12+(30*12)-3+3/5
    //change parenthesis to num:   12+360-3+3/5
    //continue to follow pemdas:   369/5
    //done:                        73.8

    // crtical errors(that return false):
    //x empty ("") but is taken care of prior
    //x parenthesis do not close ((())
    //x var does not exist (var(fake))
    //x illegal characters ([#)@$])
    //x starts or ends with symbol  (* 12 *)
    //x dice has number on the right of it ("10 + 1d + 3 + d")
    //(did not do, will catch when rolling) math not possible(for at least the static numbers)

    //full check in one loop(more confusing but less loops)
    //check for illegal characters and check that dice have digits with them

    //todo get rid of legit digits and do an ascii check
    let leftParCounter = 0;
    let rightParCounter = 0;
    for (let i = 0; i < rollString.length; i++) {
      let char = rollString.charAt(i);
      if (legitDigits.some((dig) => dig == char)) {
        //pass
      } else if (char == "(") {
        leftParCounter += 1;
        if (rollString.length !== i + 1 && rollString.charAt(i + 1) === ")") {
          setTooltip("Failed add: empty parenthesis");
          return false;
        }
      } else if (char == ")") {
        rightParCounter += 1;
        if (rightParCounter > leftParCounter) {
          setTooltip(
            'Failed add: Parenthesis do not close: ")" came before "("'
          );
          return false;
        }
      } else if (legitSymbols.includes(char)) {
        //symbol checks
        if (i == 0 || i == rollString.length - 1) {
          setTooltip("Failed add: symbol used at the start or end");
          return false;
        } else if (legitSymbols.includes(rollString.charAt(i - 1))) {
          setTooltip(
            'Failed add: two symbols next to eachother "' +
              char +
              rollString.charAt(i - 1) +
              '"'
          );
          return false;
        } else if (rollString.charAt(i - 1) == "(") {
          setTooltip('Failed add: symbol facing parenthesis "(' + char + '"');
          return false;
        } else if (rollString.charAt(i + 1) == ")") {
          setTooltip('Failed add: symbol facing parenthesis "' + char + ')"');
          return false;
        }
      } else if (char == "d") {
        //ensure that dice are fully established
        if (
          i + 1 === rollString.length ||
          !legitDigits.some((e) => e == rollString.charAt(i + 1))
        ) {
          setTooltip("Dice established but does not have digit following it");
          return false;
        }
      } else if (char == "v") {
        //ran into a variable(skip it if it fills the var rules)
        if (
          i + 4 >= rollString.length ||
          rollString.substring(i, i + 4) !== "var("
        ) {
          setTooltip('Invalid character of "' + char + '"');
        } else {
          i += 4;
          while (char != ")") {
            i += 1;
            char = rollString.charAt(i);
            if (i >= rollString.length) {
              setTooltip('Failed add: Parenthesis do not close: "var("');
              return false;
            }
          }
        }
      } else {
        setTooltip('Invalid character of "' + char + '"');
        return false;
      }
    }

    if (leftParCounter != rightParCounter) {
      setTooltip('Failed add: Parenthesis do not close: ")" missing');
      return false;
    }

    //check if vars exist(see if it exists in rolls or is an inbuilt ability score)
    let varList = getVarList(rollString);
    if (checkVars(varList)) {
      return true;
    } else {
      return false;
    }
  }
  function getVarList(roll: String): String[] {
    let varList = [];
    //first find var(
    //then find )
    //inbetween is the var name
    for (let i = 3; i < roll.length; i++) {
      if (roll.charAt(i) == "(" && roll.substring(i - 3, i) == "var") {
        let variable = [];
        i += 1;
        while (roll.charAt(i) != ")") {
          variable.push(roll.charAt(i));
          i += 1;
        }
        varList.push(variable.join(""));
      }
    }
    return varList;
  }
  //ensure vars in a roll exist
  function checkVars(vars: String[]): boolean {
    for (let i = 0; i < vars.length; i++) {
      //it does not exist in neither as a generic ability score or another roll
      let currentVar = vars[i].toLocaleLowerCase();
      if (
        !defaultVars.some((e) => e === currentVar) &&
        !currentRolls.some(
          (e) => e.roll_name.toLocaleLowerCase() === currentVar
        )
      ) {
        setTooltip('Variable "' + vars[i] + '" does not exist');
        return false;
      }
    }
    return true;
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
    <div>
      <h1>Rolls Editor</h1>
      <div className="horiz">
        <form style={{ width: "100%" }} onSubmit={addRoll} className="horiz">
          <div style={{ width: "50%", padding: "0%", marginLeft: "15%" }}>
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
        </form>
        <button className="finishButton" onClick={finish}>
          Finish
        </button>
      </div>
      <h3>{tooltip}</h3>
      <hr></hr>
      <div className="horiz" style={{ marginRight: "70%", marginLeft: "5%" }}>
        <input
          style={{ marginLeft: "0px", width: "100%" }}
          placeholder="search by name"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        ></input>
      </div>
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
  );
};
export default EditRolls;
