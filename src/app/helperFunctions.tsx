import { Roll, importantCharCode } from "./globalInterfaces";
import { v4 as uuid } from "uuid";
const legitSymbols: String[] = ["+", "-", "*", "/"];
const defaultVars: String[] = [
  "str",
  "dex",
  "con",
  "int",
  "wis",
  "cha",
  "ac",
  "mana",
  "hp",
  "name",
];

///generates a UUID and ensures no duplicates with existing data
interface ObjectWithID {
  id: string;
}
export function generateID(existingList: ObjectWithID[]) {
  let newUUID = uuid();
  while (existingList.some((item) => item.id === newUUID)) {
    newUUID = uuid();
  }
  return newUUID;
}

//parses rolls while checking if the vars are valid
export function checkRoll(
  rollString: string,
  currentRolls: Roll[]
): {
  result: boolean;
  desc: string;
} {
  if (rollString === "") {
    return { result: true, desc: "roll was left empty" };
  }
  rollString = rollString.toLowerCase();
  rollString = rollString.replaceAll(" ", "");
  //legal characters:
  //2d20 || d6
  // + || * || /
  //3
  //var(something)
  //let legitCharacters: String[] = ["d", "v"];
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
    let charCharCode = char.charCodeAt(0);
    if (
      charCharCode >= importantCharCode.digitStart &&
      charCharCode <= importantCharCode.digitEnd
    ) {
      //pass
    } else if (char == "(") {
      leftParCounter += 1;
      if (rollString.length !== i + 1 && rollString.charAt(i + 1) === ")") {
        return { result: false, desc: "Failed add: empty parenthesis" };
      }
    } else if (char == ")") {
      rightParCounter += 1;
      if (rightParCounter > leftParCounter) {
        return {
          result: false,
          desc: 'Failed add: Parenthesis do not close: ")" came before "("',
        };
      }
    } else if (legitSymbols.includes(char)) {
      //symbol checks
      if (i == 0 || i == rollString.length - 1) {
        return {
          result: false,
          desc: "Failed add: symbol used at the start or end",
        };
      } else if (legitSymbols.includes(rollString.charAt(i - 1))) {
        return {
          result: false,
          desc:
            'Failed add: two symbols next to eachother "' +
            char +
            rollString.charAt(i - 1) +
            '"',
        };
      } else if (rollString.charAt(i - 1) === "(") {
        return {
          result: false,
          desc: 'Failed add: symbol facing parenthesis "(' + char + '"',
        };
      } else if (rollString.charAt(i + 1) === ")") {
        return {
          result: false,
          desc: 'Failed add: symbol facing parenthesis "' + char + ')"',
        };
      }
    } else if (char == "d") {
      //ensure that dice are fully established
      if (
        i + 1 === rollString.length ||
        !(
          rollString.charCodeAt(i + 1) >= importantCharCode.digitStart &&
          rollString.charCodeAt(i + 1) <= importantCharCode.digitEnd
        )
      ) {
        return {
          result: false,
          desc: "Dice established but does not have digit following it",
        };
      }
    } else if (char == "v") {
      //ran into a variable(skip it if it fills the var rules)
      if (
        i + 4 >= rollString.length ||
        rollString.substring(i, i + 4) !== "var("
      ) {
        return {
          result: false,
          desc: 'Invalid character of "' + char + '"',
        };
      } else {
        i += 4;
        while (char != ")") {
          i += 1;
          char = rollString.charAt(i);
          if (i >= rollString.length) {
            return {
              result: false,
              desc: 'Failed add: Parenthesis do not close: "var("',
            };
          }
        }
      }
    } else {
      return {
        result: false,
        desc: 'Invalid character of "' + char + '"',
      };
    }
  }

  if (leftParCounter != rightParCounter) {
    return {
      result: false,
      desc: 'Failed add: Parenthesis do not close: ")" missing',
    };
  }

  //check if vars exist(see if it exists in rolls or is an inbuilt ability score)
  let varList = getVarList(rollString);
  let checkVarResult = checkVars(varList, currentRolls);

  return {
    result: checkVarResult.result,
    desc: checkVarResult.desc,
  };
}
export function checkVars(
  vars: String[],
  currentRolls: Roll[]
): {
  result: boolean;
  desc: string;
} {
  for (let i = 0; i < vars.length; i++) {
    //it does not exist in neither as a generic ability score or another roll
    let currentVar = vars[i].toLocaleLowerCase();
    if (
      !defaultVars.some((e) => e === currentVar) &&
      !currentRolls.some((e) => e.name.toLocaleLowerCase() === currentVar)
    ) {
      return {
        result: false,
        desc: 'Variable "' + vars[i] + '" does not exist',
      };
    }
  }
  return {
    result: true,
    desc: "passed",
  };
}
export function getVarList(roll: String): String[] {
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
//trim should be ran before this to ensure usererror is limited
export function nameValidation(nameToVerify: string): {
  result: boolean;
  desc: string;
} {
  if (nameToVerify.length > 20) {
    return { result: false, desc: "name was larger than 20 characters" };
  }
  if (nameToVerify === "") {
    return { result: false, desc: "name was empty" };
  }
  //much like regex but with more clear response for user error checking reasons
  for (let i = 0; i < nameToVerify.length; i++) {
    let currentCharCode = nameToVerify.charCodeAt(i);
    if (
      !(
        currentCharCode >= importantCharCode.lowerCaseStart &&
        currentCharCode <= importantCharCode.lowerCaseEnd
      ) &&
      !(
        currentCharCode >= importantCharCode.upperCaseStart &&
        currentCharCode <= importantCharCode.upperCaseEnd
      ) &&
      !(
        currentCharCode >= importantCharCode.digitStart &&
        currentCharCode <= importantCharCode.digitEnd
      ) &&
      !(currentCharCode === importantCharCode.underScore)
    ) {
      return {
        result: false,
        desc:
          'invalid character "' +
          nameToVerify.charAt(i) +
          '" at character #' +
          (i + 1),
      };
    }
  }

  return { result: true, desc: nameToVerify };
}
export function rollTraceTest(
  initialRoll: Roll,
  currentRoll: Roll,
  rolls: Roll[]
): {
  result: boolean;
  desc: string;
} {
  let currentVarList = getVarList(currentRoll.roll);
  //if its empty or only contains
  if (
    !currentVarList.some((e) => !defaultVars.includes(e.toLocaleLowerCase()))
  ) {
    return { result: true, desc: "" };
  } else if (
    currentVarList.some(
      (currentVar) =>
        currentVar.toLocaleLowerCase() === initialRoll.name.toLocaleLowerCase()
    )
  ) {
    return {
      result: false,
      desc:
        'Failed Finish: rolls call each other infinitely between "' +
        initialRoll.name +
        '" and "' +
        currentRoll.name +
        '"',
    };
  } else {
    let responses: {
      result: boolean;
      desc: string;
    }[] = [];
    for (let i = 0; i < currentVarList.length; i++) {
      let currentVar = currentVarList[i].toLocaleLowerCase();
      if (!defaultVars.includes(currentVar)) {
        responses.push(
          rollTraceTest(
            initialRoll,
            rolls.find((item) => item.name.toLocaleLowerCase() === currentVar)!,
            rolls
          )
        );
      }
    }
    for (let i = 0; i < responses.length; i++) {
      if (!responses[i]) {
        return {
          result: false,
          desc: responses[i].desc,
        };
      }
    }
    return {
      result: true,
      desc: "",
    };
  }
}
