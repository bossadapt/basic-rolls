"use client";
import { useEffect, useState } from "react";
import "./action.css";
import "@/app/globals.css";
import { initialLimit, defaultActionTypes } from "./data";
import {
  ActionType,
  ActionLimit,
  ActionTypeLimit,
  ActionTypeLimitString,
} from "@/app/globalInterfaces";
import { generateID, nameValidation } from "@/app/helperFunctions";
import EditorTitleAndFinish from "../editorTitleAndFinish";
import { invoke } from "@tauri-apps/api";
import { useRouter } from "next/navigation";
export const ActionTypeEditor: React.FC = () => {
  const router = useRouter();
  const [toolTip, setToolTip] = useState(
    "An action type will be used to attach to rolls to either limit their use and/or attach modifiers to them during conditions. Click to edit(it will overwrite stuff currently in fields)"
  );
  let defaultActionType: ActionType = {
    id: "",
    name: "",
    limits: initialLimit.map((limit) => {
      return { ...limit };
    }),
  };
  const [toolTipColor, setToolTipColor] = useState("grey");
  const [actionTypeNameSearch, setActionTypeNameSearch] = useState("");
  const [actionTypes, setActionTypes] =
    useState<ActionType[]>(defaultActionTypes);
  const [focusedActionType, setFocusedActionType] = useState(defaultActionType);
  let finalizeCurrentButtonTitle =
    focusedActionType.id === "" ? "Add" : "Update";
  useEffect(() => {
    invoke<ActionType[]>("grab_action_types", {})
      .then((result) => {
        if (result.length > 0) {
          setActionTypes(result);
        }
      })
      .catch(console.error);
  }, []);
  function actionTypeAddHandler(currentActionType: ActionType) {
    let nameTest = nameValidation(currentActionType.name);
    if (!nameTest.result) {
      setToolTipColor("red");
      setToolTip("Failed to Add: " + nameTest.desc);
      return;
    }
    //checks (exluding itself) if the name exists already
    if (
      actionTypes
        .filter((actionType) => {
          return actionType.id != currentActionType.id;
        })
        .some((actionType) => {
          return actionType.name == currentActionType.name;
        })
    ) {
      setToolTipColor("red");
      setToolTip("Failed to Add: name already exists in action type");
      return;
    }
    setActionTypes((oldTypes) => {
      if (currentActionType.id === "") {
        //adding
        console.log("adding");
        currentActionType.id = generateID(oldTypes);
        oldTypes.push(currentActionType);
      } else {
        //updating
        console.log("updating");
        let indexFound = oldTypes.findIndex((type) => {
          return type.id === currentActionType.id;
        });
        //dont cause a rerender if nothing changed// causes endless rerender if removed
        if (oldTypes[indexFound] === currentActionType || indexFound === -1) {
          console.log("no changes");
          return oldTypes;
        }
        console.log("id:" + currentActionType.id);
        console.log("indexFound:" + indexFound);
        oldTypes[indexFound] = currentActionType;
      }
      console.log("completed action type");
      return { ...oldTypes };
    });
    console.log(actionTypes);
    setToolTipColor("green");
    setToolTip('Added "' + currentActionType.name + '"');
    setFocusedActionType({ ...defaultActionType });
  }
  function useCountChangeHandler(
    timeFocused: ActionTypeLimit,
    newNumber: number
  ) {
    if (newNumber > 0) {
      setFocusedActionType((prev) => {
        let newLimitList = prev.limits.map((limit) => {
          if (limit.time == timeFocused) {
            limit.useCount = newNumber;
          }
          return limit;
        });
        prev.limits = newLimitList;
        return { ...prev };
      });
    }
  }
  function timeCountChangeHandler(
    timeFocused: ActionTypeLimit,
    newNumber: number
  ) {
    if (newNumber > 0) {
      setFocusedActionType((prev) => {
        let newLimitList = prev.limits.map((limit) => {
          if (limit.time == timeFocused) {
            limit.timeCount = newNumber;
          }
          return limit;
        });
        prev.limits = newLimitList;
        return { ...prev };
      });
    }
  }
  function finishButtonHandler() {
    if (actionTypes.length < 1) {
      setToolTip("Cannot finish without a single actiontype");
      setToolTipColor("red");
    } else {
      invoke("overwrite_action_types", { newActionTypes: actionTypes })
        .then((result) => {
          router.push("/editor");
        })
        .catch(console.error);
    }
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
    setFocusedActionType({
      id: targetActionType.id,
      name: targetActionType.name,
      limits: targetActionType.limits.map((lim) => {
        return { ...lim };
      }),
    });
    //remove deletion and make it more aware along with add
    setToolTipColor("yellow");
    setToolTip('Editing "' + targetActionType.name + '"');
  }
  function nameChangeHandler(newName: string) {
    setFocusedActionType((prev) => {
      prev.name = newName;
      return { ...prev };
    });
  }
  function checkBoxClickHandler(
    timeEnabled: ActionTypeLimit,
    checked: boolean
  ) {
    setFocusedActionType((prev) => {
      let newLimitList = prev.limits.map((limit) => {
        if (limit.time == timeEnabled) {
          limit.active = checked;
        }
        return limit;
      });
      prev.limits = newLimitList;
      return { ...prev };
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
          title="Action Type Editor"
          handleFinishButton={finishButtonHandler}
        ></EditorTitleAndFinish>
      </div>
      <div className="actionColumn">
        <div className="actionEditor">
          <p style={{ color: toolTipColor, textAlign: "center" }}>{toolTip}</p>
          <div className="actionRow">
            <input
              placeholder="Name Of Action Type"
              style={{ marginLeft: "auto", marginRight: "auto" }}
              value={focusedActionType.name}
              onChange={(eve) => nameChangeHandler(eve.target.value)}
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
              {focusedActionType.limits.map((en) => {
                return (
                  <tr key={en.time}>
                    <td
                      className="editorTd"
                      style={{ textAlign: "center", margin: "0" }}
                    >
                      <input
                        style={{ width: "100%" }}
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
                          useCountChangeHandler(
                            en.time,
                            Number(eve.target.value)
                          )
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
                          timeCountChangeHandler(
                            en.time,
                            Number(eve.target.value)
                          )
                        }
                      ></input>
                    </td>
                    <td className="editorTd">
                      {ActionTypeLimitString[en.time]}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <button
            onClick={() => actionTypeAddHandler({ ...focusedActionType })}
            className="addButton"
          >
            {finalizeCurrentButtonTitle} Action Type
          </button>
        </div>
        <div className="displayDiv">
          <table className="displayTable">
            <thead>
              <tr>
                <th>
                  <input
                    value={actionTypeNameSearch}
                    onChange={(eve) =>
                      setActionTypeNameSearch(eve.target.value)
                    }
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
                    <tr key={actionType.id}>
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
    </div>
  );
};
export default ActionTypeEditor;
