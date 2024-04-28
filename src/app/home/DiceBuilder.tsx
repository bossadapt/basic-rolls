import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { checkRoll } from "../helperFunctions";
import "react-toastify/dist/ReactToastify.css";
interface HistoryRoll {
  id: number;
  roll: string;
  type: string;
}
interface DiceBuilderProps {
  abilityScores: { ability: string; score: number }[];
  rolls: { roll_name: string; default_roll: string }[];
}
//TODO fix history and implement notifications on the tool tips
export const DiceBuilder: React.FC<DiceBuilderProps> = ({
  abilityScores,
  rolls,
}) => {
  const legitDigits: string[] = [
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
  let assistDiceOptions = [
    " d4 ",
    " d6 ",
    " d8 ",
    " d10 ",
    " d12 ",
    " d20 ",
    " var(",
    ") ",
  ];
  let assistSymbolOptions = [" - ", " + ", "*", " / "];
  const [historyRolls, setHistoryRolls] = useState<HistoryRoll[]>([]);
  const [search, setSearch] = useState("");
  const [currentRoll, setCurrentRoll] = useState("");
  function sendErrorMessage(message: string) {
    toast.warning(message, {
      position: "bottom-right",
    });
  }
  function convertToAdvantageType(roll: string, advantageType: string): string {
    let addedCharacterCount = 0;
    for (let i = 0; i < roll.length + addedCharacterCount; i++) {
      if (roll.charAt(i) === "d") {
        let diceCountString = "";
        let tempIndex = i;
        let diceAmmount = "";
        tempIndex -= 1;
        while (tempIndex > -1 && legitDigits.includes(roll.charAt(tempIndex))) {
          diceCountString += roll.charAt(tempIndex);
          tempIndex -= 1;
        }
        i++;
        while (legitDigits.includes(roll.charAt(i))) {
          diceAmmount += roll.charAt(i);
          i++;
        }
        addedCharacterCount += 3;
        let diceCount;
        if (diceCountString.length == 0) {
          diceCount = 1;
        } else {
          diceCount = Number(diceCountString);
        }
        //removes all of the dice 2d20 and switches it with 4d20k(h/l)2
        roll =
          roll.substring(0, tempIndex + 1 - diceCountString.length) +
          diceCount * 2 +
          "d" +
          diceAmmount +
          advantageType +
          diceCount +
          roll.substring(i, roll.length);
      }
    }
    return roll;
  }

  function convertToCrit(roll: string) {
    let addedCharacterCount = 0;
    for (let i = 0; i < roll.length + addedCharacterCount; i++) {
      if (roll.charAt(i) === "d") {
        let diceCountString = "";
        let tempIndex = i;
        let diceAmmount = "";
        tempIndex -= 1;
        while (tempIndex > -1 && legitDigits.includes(roll.charAt(tempIndex))) {
          diceCountString += roll.charAt(tempIndex);
          tempIndex -= 1;
        }
        i++;
        while (legitDigits.includes(roll.charAt(i))) {
          diceAmmount += roll.charAt(i);
          i++;
        }
        addedCharacterCount += 3;
        let diceCount;
        if (diceCountString.length == 0) {
          diceCount = 1;
        } else {
          diceCount = Number(diceCountString);
        }
        //removes all of the dice 2d20 and switches it with 4d20
        roll =
          roll.substring(0, tempIndex + 2 - diceCountString.length) +
          diceCount * 2 +
          "d" +
          diceAmmount +
          roll.substring(i, roll.length);
      }
    }
    return roll;
  }

  function getRollByName(varName: string): string {
    let rollAttempt = rolls.find(
      (currentRoll) =>
        currentRoll.roll_name.toLocaleLowerCase() == varName.toLocaleLowerCase()
    );
    if (rollAttempt) {
      return rollAttempt.default_roll;
    }
    let abilityAttempt = abilityScores.find(
      (ability) =>
        ability.ability.toLocaleLowerCase().substring(0, 3) ==
        varName.toLocaleLowerCase()
    );
    if (abilityAttempt) {
      return convertAbilityScoreToModif(abilityAttempt.score).toString();
    }
    return "";
  }
  function exposeVars(roll: string): string {
    if (!roll.includes("var(")) {
      return roll;
    } else {
      let varCollection: {
        varRoll: string;
        indexStart: number;
        indexEnd: number;
      }[] = [];
      for (let i = 0; i < roll.length; i++) {
        if (roll.charAt(i) == "v") {
          let indexFound = i;
          let varName = "";
          //skipping the rest of the declaration "ar("
          i += 4;
          while (roll.charAt(i) !== ")") {
            varName += roll.charAt(i);
            i++;
          }
          varCollection.push({
            varRoll: exposeVars(getRollByName(varName)),
            indexStart: indexFound,
            indexEnd: i,
          });
        }
      }
      for (let i2 = varCollection.length - 1; i2 > -1; i2--) {
        roll =
          roll.substring(0, varCollection[i2].indexStart) +
          varCollection[i2].varRoll +
          roll.substring(varCollection[i2].indexEnd + 1);
      }
      return roll;
    }
  }
  function finishRoll(rollType: string) {
    //verify the roll(rollable)
    let roll = currentRoll;
    roll = roll.toLocaleLowerCase();
    roll = roll.replaceAll(" ", "");
    if (roll === "") {
      sendErrorMessage("Failed Add: empty roll");
      return;
    }
    let checkRollResult = checkRoll(roll, rolls);
    if (checkRollResult.result) {
      //exchange all vars for real rolls(also the vars in those vars)
      roll = exposeVars(roll);
      //change roll according to type
      if (rollType === "normal") {
      } else if (rollType === "disadvantage") {
        roll = convertToAdvantageType(roll, "kl");
      } else if (rollType === "advantage") {
        roll = convertToAdvantageType(roll, "kh");
      } else if (rollType === "crit") {
        roll = convertToCrit(roll);
      } else {
        sendErrorMessage("Invalid roll type");
        return;
      }
      setHistoryRolls((previousHistory) => {
        console.log("Reached setHistory");
        let id = 0;
        if (previousHistory.length > 0) {
          id = previousHistory[previousHistory.length - 1].id + 1;
        }
        let newRoll = { id: id, roll, type: rollType };
        if (
          previousHistory.length === 0 ||
          previousHistory[previousHistory.length - 1].roll !== newRoll.roll ||
          previousHistory[previousHistory.length - 1].type !== newRoll.type
        ) {
          console.log("Passed: " + newRoll);
          previousHistory.push(newRoll);
        } else {
          console.log("FAILED: " + newRoll);
        }
        console.log("Push setHistory, reached:" + previousHistory);
        //have to do this or it does not recognize a push as a change
        return previousHistory.slice();
      });
      //copy to clipboard and add to history
      navigator.clipboard.writeText("/r " + roll);
      console.log("finished FinishRolls with: " + roll);
    } else {
      sendErrorMessage(checkRollResult.desc);
    }
  }

  function convertAbilityScoreToModif(abilityScore: number): number {
    return Math.floor((abilityScore - 10) / 2);
  }

  return (
    <div className="dice-builder">
      <h2 className="categoryTitle">Dice Builder</h2>
      <input
        placeholder="search all vars"
        style={{ width: "25%", marginLeft: "1.6666%", marginRight: "auto" }}
        value={search}
        onChange={(evt) => setSearch(evt.target.value)}
      ></input>

      <div
        style={{
          display: "flex",
          flexDirection: "row",
          width: "100vw",
        }}
      >
        <div className="rollTables">
          <table style={{ width: "100%" }}>
            <thead className="tableHead">
              <tr>
                <th scope="col">Ability Score</th>
                <th scope="col">Roll</th>
              </tr>
            </thead>
            <tbody>
              {abilityScores
                .filter((item) => {
                  let stringScore =
                    convertAbilityScoreToModif(item.score) +
                    "(" +
                    item.score +
                    ")";
                  return (
                    item.ability
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase()) ||
                    stringScore
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase())
                  );
                })
                .map((ability) => {
                  return (
                    <tr
                      key={ability.ability}
                      className="rollRow"
                      onClick={() =>
                        setCurrentRoll((cur) => {
                          return (
                            cur +
                            " var(" +
                            ability.ability.substring(0, 3) +
                            ")"
                          );
                        })
                      }
                    >
                      <th>{ability.ability}</th>
                      <td>
                        {convertAbilityScoreToModif(ability.score) +
                          "(" +
                          ability.score +
                          ") "}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="rollTables">
          <table style={{ width: "100%" }}>
            <thead className="tableHead">
              <tr>
                <th scope="col">Roll Name</th>
                <th scope="col">Roll</th>
              </tr>
            </thead>
            <tbody>
              {rolls
                .filter((item) => {
                  return (
                    item.default_roll
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase()) ||
                    item.roll_name
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase())
                  );
                })
                .map((roll) => {
                  return (
                    <tr
                      key={roll.roll_name}
                      className="rollRow"
                      onClick={() =>
                        setCurrentRoll((cur) => {
                          return cur + " var(" + roll.roll_name + ") ";
                        })
                      }
                    >
                      <th>{roll.roll_name}</th>
                      <td>{roll.default_roll}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
        <div className="rollTables">
          <table style={{ width: "100%" }}>
            <thead className="tableHead">
              <tr>
                <th scope="col">History Roll</th>
                <th scope="col">modif used</th>
              </tr>
            </thead>
            <tbody>
              {historyRolls
                .filter((historyRoll) => {
                  return (
                    historyRoll.roll
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase()) ||
                    historyRoll.type
                      .toLocaleLowerCase()
                      .includes(search.toLocaleLowerCase())
                  );
                })
                .sort((a, b) => b.id - a.id)
                .map((historyRoll) => {
                  return (
                    <tr
                      key={historyRoll.id}
                      className="rollRow"
                      onClick={() =>
                        setCurrentRoll((cur) => {
                          return cur + " (" + historyRoll.roll + ")";
                        })
                      }
                    >
                      <th>{historyRoll.roll}</th>
                      <td>{historyRoll.type}</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="horiz" style={{ width: "75%" }}>
        {assistDiceOptions.map((option) => {
          return (
            <button
              key={option}
              className="speedButton"
              onClick={() =>
                setCurrentRoll((cur) => {
                  return cur + option;
                })
              }
            >
              {option}
            </button>
          );
        })}
        {assistSymbolOptions.map((symbol) => {
          return (
            <button
              key={symbol}
              className="speedButton"
              onClick={() =>
                setCurrentRoll((cur) => {
                  return cur + symbol;
                })
              }
            >
              {symbol}
            </button>
          );
        })}
      </div>
      <div className="horiz">
        <button onClick={() => setCurrentRoll("")}>X</button>
        <input
          placeholder="type to edit roll or press"
          style={{ width: "75%", fontSize: "18px" }}
          value={currentRoll}
          onChange={(evt) => setCurrentRoll(evt.target.value)}
        ></input>
        <button onClick={() => finishRoll("disadvantage")}>Disadvantage</button>
        <button onClick={() => finishRoll("normal")}>Normal</button>
        <button onClick={() => finishRoll("advantage")}>Advantage</button>
        <button onClick={() => finishRoll("crit")}>CRIT</button>
      </div>
      <ToastContainer />
    </div>
  );
};
