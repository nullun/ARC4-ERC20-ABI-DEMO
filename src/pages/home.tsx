import algosdk, { Account, waitForConfirmation } from "algosdk";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ERC20 from "../../contracts/ERC20_Interface.json";
import MethodUI from "../components/methodUI";
import {
  getAccounts,
  getAcctInfo,
  getWallets,
  selectAccounts,
  selectAcctInfo,
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
import { useOptIntoApp } from "../hooks/account";
import { CreatedApp } from "../types/AccountResponse";
import {
  AccountList,
  Button,
  Endpoints,
  Endpoint,
  Header,
  InfoTable,
  InfoTableInner,
  Methods,
  Section,
  TxButton,
  TxButtonsWrapper,
  ToggleButton,
} from "./home.styles";

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
  const acctInfo = useSelector(selectAcctInfo);
  const [acctCreatedApps, setAcctCreatedApps] = useState<CreatedApp[]>();
  const [selfDefinedAppId, setSelfDefinedAppId] = useState(0);
  const [acctOptedInApps, setAcctOptedInApps] = useState<number[]>();
  const [optingIn, setOptingIn] = useState(false);
  const [optedIn, setOptedIn] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const dispatch = useDispatch();
  const optIntoApp = useOptIntoApp(setOptingIn);

  const appIdButtonClickHandler = (_appId: number) => {
    dispatch(setAppId(_appId));
    setSelfDefinedAppId(_appId);
  };

  const chooseAcct = useCallback(
    async (acct: Account) => {
      if (acct !== acctInUse) {
        dispatch(setAcctInUse(acct));
      }
    },
    [acctInUse]
  );

  const setAcctApps = useCallback(async () => {
    if (acctInfo) {
      // get created apps
      let createdApps = [...acctInfo["created-apps"]];
      createdApps.unshift({ id: 0 });
      setAcctCreatedApps(createdApps);
      // get opted in apps
      const optedInApps = acctInfo["apps-local-state"].map((app) => app.id);
      setAcctOptedInApps(optedInApps);
    }
  }, [acctInfo]);

  useEffect(() => {
    if (acctOptedInApps && appId) {
      const hasOptedIn =
        acctOptedInApps.findIndex((val) => val === appId) !== -1;
      setOptedIn(hasOptedIn);
    }
  }, [appId, acctOptedInApps]);

  useEffect(() => {
    if (acctInUse && algodClient) {
      dispatch(getAcctInfo(null));
    }
  }, [acctInUse, algodClient]);

  useEffect(() => {
    setAcctApps();
  }, [setAcctApps]);

  useEffect(() => {
    if (kmd) {
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
      <InfoTable>
        <InfoTableInner data-show={showConfig}>
          <h2>Config</h2>
          <Endpoints>
            <Endpoint>
              <span>Algod: </span>
              <input
                type="text"
                value="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                ref={algodTokenRef}
                onChange={createNewAlgod}
              />
              <input
                type="text"
                value="http://localhost"
                ref={algodServerRef}
                onChange={createNewAlgod}
              />
              <input
                type="text"
                ref={algodPortRef}
                value="4001"
                onChange={createNewAlgod}
                placeholder="4001"
              />
            </Endpoint>
            <Endpoint>
              <span>KMD: </span>
              <input
                type="text"
                value="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"
                ref={kmdTokenRef}
                onChange={createNewKmd}
              />
              <input
                type="text"
                value="http://localhost"
                ref={kmdServerRef}
                onChange={createNewKmd}
              />
              <input
                type="text"
                ref={kmdPortRef}
                value="4002"
                onChange={createNewKmd}
                placeholder="4002"
              />
            </Endpoint>
          </Endpoints>
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
              <span>KMD Status: </span>
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
                      onClick={() => appIdButtonClickHandler(app.id)}
                      data-active={appId === app.id}
                    >
                      {appId === app.id ? "Current" : "Use"}
                    </Button>
                  </li>
                ))}
              </AccountList>
            </div>
          )}
          {acctInUse && (
            <>
              <div>
                <span>Self-defined App ID: </span>
                <div>
                  <input
                    type="number"
                    value={selfDefinedAppId}
                    onChange={(event) =>
                      setSelfDefinedAppId(Number(event.target.value))
                    }
                  />
                  <Button
                    onClick={() => dispatch(setAppId(selfDefinedAppId))}
                    data-active={appId === selfDefinedAppId}
                  >
                    {appId === selfDefinedAppId ? "Current" : "Use"}
                  </Button>
                </div>
              </div>
              <div>
                <span>Opted-in Apps: </span>
                <div>
                  {acctOptedInApps ? acctOptedInApps.join(", ") : "None"}
                </div>
              </div>
            </>
          )}
          <ToggleButton onClick={() => setShowConfig(!showConfig)} />
        </InfoTableInner>
      </InfoTable>
      <Section>
        <h2>App Operations</h2>
        <TxButtonsWrapper>
          <TxButton
            onClick={optIntoApp}
            disabled={optingIn || optedIn || appId === 0}
          >
            {optedIn ? "Opted in" : optingIn ? "Opting in..." : "Opt in"}
            {appId === 0 && " unavailable"}
          </TxButton>
        </TxButtonsWrapper>
      </Section>
      <Section>
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
      </Section>
    </>
  );
};

export default Home;
