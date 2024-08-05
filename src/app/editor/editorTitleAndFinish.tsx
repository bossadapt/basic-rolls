export interface EditorTitleAndFinishProps {
  title: string;
  handleFinishButton: () => void;
}
export const EditorTitleAndFinish: React.FC<EditorTitleAndFinishProps> = ({
  title,
  handleFinishButton,
}) => {
  return (
    <div
      style={{
        marginLeft: "auto",
        marginRight: "auto",
        display: "flex",
        flexDirection: "row",
        width: "90%",
        height: "20vh",
      }}
    >
      <button
        style={{ margin: "auto", lineHeight: "50px", width: "10%" }}
        onClick={handleFinishButton}
      >
        Finished
      </button>
      <h1 style={{ width: "90%", marginRight: "10%", color: "#4ba4a6" }}>
        {title}
      </h1>
    </div>
  );
};
export default EditorTitleAndFinish;
