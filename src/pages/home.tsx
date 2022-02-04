import algosdk, {
  Account,
  encodeUint64,
  OnApplicationComplete,
  signLogicSigTransactionObject,
} from "algosdk";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ERC20 from "../../contracts/ERC20.json";
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
import {
  AccountList,
  Button,
  DeployButton,
  DeployInfo,
  Header,
  InfoTable,
  Methods,
} from "./home.styles";
import contractBinaries from "../../contracts/contractBinaries";

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
  const algodClient = useSelector(selectAlgod);
  const kmdTokenRef = useRef<HTMLInputElement>(null);
  const kmdServerRef = useRef<HTMLInputElement>(null);
  const kmdPortRef = useRef<HTMLInputElement>(null);
  const walletIndexRef = useRef<HTMLSelectElement>(null);
  const wallets = useSelector(selectWallets);
  const wallet = useSelector(selectWallet);
  const kmd = useSelector(selectKmd);
  const appId = useSelector(selectAppId);
  const accounts = useSelector(selectAccounts);
  const acctInUse = useSelector(selectAcctInUse);
  const [deploying, setDeploying] = useState(false);
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

  const deployApp = async () => {
    if (!acctInUse) {
      alert("No account chosen");
      return;
    }
    if (!algodClient) {
      console.error("Algod client is not working");
      return;
    }
    const atc = new algosdk.AtomicTransactionComposer();
    const approval = new Uint8Array(
      Buffer.from(contractBinaries.approval, "base64")
    );
    const clear = new Uint8Array(Buffer.from(contractBinaries.clear, "base64"));
    const suggestedParams = await algodClient.getTransactionParams().do();

    /**
       * good ol' way
       * const createAppTx = algosdk.makeApplicationCreateTxnFromObject({
          from: acctInUse.addr,
          approvalProgram: approval,
          clearProgram: clear,
          numGlobalByteSlices: 2,
          numGlobalInts: 2,
          numLocalByteSlices: 0,
          numLocalInts: 16,
          appArgs: [
            new Uint8Array(Buffer.from("TestToken")),
            new Uint8Array(Buffer.from("TT")),
            encodeUint64(10000),
            encodeUint64(2),
          ],
          onComplete: OnApplicationComplete.OptInOC,
          suggestedParams,
        });

        const signedTx = {
          txn: createAppTx,
          signer: algosdk.makeBasicAccountTransactionSigner(acctInUse),
        };

        atc.addTransaction(signedTx);
       */

    /**
       * addMethodCall way
       * atc.addMethodCall({
          approvalProgram: approval,
          clearProgram: clear,
          numGlobalByteSlices: 2,
          numGlobalInts: 2,
          numLocalByteSlices: 0,
          numLocalInts: 16,
          onComplete: OnApplicationComplete.OptInOC,
          method: getMethodByName("deploy"),
          methodArgs: ["TestToken", "TT", 10000, 2],
          appID: 0,
          sender: acctInUse.addr,
          suggestedParams,
          signer: algosdk.makeBasicAccountTransactionSigner(acctInUse),
        });

        try {
          const result = await atc.execute(algodClient, 2);

          for (const idx in result.methodResults) {
            console.log(result.methodResults[idx]);
            // setQueryResult(result.methodResults[idx]);
          }
        } catch (error) {
          console.error("Query failed with error: ", error);
        }
       */

    try {
      const result = await atc.execute(algodClient, 2);

      for (const idx in result.methodResults) {
        console.log(result.methodResults[idx]);
        // setQueryResult(result.methodResults[idx]);
      }
    } catch (error) {
      console.error("Query failed with error: ", error);
    }
  };

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
        <p>Only available with sandbox and KMD</p>
      </Header>
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
          <div>
            <span>App ID: </span>
            <input
              defaultValue={appId}
              type="number"
              onChange={(event) => {
                console.log("app id? ", event.target.value);
                dispatch(setAppId(Number(event.target.value)));
              }}
            />
          </div>
        </InfoTable>
        <DeployInfo>
          <h2>Deploy App</h2>
          <p>
            You can deploy the demo app using <code>deploy.sh</code> or{" "}
            <code>demo.sh</code>, or by clicking the following button.
          </p>
          <DeployButton onClick={deployApp}>
            {deploying ? "Deploying..." : "Deploy"}
          </DeployButton>
        </DeployInfo>
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
