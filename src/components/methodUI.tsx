import algosdk, { ABIMethod, ABIResult } from "algosdk";
import React, { useRef, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  selectAcctInUse,
  selectAlgod,
  selectAppId,
} from "../features/applicationSlice";
import { parseInputValue, parseReturnValue } from "../utils/ABIutils";
import {
  Arg,
  Button,
  Caption,
  Desc,
  Footer,
  MethodWrapper,
  Result,
  ResultWrapper,
  Return,
  ReturnHeader,
} from "./methodUI.styles";

type Arg = {
  type: string;
  name: string;
  desc: string;
};

type Method = {
  name: string;
  desc: string;
  args: Arg[];
  returns: {
    type: string;
    desc: string;
  };
};

const MethodUI = ({
  method,
  contractMethod,
}: {
  method: Method;
  contractMethod: ABIMethod;
}) => {
  const refs = useRef<React.MutableRefObject<HTMLInputElement>[]>([]);
  const acctInUse = useSelector(selectAcctInUse);
  const algodClient = useSelector(selectAlgod);
  const appID = useSelector(selectAppId);
  const [loading, setLoading] = useState(false);
  const [numOfArgs, setNumOfArgs] = useState(0);
  const [queryResult, setQueryResult] = useState<ABIResult>();

  useEffect(() => {
    if (method && method.args) {
      setNumOfArgs(method.args.length);
      refs.current = refs.current.splice(0, method.args.length);
      for (let i = 0; i < method.args.length; i++) {
        refs.current[i] =
          refs.current[i] ||
          React.createRef<React.MutableRefObject<HTMLInputElement>>();
      }
      refs.current = refs.current.map(
        (item) =>
          item || React.createRef<React.MutableRefObject<HTMLInputElement>>()
      );
    }
  }, [method]);

  const performQuery = useCallback(async () => {
    if (!algodClient) {
      console.error("Algod client is not working");
      return;
    }

    if (!acctInUse) {
      console.error("Accounts are undefined");
      return;
    }

    if (loading) {
      console.log("Query in progress");
      return;
    }

    if (!appID) {
      return;
    }

    setLoading(true);

    const atc = new algosdk.AtomicTransactionComposer();

    const suggestedParams = await algodClient.getTransactionParams().do();

    const commonParams = {
      appID,
      sender: acctInUse.addr,
      suggestedParams,
      signer: algosdk.makeBasicAccountTransactionSigner(acctInUse),
    };

    const methodArgs = refs.current.map((ref) =>
      parseInputValue(
        ref.current.value,
        ref.current.getAttribute("data-arg-type")!
      )
    );

    // Simple call to the `add` method, method_args can be any type but _must_
    // match those in the method signature of the contract
    atc.addMethodCall({
      method: contractMethod,
      methodArgs,
      ...commonParams,
    });

    try {
      const result = await atc.execute(algodClient, 2);

      for (const idx in result.methodResults) {
        setQueryResult(result.methodResults[idx]);
        setLoading(false);
      }
    } catch (error) {
      setLoading(false);
      console.error("Query failed with error: ", error);
    }
  }, [acctInUse, appID, algodClient]);

  return (
    <MethodWrapper>
      <h3>{method.name}</h3>
      <Caption>{method.desc}</Caption>
      {method.args.map((arg, index) => (
        <Arg key={arg.name}>
          <h4>
            {arg.name} ({arg.type})
          </h4>
          <Desc>{arg.desc}</Desc>
          <input
            placeholder={`${arg.name} (${arg.type})`}
            data-arg-type={arg.type}
            ref={refs.current[index]}
          ></input>
        </Arg>
      ))}
      <Footer>
        <Button onClick={performQuery} disabled={!acctInUse || loading}>
          {loading ? "Querying..." : "Query"}
        </Button>
        <Return>
          <ReturnHeader>
            <span>Returns</span>
            <code>type {method.returns.type}</code>
          </ReturnHeader>{" "}
          - <Desc>{method.returns.desc}</Desc>
        </Return>
      </Footer>
      {queryResult && (
        <ResultWrapper>
          <h4>Result</h4>
          {queryResult.txID && <p>Transaction ID: {queryResult.txID}</p>}
          <Result>
            {queryResult.returnValue
              ? parseReturnValue(queryResult.returnValue, method.returns.type)
              : queryResult.decodeError
              ? `${queryResult.decodeError.message}\n${queryResult.decodeError.stack}`
              : "No results"}
          </Result>
        </ResultWrapper>
      )}
    </MethodWrapper>
  );
};

export default MethodUI;
