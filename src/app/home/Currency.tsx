import { useState } from "react";
import "./home.css";
import "./currency.css";
interface CurrencyProps {}

export const Currency: React.FC<CurrencyProps> = () => {
  const [currencyTable, setCurrencyTable] = useState<
    {
      title: string;
      value: number;
    }[]
  >([]);
  return (
    <div style={{ display: "flex", flex: "1", flexDirection: "column" }}>
      <h2 className="categoryTitle">Currency</h2>
      <div
        style={{
          display: "flex",
          width: "100%",
          minWidth: "100%",
          justifyContent: "center",
        }}
      >
        <table className="currencyTable">
          <thead className="tableHead">
            <tr>
              <th>Title</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {currencyTable.map((currency) => {
              return (
                <tr key={currency.title} className="row">
                  <td>{currency.title}</td>
                  <td>
                    <input
                      type="number"
                      value={currency.value}
                      onChange={(eve) => {
                        setCurrencyTable((previousTable) => {
                          let curIndex = previousTable.findIndex(
                            (currency) => currency.title === currency.title
                          )!;
                          previousTable[curIndex].value = Number(
                            eve.target.value
                          );
                          return previousTable.slice();
                        });
                      }}
                    ></input>
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
