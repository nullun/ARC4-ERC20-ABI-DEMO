import algosdk from "algosdk";
import * as React from "react";
import styled from "styled-components";
import ERC20 from "../../contracts/ERC20.json";
import MethodUI from "../components/methodUI";

const InfoTable = styled.div`
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-l);

  p {
    font-size: var(--font-size-m);
    margin-top: 0;
  }
`;

const Methods = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
`;

// Parse the json file into an object, pass it to create an ABIContract object
export const contract = new algosdk.ABIContract(ERC20);

export const algodClient = new algosdk.Algodv2("", "http://localhost", 4001);

// Utility function to return an ABIMethod by its name
function getMethodByName(name: string): algosdk.ABIMethod {
  const m = contract.methods.find((mt: algosdk.ABIMethod) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}

export default function Home() {
  return (
    <>
      <h1 className="title">ARC4 ERC20 ABI Demo</h1>
      <div className="home-wrapper">
        <InfoTable>
          <div>
            <span>Token name: </span>
            <span>{ERC20.name}</span>
          </div>
          <div>
            <p>{ERC20.desc}</p>
          </div>
        </InfoTable>
        <h2>Contract Methods</h2>
        <Methods>
          {ERC20.methods.map((method) => (
            <MethodUI
              key={method.name}
              method={method}
              contractMethod={getMethodByName(method.name)}
            />
          ))}
        </Methods>
      </div>
    </>
  );
}
