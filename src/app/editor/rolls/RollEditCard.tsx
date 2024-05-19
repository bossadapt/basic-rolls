import "./rolls.css";
import EditLogo from "../images/pencil.svg";
import DeleteLogo from "../images/delete.svg";
import { Roll } from "@/app/globalInterfaces";
import { useState } from "react";
interface RollEditCardProps {
  currentRoll: Roll;
  removeRoll: (removedName: string) => void;
  editRoll: (editName: string) => void;
}
export const RollEditCard: React.FC<RollEditCardProps> = ({
  currentRoll,
  removeRoll,
  editRoll,
}) => {
  const [showDetails, setShowDetails] = useState<boolean>(false);
  let extraDetailsButtonText = showDetails ? "Show Less" : "Show More";
  return (
    <div className="rollItem">
      <div className="rollItemTop">
        <h3 className="listText" style={{ width: "30%" }}>
          {currentRoll.name}
        </h3>
        <h3 className="listText" style={{ width: "35%" }}>
          {currentRoll.roll}
        </h3>
        <button
          onClick={() => editRoll(currentRoll.name)}
          className="svgButton"
        >
          <img src={EditLogo.src} className="svgEditImg"></img>
        </button>
        <button
          onClick={() => removeRoll(currentRoll.name)}
          className="svgButton"
        >
          <img src={DeleteLogo.src} className="svgDeleteImg"></img>
        </button>
      </div>
      <div className="rollItemBottom" style={{ width: "100%" }}>
        <div
          style={{ display: "flex", flexDirection: "column", width: "100%" }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
            }}
          >
            {showDetails && (
              <div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <h4
                    style={{
                      width: "50%",
                      marginLeft: "auto",
                      textAlign: "center",
                      marginRight: "auto",
                      color: "red",
                    }}
                  >
                    Health Cost: {currentRoll.healthCost}
                  </h4>
                  <h4
                    style={{
                      width: "50%",
                      marginLeft: "auto",
                      textAlign: "center",
                      marginRight: "auto",
                      color: "blue",
                    }}
                  >
                    Mana Cost: {currentRoll.manaCost}
                  </h4>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                  }}
                >
                  <table className="extraDetailsTable">
                    <thead>
                      <tr>
                        <th>Action Types</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {currentRoll.actionTypes.map((actionType) => {
                          return (
                            <td style={{ textAlign: "center" }}>
                              {actionType.name}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                  <table className="extraDetailsTable">
                    <thead>
                      <tr>
                        <th>Conditions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {currentRoll.conditions.map((condition) => {
                          return (
                            <td style={{ textAlign: "center" }}>
                              {condition.name}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() =>
              setShowDetails((prev) => {
                return !prev;
              })
            }
            style={{ marginTop: "2px", marginBottom: "3px" }}
          >
            {extraDetailsButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
