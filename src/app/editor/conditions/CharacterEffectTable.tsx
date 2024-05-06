import { Dispatch, SetStateAction } from "react";
import { Condition } from "./page";
import { CharacterInfo } from "@/app/globalInterfaces";
interface CharacterEffectsProps {
  category: string;
  characterInfoList: CharacterInfo[];
  condition: Condition | undefined;
  setCondition: Dispatch<SetStateAction<Condition | undefined>>;
}

export const CharacterEffectTable: React.FC<CharacterEffectsProps> = ({
  category,
  characterInfoList: categoryList,
  condition,
  setCondition,
}) => {
  let currentChangeList = condition?.changeList.find((list) => {
    list.category == category;
  });
  function updateItemChange(changeName: string, newChange: string) {
    setCondition((oldCondition) => {
      oldCondition!.changeList
        .find((list) => {
          list.category == category;
        })!
        .changes.find((change) => {
          change.name == changeName;
        })!.changeEffect = newChange;
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
        >
          {categoryList
            ?.filter((originalItem) => {
              return !currentChangeList?.changes.some(
                (changeItem) => changeItem.name === originalItem.info_type
              );
            })
            .map((item) => {
              return (
                <option key={item.info_type} value={item.info_type}>
                  {item.info_type}
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
          {currentChangeList?.changes.map((item) => {
            return (
              <tr>
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
                  <button>X</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
