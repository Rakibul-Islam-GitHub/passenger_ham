import { createAsyncThunk, createSelector, createSlice } from "@reduxjs/toolkit";
import { JsonRpcProvider, StaticJsonRpcProvider } from "@ethersproject/providers";
import { error } from "./MessagesSlice";
import { setAll } from "../handlers";
import { Reactor } from "../reactors/Reactor";
import {   NETWORKS } from "../appconfig";
import { RootState } from "../store";
import { EnvHelper } from "../reactors/Environment";

interface IGetCurrentNetwork {
  provider: StaticJsonRpcProvider | JsonRpcProvider;
}

export const initializeNetwork = createAsyncThunk(
  "network/getCurrentNetwork",
  async ({ provider }: IGetCurrentNetwork, { dispatch }): Promise<INetworkSlice> => {
    try {
      let networkName: string;
      let uri: string;
      let supported: boolean = true;
      const id   = await provider.getNetwork().then(network => network.chainId);

      const {supportedId,supportednetworkName} = Reactor.getSupportedNetwork();

      if( id === supportedId){
        networkName = supportednetworkName;
        uri = NETWORKS[supportedId].rpcUrls[0];
      } 
      else {
        supported = false;
        networkName = "Unsupported Network";
        uri = "";
        dispatch(switchNetwork({ provider: provider, networkId: supportedId }));
      } 

      return {
        networkId: id,
        networkName: networkName,
        uri: uri,
        initialized: supported,
      };
    } catch (e) {
      console.log(e);
      dispatch(error("Error connecting to wallet!"));
      return {
        networkId: -1,
        networkName: "",
        uri: "",
        initialized: false,
      };
    }
  },
);

interface ISwitchNetwork {
  provider: StaticJsonRpcProvider | JsonRpcProvider;
  networkId: number;
}

export const switchNetwork = createAsyncThunk(
  "network/switchNetwork",
  async ({ provider, networkId }: ISwitchNetwork, { dispatch }) => {
    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: idToHexString(networkId) }]);
      dispatch(initializeNetwork({ provider }));
    } catch (e) {
      // If the chain has not been added to the user's wallet
      // @ts-ignore
      //if (e.code === 4902 || e.code === -32603) {
      const network = NETWORKS[networkId];
      const params = [
        {
          chainId: idToHexString(networkId),
          chainName: network["chainName"],
          nativeCurrency: network["nativeCurrency"],
          rpcUrls: network["rpcUrls"],
          blockExplorerUrls: network["blockExplorerUrls"],
        },
      ];

      try {
        await provider.send("wallet_addEthereumChain", params);
        dispatch(initializeNetwork({ provider }));
      } catch (e) {
        console.log(e);
        dispatch(error("Error switching network!"));
      }
      // }
    }
  },
);

const idToHexString = (id: number) => {
  return "0x" + id.toString(16);
};

interface INetworkSlice {
  networkId: number;
  networkName: string;
  uri: string;
  initialized: boolean;
}

const initialState: INetworkSlice = {
  networkId: EnvHelper.getRunChainId(),
  networkName: NETWORKS[EnvHelper.getRunChainId()].chainName,
  uri: NETWORKS[EnvHelper.getRunChainId()].rpcUrls[0],
  initialized: false,
};

const networkSlice = createSlice({
  name: "network",
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(initializeNetwork.pending, (state, action) => {
        state.initialized = false;
      })
      .addCase(initializeNetwork.fulfilled, (state, action) => {
        state.initialized = true;
        setAll(state, action.payload);
      })
      .addCase(initializeNetwork.rejected, (state, { error }) => {
        state.initialized = false;
        console.error(error.name, error.message, error.stack);
      });
  },
});

export default networkSlice.reducer;

const baseInfo = (state: RootState) => state.network;

export const getNetworkState = createSelector(baseInfo, network => network);
