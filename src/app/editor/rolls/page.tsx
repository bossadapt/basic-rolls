interface EditAbilityScoreProps {
  rolls: { rollName: string; defaultRoll: string; rollType: string }[];
}
export const EditRolls: React.FC<EditAbilityScoreProps> = ({ rolls }) => {
  return <h1>Made it to the editing rolls screen</h1>;
};
export default EditRolls;
