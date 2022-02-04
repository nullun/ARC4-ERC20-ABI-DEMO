import algosdk, { ABIMethod } from "algosdk";
import React, { useRef, useState, useEffect } from "react";
import { algodClient, contract } from "../pages/home";
import {
  Arg,
  Button,
  Caption,
  Desc,
  Footer,
  MethodWrapper,
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

const atc = new algosdk.AtomicTransactionComposer();
const genesis_hash = "3eaaT1N53+o6+zJfxMF2Nk5TnWVNre6BRF5hFy+ef8U=";

const MethodUI = ({
  method,
  contractMethod,
}: {
  method: Method;
  contractMethod: ABIMethod;
}) => {
  const [numOfArgs, setNumOfArgs] = useState(0);
  const refs = useRef<React.MutableRefObject<HTMLInputElement>[]>([]);

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

  const performQuery = async () => {
    const suggestedParams = await algodClient.getTransactionParams().do();

    const acct = algosdk.generateAccount();

    const commonParams = {
      appID: contract.networks[genesis_hash].appID,
      sender: acct.addr,
      suggestedParams,
      signer: algosdk.makeBasicAccountTransactionSigner(acct),
    };

    const methodArgs = refs.current.map((ref) => ref.current.value);

    // Simple call to the `add` method, method_args can be any type but _must_
    // match those in the method signature of the contract
    atc.addMethodCall({
      method: contractMethod,
      methodArgs,
      ...commonParams,
    });

    const result = await atc.execute(algodClient, 2);
    for (const idx in result.methodResults) {
      console.log(result.methodResults[idx]);
    }
  };

  return (
    <MethodWrapper>
      <h5>{method.name}</h5>
      <Caption>{method.desc}</Caption>
      {method.args.map((arg, index) => (
        <Arg key={arg.name}>
          <h6>
            {arg.name} ({arg.type})
          </h6>
          <Desc>{arg.desc}</Desc>
          <input
            placeholder={`${arg.name} (${arg.type})`}
            ref={refs.current[index]}
          ></input>
        </Arg>
      ))}
      <Footer>
        {method.args.length > 0 && (
          <Button onClick={performQuery}>Query</Button>
        )}
        <Return>
          <ReturnHeader>
            <span>Returns</span>
            <code>type {method.returns.type}</code>
          </ReturnHeader>{" "}
          - <Desc>{method.returns.desc}</Desc>
        </Return>
      </Footer>
    </MethodWrapper>
  );
};

export default MethodUI;
