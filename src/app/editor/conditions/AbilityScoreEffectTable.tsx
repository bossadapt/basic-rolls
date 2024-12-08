import { Dispatch, SetStateAction, useState } from "react";
import { Condition, Change, AbilityScore } from "@/app/globalInterfaces";
interface AbilityScoreEffectsProps {
  category: string;
  abilityScoreList: AbilityScore[];
  condition: Condition;
  setCondition: Dispatch<SetStateAction<Condition>>;
}

export const AbilityScoreEffectsTable: React.FC<AbilityScoreEffectsProps> = ({
  category,
  abilityScoreList,
  condition,
  setCondition,
}) => {
  const [selectedAbilityInfo, setSelectedAbilityInfo] = useState("strength");

  function updateItemChange(changeName: string, newChange: string) {
    setCondition((oldCondition) => {
      oldCondition!.abilityScoreChanges.find((change) => {
        return change.name == changeName;
      })!.changeEffect = newChange;
      return { ...oldCondition };
    });
  }
  function refreshSelected() {
    let newSelect = abilityScoreList.find((characterInfo) => {
      return !condition.abilityScoreChanges.some(
        (oldCond) => oldCond.name === characterInfo.ability
      );
    })?.ability;
    if (!newSelect) {
      newSelect = "";
    }
    setSelectedAbilityInfo(newSelect);
  }
  function removeAbilityChangeByName(target: string) {
    setCondition((oldCondition) => {
      {
        console.log("oldList: ", oldCondition.abilityScoreChanges);
        let abilityChangeListTmp = [...oldCondition.abilityScoreChanges].filter(
          (charInfo) => charInfo.name !== target
        );
        refreshSelected();
        return { ...oldCondition, abilityScoreChanges: abilityChangeListTmp };
      }
    });
  }
  function handleAddAbilityInfo() {
    console.log("add pressed");
    setCondition((oldCondition) => {
      if (
        selectedAbilityInfo != "" &&
        !oldCondition.abilityScoreChanges.some((abilityChange) => {
          return abilityChange.name === selectedAbilityInfo;
        })
      ) {
        let tempChange: Change = {
          name: selectedAbilityInfo,
          changeEffect: "var(" + selectedAbilityInfo.substring(0, 3) + ")",
        };
        console.log(tempChange.name + " added");
        oldCondition!.abilityScoreChanges.push(tempChange);
        //put another value as the one || leave empty
        refreshSelected();
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
          value={selectedAbilityInfo}
          onChange={(eve) => {
            setSelectedAbilityInfo(eve.target.value);
          }}
        >
          {abilityScoreList
            ?.filter((originalItem) => {
              return !condition?.abilityScoreChanges?.some(
                (changeItem) => changeItem.name === originalItem.ability
              );
            })
            .map((item) => {
              return (
                <option key={item.ability} value={item.ability}>
                  {item.ability}
                </option>
              );
            }) || []}
        </select>
        <button
          style={{
            marginTop: "auto",
            marginBottom: "auto",
            marginLeft: "0",
            marginRight: "0",
          }}
          onClick={() => handleAddAbilityInfo()}
        >
          ADD
        </button>
      </div>
      <table className="conditionTable">
        <thead>
          <tr>
            <th>Ability</th>
            <th>Change</th>
            <th>X</th>
          </tr>
        </thead>
        <tbody>
          {condition?.abilityScoreChanges?.map((item) => {
            return (
              <tr key={item.name}>
                <td>{item.name}</td>
                <td>
                  <input
                    value={item.changeEffect}
                    onChange={(eve) => {
                      updateItemChange(item.name, eve.target.value);
                    }}
                  ></input>
                </td>
                <td>
                  <button onClick={() => removeAbilityChangeByName(item.name)}>
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
