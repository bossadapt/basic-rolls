import "./rolls.css";
import EditLogo from "../images/pencil.svg";
import DeleteLogo from "../images/delete.svg";
interface RollEditCardProps {
  currentRoll: { roll_name: string; default_roll: string };
  removeRoll: (removedName: string) => void;
  editRoll: (editName: string) => void;
}
export const RollEditCard: React.FC<RollEditCardProps> = ({
  currentRoll,
  removeRoll,
  editRoll,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        borderRadius: "10px",
        backgroundColor: "#696969",
        borderLeft: "456px",
        borderTop: "10px",
        borderBottom: "10px",
        marginBottom: "5px",
        marginLeft: "5%",
        marginRight: "5%",
      }}
    >
      <h3 className="listText" style={{ width: "30%" }}>
        {currentRoll.roll_name}
      </h3>
      <h3 className="listText" style={{ width: "35%" }}>
        {currentRoll.default_roll}
      </h3>
      <button
        onClick={() => editRoll(currentRoll.roll_name)}
        className="svgButton"
      >
        <img src={EditLogo.src} className="svgEditImg"></img>
      </button>
      <button
        onClick={() => removeRoll(currentRoll.roll_name)}
        className="svgButton"
      >
        <img src={DeleteLogo.src} className="svgDeleteImg"></img>
      </button>
    </div>
  );
};
