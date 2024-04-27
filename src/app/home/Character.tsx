interface CharacterProps {
  abilityScores: { ability: string; score: number }[];
}

export const Character: React.FC<CharacterProps> = ({ abilityScores }) => {
  return (
    <div>
      <div className="horiz">
        <h3
          style={{
            width: "25%",
            marginLeft: "2.5%",
            marginRight: "2.5%",
            marginBottom: "1%",
          }}
        >
          CUR
        </h3>
        <h3
          style={{
            width: "25%",
            marginLeft: "2.5%",
            marginRight: "2.5%",
            marginBottom: "1%",
          }}
        >
          TMP
        </h3>
      </div>
      <div className="horiz">
        <input
          style={{
            border: "0px",
            fontSize: "23px",
            width: "25%",
            marginLeft: "2.5%",
            marginRight: "2.5%",
          }}
        ></input>

        <input
          style={{
            border: "0px",
            fontSize: "23px",
            width: "25%",
            marginLeft: "2.5%",
            marginRight: "2.5%",
          }}
        ></input>
        <div style={{ borderBottom: "0px", width: "25%" }}>
          <button>+</button>
          <button>-</button>
        </div>
        <input
          style={{
            fontSize: "23px",
            width: "15%",
            marginLeft: "2.5%",
            marginRight: "2.5%",
            border: "0px",
          }}
        ></input>
      </div>
      <div className="horiz"></div>
    </div>
  );
};
