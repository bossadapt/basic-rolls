import { AbilityScore, Change, Condition, Roll } from "@/app/globalInterfaces";
import { Dispatch, SetStateAction, useState } from "react";

interface RollsEffectsTableProps {
  category: string;
  rolls: Roll[];
  condition: Condition;
  setCondition: Dispatch<SetStateAction<Condition>>;
}

export const RollsEffectsTable: React.FC<RollsEffectsTableProps> = ({
  category,
  rolls,
  condition,
  setCondition,
}) => {
  console.log("Component started", rolls);
  const [selectedRoll, setSelectedRoll] = useState(
    rolls.length > 0 ? rolls[0].name : "N/A"
  );
  function refreshSelected() {
    let newSelect = rolls.find((roll) => {
      return !condition.rollChanges.some(
        (oldCond) => oldCond.name === roll.name
      );
    })?.name;
    if (!newSelect) {
      newSelect = "";
    }
    setSelectedRoll(newSelect);
  }
  function updateItemChange(changeName: string, newChange: string) {
    setCondition((oldCondition) => {
      oldCondition!.rollChanges.find((change) => {
        change.name == changeName;
      })!.changeEffect = newChange;
      return oldCondition;
    });
  }
  function removeAbilityChangeByName(target: string) {
    setCondition((oldCondition) => {
      {
        console.log("oldList: ", oldCondition.rollChanges);
        let rollChangeListTemp = oldCondition.rollChanges.filter(
          (charInfo) => charInfo.name !== target
        );
        refreshSelected();
        return { ...oldCondition, rollChanges: rollChangeListTemp };
      }
    });
  }
  function handleAddAbilityInfo() {
    console.log("add pressed");
    setCondition((oldCondition) => {
      if (
        selectedRoll != "" &&
        !oldCondition.rollChanges.some((rollChange) => {
          return rollChange.name === selectedRoll;
        })
      ) {
        let tempChange: Change = {
          name: selectedRoll,
          changeEffect: "var(" + selectedRoll + ")",
        };
        console.log(tempChange.name + " added");
        oldCondition!.rollChanges.push(tempChange);
        //put another value as the one || leave empty
        refreshSelected();
      }

      return oldCondition;
    });
  }
  return (
    <div>
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
            value={selectedRoll}
            onChange={(eve) => {
              setSelectedRoll(eve.target.value);
            }}
          >
            {rolls
              ?.filter((originalItem) => {
                return !condition?.rollChanges?.some(
                  (changeItem) => changeItem.name === originalItem.name
                );
              })
              .map((item) => {
                return (
                  <option key={item.name} value={item.name}>
                    {item.name}
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
        <table>
          <thead>
            <tr>
              <th>Ability</th>
              <th>Change</th>
              <th>X</th>
            </tr>
          </thead>
          <tbody>
            {condition?.rollChanges?.map((item) => {
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
                    <button
                      onClick={() => removeAbilityChangeByName(item.name)}
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
    </div>
  );
};

export default RollsEffectsTable;
