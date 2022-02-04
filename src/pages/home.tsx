import algosdk, { Account } from "algosdk";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ERC20 from "../../contracts/ERC20_Interface.json";
import MethodUI from "../components/methodUI";
import {
  getAccounts,
  getWallets,
  selectAccounts,
  selectAcctInUse,
  selectAlgod,
  selectAppId,
  selectKmd,
  selectWallet,
  selectWallets,
  setAcctInUse,
  setAlgod,
  setAppId,
  setKmd,
  setWallet,
  Wallet,
} from "../features/applicationSlice";
import { AccountList, Button, Header, InfoTable, Methods } from "./home.styles";

type StateSchema = {
  "num-byte-slice": number;
  "num-uint": number;
};

type CreatedApp = {
  "created-at-round"?: number;
  deleted?: boolean;
  id: number;
  params?: {
    "approval-program": string;
    "clear-state-program": string;
    creator: string;
    "global-state-schema": StateSchema;
    "local-state-schema": StateSchema;
  };
};

// Parse the json file into an object, pass it to create an ABIContract object
export const contract = new algosdk.ABIContract(ERC20);

// Utility function to return an ABIMethod by its name
function getMethodByName(name: string): algosdk.ABIMethod {
  const m = contract.methods.find((mt: algosdk.ABIMethod) => {
    return mt.name == name;
  });
  if (m === undefined) throw Error("Method undefined: " + name);
  return m;
}

const Home = () => {
  const algodTokenRef = useRef<HTMLInputElement>(null);
  const algodServerRef = useRef<HTMLInputElement>(null);
  const algodPortRef = useRef<HTMLInputElement>(null);
  const kmdTokenRef = useRef<HTMLInputElement>(null);
  const kmdServerRef = useRef<HTMLInputElement>(null);
  const kmdPortRef = useRef<HTMLInputElement>(null);
  const walletIndexRef = useRef<HTMLSelectElement>(null);
  const wallets = useSelector(selectWallets);
  const wallet = useSelector(selectWallet);
  const kmd = useSelector(selectKmd);
  const algodClient = useSelector(selectAlgod);
  const appId = useSelector(selectAppId);
  const accounts = useSelector(selectAccounts);
  const acctInUse = useSelector(selectAcctInUse);
  const [acctCreatedApps, setAcctCreatedApps] = useState<CreatedApp[]>();
  const dispatch = useDispatch();

  const chooseAcct = useCallback(
    async (acct: Account) => {
      if (acct !== acctInUse) {
        dispatch(setAcctInUse(acct));
      }
    },
    [acctInUse]
  );

  const getCreatedApps = useCallback(async () => {
    if (acctInUse && algodClient) {
      const acctInfo = await algodClient
        .accountInformation(acctInUse.addr)
        .do();
      let apps = acctInfo["created-apps"];
      apps.unshift({ id: 0 });
      setAcctCreatedApps(apps);
    }
  }, [acctInUse, algodClient]);

  useEffect(() => {
    getCreatedApps();
  }, [getCreatedApps]);

  useEffect(() => {
    if (kmd) {
      console.log("kmd? ", kmd);
      dispatch(getWallets(""));
    }
  }, [kmd]);

  useEffect(() => {
    if (
      wallets &&
      !wallet &&
      walletIndexRef.current &&
      walletIndexRef.current.value
    ) {
      dispatch(setWallet(Number(walletIndexRef.current.value)));
    }
  }, [wallets, walletIndexRef]);

  useEffect(() => {
    if (wallet) {
      dispatch(getAccounts(wallet.id));
    }
  }, [wallet]);

  const createNewAlgod = useCallback(() => {
    if (
      algodTokenRef.current &&
      algodTokenRef.current.value &&
      algodServerRef.current &&
      algodServerRef.current.value &&
      algodPortRef.current &&
      algodPortRef.current.value
    ) {
      dispatch(
        setAlgod(
          new algosdk.Algodv2(
            algodTokenRef.current.value,
            algodServerRef.current.value,
            algodPortRef.current.value
          )
        )
      );
    }
  }, [algodTokenRef, algodServerRef, algodPortRef]);

  const createNewKmd = useCallback(() => {
    if (
      kmdTokenRef.current &&
      kmdTokenRef.current.value &&
      kmdServerRef.current &&
      kmdServerRef.current.value &&
      kmdPortRef.current &&
      kmdPortRef.current.value
    ) {
      dispatch(
        setKmd(
          new algosdk.Kmd(
            kmdTokenRef.current.value,
            kmdServerRef.current.value,
            kmdPortRef.current.value
          )
        )
      );
    }
  }, [kmdTokenRef, kmdServerRef, kmdPortRef]);

  useEffect(() => {
    if (createNewAlgod) {
      createNewAlgod();
    }
    if (createNewKmd) {
      createNewKmd();
    }
  }, [createNewAlgod, createNewKmd]);

  return (
    <>
      <Header>
        <h1 className="title">ARC4 ERC20 ABI Demo</h1>
        <h3>{ERC20.desc}</h3>
        <span>Only available with sandbox and KMD</span>
      </Header>
      <div className="home-wrapper">
        <InfoTable>
          <div>
            <span>Algod Token: </span>
            <input
              type="text"
              value="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
              ref={algodTokenRef}
              onChange={createNewAlgod}
            />
          </div>
          <div>
            <span>Algod Server: </span>
            <input
              type="text"
              value="http://localhost"
              ref={algodServerRef}
              onChange={createNewAlgod}
            />
          </div>
          <div>
            <span>Algod Port: </span>
            <input
              type="text"
              ref={algodPortRef}
              value="4001"
              onChange={createNewAlgod}
              placeholder="4001"
            />
          </div>
          <div>
            <span>KMD Token: </span>
            <input
              type="text"
              value="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
              ref={kmdTokenRef}
              onChange={createNewKmd}
            />
          </div>
          <div>
            <span>KMD Server: </span>
            <input
              type="text"
              value="http://localhost"
              ref={kmdServerRef}
              onChange={createNewKmd}
            />
          </div>
          <div>
            <span>KMD Port: </span>
            <input
              type="text"
              ref={kmdPortRef}
              value="4002"
              onChange={createNewKmd}
              placeholder="4002"
            />
          </div>
          {wallets && (
            <div>
              <span>KMD Wallets</span>
              <select name="wallets" ref={walletIndexRef}>
                {wallets.map((wallet: Wallet, index: number) => (
                  <option key={wallet.id} value={index}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {wallets && (
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
          )}
          {accounts && (
            <div>
              <span className="valign-top">KMD accounts: </span>
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
          {acctInUse && acctCreatedApps && (
            <div>
              <span className="valign-top">Apps created by Account: </span>
              <AccountList>
                {acctCreatedApps.map((app: CreatedApp) => (
                  <li key={app.id}>
                    <span>App ID: {app.id}</span>
                    <Button
                      onClick={() => dispatch(setAppId(app.id))}
                      data-active={appId === app.id}
                    >
                      {appId === app.id ? "Current" : "Use"}
                    </Button>
                  </li>
                ))}
              </AccountList>
            </div>
          )}
        </InfoTable>
        <h2></h2>

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
