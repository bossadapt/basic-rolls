import { Dispatch, SetStateAction, useState } from "react";
import { CharacterInfo, Condition, Change } from "@/app/globalInterfaces";
interface CharacterEffectsProps {
  category: string;
  characterInfoList: CharacterInfo[];
  condition: Condition;
  setCondition: Dispatch<SetStateAction<Condition>>;
}

export const CharacterEffectTable: React.FC<CharacterEffectsProps> = ({
  category,
  characterInfoList,
  condition,
  setCondition,
}) => {
  let charChangeList = condition.characterInfoChanges;
  const [selectedCharacterInfo, setselectedCharacterInfo] = useState("name");
  function updateItemChange(changeName: string, newChange: string) {
    console.log(condition);
    setCondition((oldCondition) => {
      oldCondition!.characterInfoChanges.find((change) => {
        console.log("changename:" + change.name);
        console.log("changenametru:" + (change.name == changeName));
        return change.name == changeName;
      })!.changeEffect = newChange;
      console.log("finished");
      return { ...oldCondition };
    });
  }
  function removeCharacterChangeByName(target: string) {
    setCondition((oldCondition) => {
      {
        console.log("oldList: ", oldCondition.characterInfoChanges);
        let charChangeListTmp = [...oldCondition.characterInfoChanges].filter(
          (charInfo) => charInfo.name !== target
        );
        oldCondition.characterInfoChanges = charChangeListTmp;
        console.log("removed: " + target);
        console.log("newList: ", oldCondition.characterInfoChanges);
        refreshSelected();
        return structuredClone(oldCondition);
      }
    });
  }
  function refreshSelected() {
    let newSelect = characterInfoList.find((characterInfo) => {
      return !condition.characterInfoChanges.some(
        (oldCond) => oldCond.name === characterInfo.info_type
      );
    })?.info_type;
    if (!newSelect) {
      newSelect = "";
    }
    setselectedCharacterInfo(newSelect);
  }
  function handleAddCharacterInfo() {
    setCondition((oldCondition) => {
      if (
        selectedCharacterInfo != "" &&
        !oldCondition.characterInfoChanges.some((charChange) => {
          return charChange.name === selectedCharacterInfo;
        })
      ) {
        let tempChange: Change = {
          name: selectedCharacterInfo,
          changeEffect: "var(" + selectedCharacterInfo + ")",
        };
        oldCondition.characterInfoChanges.push(tempChange);
        refreshSelected();
        return oldCondition;
      }
      return oldCondition;
    });
  }

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "row" }}>
        <h2 style={{ justifyContent: "left", marginRight: "auto" }}>
          {category}
        </h2>
        <select
          style={{
            margin: "auto",
            marginRight: "0px",
            marginLeft: "auto",
          }}
          value={selectedCharacterInfo}
          onChange={(eve) => {
            setselectedCharacterInfo(eve.target.value);
          }}
        >
          {characterInfoList
            .filter((originalItem) => {
              return !charChangeList.some(
                (changeItem) => changeItem.name === originalItem.info_type
              );
            })
            .map((item, index) => {
              return (
                <option key={item.info_type + index} value={item.info_type}>
                  {item.info_type}
                </option>
              );
            })}
        </select>
        <button
          style={{
            marginTop: "auto",
            marginBottom: "auto",
            marginLeft: "0",
            marginRight: "0",
          }}
          onClick={handleAddCharacterInfo}
        >
          ADD
        </button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Variable</th>
            <th>Change</th>
            <th>X</th>
          </tr>
        </thead>
        <tbody>
          {charChangeList.map((item, index) => {
            return (
              <tr key={item.name + index}>
                <td>{item.name}</td>
                <td>
                  <input
                    value={item.changeEffect}
                    onChange={(eve) => {
                      console.log(item.name);
                      console.log(eve.target.value);
                      updateItemChange(item.name, eve.target.value);
                    }}
                  ></input>
                </td>
                <td>
                  <button
                    onClick={() => removeCharacterChangeByName(item.name)}
                  >
                    X
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
