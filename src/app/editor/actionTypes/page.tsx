"use client";
import { useEffect, useState } from "react";
import "./action.css";
import "@/app/globals.css";
import { TimeSpan } from "@/app/globalInterfaces";
import { ActionType, ActionLimit } from "@/app/globalInterfaces";
import { nameValidation } from "@/app/helperFunctions";
import EditorTitleAndFinish from "../editorTitleAndFinish";
import { invoke } from "@tauri-apps/api";
import { useRouter } from "next/navigation";
export const ActionTypeEditor: React.FC = () => {
  const [nameInput, setNameInput] = useState("");
  const [toolTip, setToolTip] = useState(
    "An action type will be used to attach to rolls to either limit their use and/or attach modifiers to them during conditions. Click to edit(it will overwrite stuff currently in fields)"
  );
  const [toolTipColor, setToolTipColor] = useState("grey");
  const [actionTypeNameSearch, setActionTypeNameSearch] = useState("");
  const [actionTypes, setActionTypes] = useState<ActionType[]>([]);
  const router = useRouter();
  let initialList: ActionLimit[] = [
    {
      time: TimeSpan.Turn,
      active: false,
      useCount: 1,
      timeCount: 1,
    },
    {
      time: TimeSpan.Combat,
      active: false,
      useCount: 1,
      timeCount: 1,
    },
    {
      time: TimeSpan.ShortRest,
      active: false,
      useCount: 1,
      timeCount: 1,
    },
    {
      time: TimeSpan.LongRest,
      active: false,
      useCount: 1,
      timeCount: 1,
    },
  ];
  let [limitList, setLimitList] = useState(initialList);
  useEffect(() => {
    invoke<ActionType[]>("grab_action_types", {})
      .then((result) => {
        setActionTypes(result);
      })
      .catch(console.error);
  }, []);
  function handleActionTypeAdd() {
    let nameTest = nameValidation(nameInput);
    if (!nameTest.result) {
      setToolTipColor("red");
      setToolTip("Failed to Add: " + nameTest.desc);
      return;
    }
    if (
      actionTypes.some((actionType) => {
        return actionType.name == nameInput;
      })
    ) {
      setToolTipColor("red");
      setToolTip("Failed to Add: name already exists in action type");
      return;
    }
    setActionTypes((oldTypes) => {
      let tempAction = {
        name: nameInput,
        limits: limitList,
      };
      if (
        !oldTypes.some((actionType) => {
          return actionType.name === nameInput;
        })
      ) {
        console.log(tempAction, oldTypes);
        oldTypes.push(tempAction);
      }
      return oldTypes;
    });
    setToolTipColor("green");
    setToolTip('Added "' + nameInput + '"');
    setNameInput("");
    setLimitList(initialList);
  }
  function handleUseCountChange(timeFocused: TimeSpan, newNumber: number) {
    if (newNumber > 0) {
      setLimitList((prev) => {
        let newLimitList = prev.map((limit) => {
          if (limit.time == timeFocused) {
            limit.useCount = newNumber;
          }
          return limit;
        });
        return newLimitList;
      });
    }
  }
  function handleTimeCountChange(timeFocused: TimeSpan, newNumber: number) {
    if (newNumber > 0) {
      setLimitList((prev) => {
        let newLimitList = prev.map((limit) => {
          if (limit.time == timeFocused) {
            limit.timeCount = newNumber;
          }
          return limit;
        });
        return newLimitList;
      });
    }
  }
  function handleFinishButton() {
    console.log(actionTypes);
    invoke("overwrite_action_types", { newActionTypes: actionTypes })
      .then((result) => {
        router.push("/editor");
      })
      .catch(console.error);
  }
  function handleDeleteButton(targetActionType: ActionType) {
    setActionTypes((oldActions) => {
      let newActions = oldActions.filter((actionType) => {
        return actionType !== targetActionType;
      });
      return newActions;
    });
    setToolTipColor("green");
    setToolTip('Removed "' + targetActionType.name + '"');
  }
  function handleEditButton(targetActionType: ActionType) {
    setNameInput(targetActionType.name);
    setLimitList(targetActionType.limits);
    handleDeleteButton(targetActionType);
    setToolTipColor("yellow");
    setToolTip('Editing "' + targetActionType.name + '"');
  }
  function checkBoxClickHandler(timeEnabled: TimeSpan, checked: boolean) {
    setLimitList((prev) => {
      console.log(prev);
      let newLimitList = prev.map((limit) => {
        if (limit.time == timeEnabled) {
          limit.active = checked;
        }
        return limit;
      });
      console.log(newLimitList);
      return newLimitList;
    });
  }
  function timeRatioBuilder(limit: ActionLimit): string {
    if (!limit.active) {
      return "N/A";
    } else {
      return limit.useCount + "/" + limit.timeCount;
    }
  }
  return (
    <div>
      <div
        style={{
          width: "90%",
          marginLeft: "auto",
          marginRight: "auto",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <EditorTitleAndFinish
          title="Ability Type Editor"
          handleFinishButton={handleFinishButton}
        ></EditorTitleAndFinish>
      </div>
      <div className="column">
        <p style={{ color: toolTipColor, textAlign: "center" }}>{toolTip}</p>
        <div className="row">
          <input
            placeholder="Name Of Action Type"
            style={{ marginLeft: "auto", marginRight: "auto" }}
            value={nameInput}
            onChange={(eve) => setNameInput(eve.target.value)}
          ></input>
        </div>
        <table className="editorTable">
          <thead>
            <tr>
              <th style={{ textAlign: "center" }}>
                Enabled<br></br> Limit
              </th>
              <th className="editorTh">
                Use<br></br>Count
              </th>
              <th className="editorTh"> </th>
              <th className="editorTh">
                Time<br></br>Count
              </th>
              <th className="editorTh">
                Time<br></br>Type
              </th>
            </tr>
          </thead>
          <tbody>
            {limitList.map((en) => {
              return (
                <tr key={en.time}>
                  <td
                    className="editorTd"
                    style={{ textAlign: "center", margin: "0" }}
                  >
                    <input
                      type="checkbox"
                      checked={en.active}
                      onChange={(eve) =>
                        checkBoxClickHandler(en.time, eve.target.checked)
                      }
                    ></input>
                  </td>
                  <td className="editorTd">
                    <input
                      disabled={!en.active}
                      type="number"
                      className="listInput"
                      value={en.useCount}
                      onChange={(eve) =>
                        handleUseCountChange(en.time, Number(eve.target.value))
                      }
                    ></input>
                  </td>
                  <td className="editorTd"> for every</td>
                  <td className="editorTd">
                    <input
                      disabled={!en.active}
                      type="number"
                      className="listInput"
                      value={en.timeCount}
                      onChange={(eve) =>
                        handleTimeCountChange(en.time, Number(eve.target.value))
                      }
                    ></input>
                  </td>
                  <td className="editorTd">{en.time}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <button
          onClick={handleActionTypeAdd}
          style={{ width: "60%", lineHeight: "50px", fontSize: "20px" }}
        >
          Add Action Type To List
        </button>
        <table className="displayTable">
          <thead>
            <tr>
              <th>
                <input
                  value={actionTypeNameSearch}
                  onChange={(eve) => setActionTypeNameSearch(eve.target.value)}
                  placeholder="Action Type Name"
                ></input>
              </th>
              <th>Turn</th>
              <th>Combat</th>
              <th>Short Rest</th>
              <th>Long Rest</th>
              <th>X</th>
            </tr>
          </thead>
          <tbody>
            {actionTypes
              .filter((actionType) => {
                return actionType.name
                  .toLocaleLowerCase()
                  .includes(actionTypeNameSearch.toLocaleLowerCase());
              })
              .map((actionType) => {
                return (
                  <tr key={actionType.name}>
                    <th onClick={() => handleEditButton(actionType)}>
                      {actionType.name}
                    </th>
                    <td onClick={() => handleEditButton(actionType)}>
                      {timeRatioBuilder(actionType.limits[0])}
                    </td>
                    <td onClick={() => handleEditButton(actionType)}>
                      {timeRatioBuilder(actionType.limits[1])}
                    </td>
                    <td onClick={() => handleEditButton(actionType)}>
                      {timeRatioBuilder(actionType.limits[2])}
                    </td>
                    <td onClick={() => handleEditButton(actionType)}>
                      {timeRatioBuilder(actionType.limits[3])}
                    </td>
                    <td>
                      <button onClick={() => handleDeleteButton(actionType)}>
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
export default ActionTypeEditor;
