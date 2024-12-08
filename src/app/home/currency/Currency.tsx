import { useState } from "react";
import "../home.css";
import "./currency.css";
interface CurrencyProps {}
interface CurrencyStruct{
  title: string;
  value: number;
}
//TODO: make it more basic so that we can just use the coins and add a minus and add feature that converts to the lowest forms/ or just move it into inventory
export const Currency: React.FC<CurrencyProps> = () => {
  const [currencyTable, setCurrencyTable] = useState<
    CurrencyStruct[]
  >([{
    title: "PP",
    value: 0
  },{
    title: "GP",
    value: 0
  },{
    title: "EP",
    value: 0
  },{
    title: "SP",
    value: 0
  },{
    title: "CP",
    value: 0
  }]);
  function addCurrencyType(){
    setCurrencyTable((prev)=>{
      prev.push({
        title: "",
        value: 0
      })
      return prev.slice();
    })
  }
  return (
    <div style={{ display: "flex", flex: "1", flexDirection: "column",height:"100%" }}>
      <h2 className="categoryTitle">Currency</h2>
      <div
        className="currencyTableAndButton"
      >
        <table className="currencyTable">
          <thead className="tableHead">
            <tr>
              <th>Title</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            {currencyTable.map((currency, index) => {
              return (
                <tr key={index} className="row">
                  <td><input
                      type="Text"
                      value={currency.title}
                      onChange={(eve) => {
                        setCurrencyTable((previousTable) => {
                          previousTable[index].title = 
                            eve.target.value
                          ;
                          return previousTable.slice();
                        });
                      }}
                    ></input></td>
                  <td>
                    <input
                      type="number"
                      value={currency.value}
                      onChange={(eve) => {
                        setCurrencyTable((previousTable) => {
                          previousTable[index].value = Number(
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
      <button onClick={(ev)=>{addCurrencyType()}}>Add Currency Type</button>
      </div>
    </div>
  );
};
