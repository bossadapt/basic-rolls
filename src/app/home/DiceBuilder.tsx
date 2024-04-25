interface DiceBuilderProps {
  rolls: { roll_name: string; default_roll: string }[];
}

export const DiceBuilder: React.FC<DiceBuilderProps> = () => {
  return (
    <div className="dice-builder">
      <h2>Dice Builder</h2>
    </div>
  );
};
