import algosdk, { Account } from "algosdk";
import React, { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import ERC20 from "../../contracts/ERC20.json";
import MethodUI from "../components/methodUI";
import {
  getAccounts,
  getWallet,
  selectAccounts,
  selectAcctInUse,
  selectWallet,
  setAcctInUse,
} from "../features/applicationSlice";

const InfoTable = styled.div`
  display: flex;
  flex-direction: column;
  font-size: var(--font-size-m);

  p {
    margin-top: 0;
  }
`;

const Methods = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
`;

const AccountList = styled.ol`
  font-size: var(--font-size-s);
  padding: 0 0 0 var(--space-xl);
  margin: 0;

  li {
    margin: var(--space-xxs) 0;
  }
`;

const Button = styled.button`
  min-width: 4rem;
  font-size: var(--font-size-s);
  font-weight: bold;
  color: var(--color-text-main);
  background: var(--grey-lighter);
  border: 1px solid var(--grey-light);
  border-radius: 4px;
  margin-left: var(--space-xs);
  cursor: pointer;
  &:hover {
    background: var(--grey-lightest);
  }
  &[data-active="true"] {
    background: linear-gradient(319deg, #8bd2f6 0%, #f3e0c3 63%, #f7baba 100%);
    background-size: 6rem;
    border-color: #f3e0c3;
    transition: background 0.25s;
    cursor: default;

    &:hover {
      background-position: 100%;
    }
  }
`;

// Parse the json file into an object, pass it to create an ABIContract object
export const contract = new algosdk.ABIContract(ERC20);

export const algodClient = new algosdk.Algodv2(
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  "http://localhost",
  4001
);

// Utility function to return an ABIMethod by its name
function getMethodByName(name: string): algosdk.ABIMethod {
  const m = contract.methods.find((mt: algosdk.ABIMethod) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}

const Home = () => {
  const wallet = useSelector(selectWallet);
  const accounts = useSelector(selectAccounts);
  const acctInUse = useSelector(selectAcctInUse);
  const dispatch = useDispatch();

  const chooseAcct = useCallback(
    (acct: Account) => {
      if (acct !== acctInUse) {
        dispatch(setAcctInUse(acct));
      }
    },
    [acctInUse]
  );

  useEffect(() => {
    if (!wallet) {
      dispatch(getWallet());
    }
  }, []);

  useEffect(() => {
    if (wallet) {
      dispatch(getAccounts(wallet.id));
    }
  }, [wallet]);

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
          <div>
            <span>KMD status: </span>
            <span>
              {wallet
                ? accounts
                  ? "connected"
                  : "connecting..."
                : "disconnected"}
            </span>
          </div>
          {accounts && (
            <div>
              <span>KMD accounts: </span>
              <AccountList>
                {accounts.map((acct) => (
                  <li key={acct.addr}>
                    <span>{acct.addr}</span>
                    <Button
                      onClick={() => chooseAcct(acct)}
                      data-active={acctInUse === acct}
                    >
                      {acctInUse === acct ? "Signer" : "Use"}
                    </Button>
                  </li>
                ))}
              </AccountList>
            </div>
          )}
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
};

export default Home;
