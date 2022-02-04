import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { State } from "../store";
import algosdk, { Account } from "algosdk";

const kmdToken =
  "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const kmdServer = "http://localhost";
const kmdPort = 4002;

const kmdClient = new algosdk.Kmd(kmdToken, kmdServer, kmdPort);

type Wallet = {
  driver_name: string;
  driver_version: number;
  id: string;
  mnemonic_ux: boolean;
  name: string;
  supported_txs: string[];
};

export interface IApplicationState {
  wallet: Wallet | undefined;
  walletHandle: string;
  accounts: Account[] | undefined;
  acctInUse: Account | undefined;
}

const initialState: IApplicationState = {
  wallet: undefined,
  walletHandle: "",
  accounts: undefined,
  acctInUse: undefined,
};

export const getWallet = createAsyncThunk("app/getWallet", async () => {
  const wallet = (await kmdClient.listWallets()).wallets[0];
  return wallet;
});

export const getAccounts = createAsyncThunk(
  "app/getAccounts",
  async (walletId: string) => {
    const walletHandle = (await kmdClient.initWalletHandle(walletId, ""))
      .wallet_handle_token;
    const { addresses } = await kmdClient.listKeys(walletHandle);
    const getAcctKeyPromises = addresses.map((addr: string) =>
      kmdClient.exportKey(walletHandle, "", addr)
    );
    const acctKeys = await Promise.all(getAcctKeyPromises);
    const accounts = acctKeys.map((acctKey, index) => ({
      addr: addresses[index],
      sk: acctKey.private_key,
    }));
    return accounts;
  }
);

export const applicationSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setAcctInUse(state, action) {
      state.acctInUse = action.payload;
    },
  },
  extraReducers(builder) {
    builder
      .addCase(getWallet.fulfilled, (state, action: PayloadAction<Wallet>) => {
        state.wallet = action.payload;
      })
      .addCase(
        getAccounts.fulfilled,
        (state, action: PayloadAction<Account[]>) => {
          state.accounts = action.payload;
          state.acctInUse = action.payload[0];
        }
      );
  },
});

export const selectWallet = (state: State) => state.app.wallet;
export const selectAccounts = (state: State) => state.app.accounts;
export const selectAcctInUse = (state: State) => state.app.acctInUse;

export const { setAcctInUse } = applicationSlice.actions;

export default applicationSlice.reducer;
