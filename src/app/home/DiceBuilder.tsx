import { useState } from "react";
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
  const [toolTip, setTooltip] = useState("");
  const [currentRoll, setCurrentRoll] = useState("");

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
    console.log('varName: "' + varName + '"');
    let rollAttempt = rolls.find(
      (currentRoll) =>
        currentRoll.roll_name.toLocaleLowerCase() == varName.toLocaleLowerCase()
    );
    console.log("Roll Attempt:" + rollAttempt);
    if (rollAttempt) {
      return rollAttempt.default_roll;
    }
    let abilityAttempt = abilityScores.find(
      (ability) =>
        ability.ability.toLocaleLowerCase().substring(0, 3) ==
        varName.toLocaleLowerCase()
    );
    console.log("Ability Attempt:" + abilityAttempt);
    if (abilityAttempt) {
      return ((abilityAttempt.score - 10) / 2).toString();
    }
    console.log("could not find the var");
    return "";
  }
  function exposeVars(roll: string): string {
    console.log("exposed vars called again with: " + roll);
    if (!roll.includes("var(")) {
      console.log("ran out of vars returning now:" + roll);
      return roll;
    } else {
      console.log("else of expose ran");
      let varCollection: {
        varRoll: string;
        indexStart: number;
        indexEnd: number;
      }[] = [];
      for (let i = 0; i < roll.length; i++) {
        console.log("loop 1 running");
        if (roll.charAt(i) == "v") {
          let indexFound = i;
          let varName = "";
          //skipping the rest of the declaration "ar("
          i += 4;
          while (roll.charAt(i) !== ")") {
            console.log("while 1 running");
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
        console.log(varCollection[i2]);
        console.log("loop 2 running");
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
    console.log(
      'reached finishRoll with currentRoll: "' +
        roll +
        '", rollType:' +
        rollType
    );
    roll = roll.toLocaleLowerCase();
    roll = roll.replaceAll(" ", "");
    if (rollCheck(roll)) {
      console.log("finished checking rolls");
      //exchange all vars for real rolls(also the vars in those vars)
      roll = exposeVars(roll);
      //change roll according to type
      console.log(rollType === "normal");
      if (rollType === "normal") {
        console.log("type equal to normal");
      } else if (rollType === "disadvantage") {
        console.log("type equal to disadv");
        roll = convertToAdvantageType(roll, "kl");
      } else if (rollType === "advantage") {
        console.log("type equal to adv");
        roll = convertToAdvantageType(roll, "kh");
      } else if (rollType === "crit") {
        console.log("type equal to crit");
        roll = convertToCrit(roll);
      } else {
        setTooltip("Invalid roll type");
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
          (previousHistory[previousHistory.length - 1].roll !== newRoll.roll &&
            previousHistory[previousHistory.length - 1].type !== newRoll.type)
        ) {
          previousHistory.push(newRoll);
        }
        console.log("Push setHistory, reached:" + newRoll);
        return previousHistory;
      });
      //copy to clipboard and add to history
      navigator.clipboard.writeText("/r " + roll);
      console.log("finished FinishRolls with: " + roll);
    } else {
      console.log("FAILED A ROLL CHECK with " + roll);
      console.log("tooltip: " + toolTip);
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
  function checkVars(varList: String[]) {
    for (let item of varList) {
      if (
        rolls.some(
          (roll) =>
            roll.roll_name.toLocaleLowerCase() === item.toLocaleLowerCase()
        ) ||
        abilityScores.some(
          (ability) =>
            ability.ability.substring(0, 3).toLocaleLowerCase() ===
            item.toLocaleLowerCase()
        )
      ) {
        //pass because it does exist
      } else {
        console.log('var "' + item + '" does not exist');
        setTooltip('var "' + item + '" does not exist');
        return false;
      }
    }
    return true;
  }
  function rollCheck(rollString: String): boolean {
    rollString = rollString.toLowerCase();
    rollString = rollString.replaceAll(" ", "");
    //legal characters:
    //2d20 || d6
    // + || * || /
    //3
    //var(something)
    const legitSymbols: String[] = ["+", "-", "*", "/", "^"];
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
          console.log("reached failed 1");
          return false;
        }
      } else if (char == ")") {
        rightParCounter += 1;
        if (rightParCounter > leftParCounter) {
          setTooltip(
            'Failed add: Parenthesis do not close: ")" came before "("'
          );
          console.log("reached failed 2");
          return false;
        }
      } else if (legitSymbols.includes(char)) {
        //symbol checks
        if (i == 0 || i == rollString.length - 1) {
          setTooltip("Failed add: symbol used at the start or end");
          console.log("reached failed 3");
          return false;
        } else if (legitSymbols.includes(rollString.charAt(i - 1))) {
          setTooltip(
            'Failed add: two symbols next to eachother "' +
              char +
              rollString.charAt(i - 1) +
              '"'
          );
          console.log("reached failed 4");
          return false;
        } else if (rollString.charAt(i - 1) == "(") {
          setTooltip('Failed add: symbol facing parenthesis "(' + char + '"');
          console.log("reached failed 5");
          return false;
        } else if (rollString.charAt(i + 1) == ")") {
          setTooltip('Failed add: symbol facing parenthesis "' + char + ')"');
          console.log("reached failed 6");
          return false;
        }
      } else if (char == "d") {
        //ensure that dice are fully established
        if (
          i + 1 === rollString.length ||
          !legitDigits.some((e) => e == rollString.charAt(i + 1))
        ) {
          setTooltip("Dice established but does not have digit following it");
          console.log("reached failed 7");
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
              console.log("reached failed 8");
              return false;
            }
          }
        }
      } else {
        setTooltip('Invalid character of "' + char + '"');
        console.log("reached failed 9");
        return false;
      }
    }

    if (leftParCounter != rightParCounter) {
      setTooltip('Failed add: Parenthesis do not close: ")" missing');
      console.log("reached failed 10");
      return false;
    }

    //check if vars exist(see if it exists in rolls or is an inbuilt ability score)
    let varList = getVarList(rollString);
    if (checkVars(varList)) {
      return true;
    } else {
      console.log("reached failed 11");
      return false;
    }
  }
  return (
    <div className="dice-builder">
      <h2 style={{ marginBottom: "0px" }}>Dice Builder</h2>
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
                    (item.score - 10) / 2 + "(" + item.score + ")";
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
                        {(ability.score - 10) / 2 + "(" + ability.score + ") "}
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
    </div>
  );
};
