import "../home.css";
import { Condition } from "../../globalInterfaces";
interface ConditionsProps {
  conditions: Condition[];
}

export const Conditions: React.FC<ConditionsProps> = () => {
  return (
    <div>
      <h2 className="categoryTitle">Conditions</h2>
    </div>
  );
};
