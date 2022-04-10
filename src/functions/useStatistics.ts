import { useAddress, useWeb3Context } from "../hooks/web3Context";
  import { BigNumber, ethers } from "ethers"; 
import contracts from "../abi/deployments.mainnet.json";
import { BigNumber as bn} from 'bignumber.js'
import  DEPS from "../abi/deployments.mainnet.json";


import {
  getBalance,
  getDisplayBalance,
  getFullDisplayBalance,
} from "../utils/formatBalance"; 
import {  REACT_APP_SUPPORTED_CHAINID,  TOKEN, WETH9,APP_ID } from "../appconfig";

import ERC20 from "../types/ERC20";
import { parseEther, parseUnits } from "ethers/lib/utils";
import Parse from 'parse';
import { getBestTradeRoute } from "elloswap-sdk";
import { SwapParameters, Token } from "./interfaces";


export const getSwaps =async(payValue: any)=>{
       
  const swapParameters = await getBestTradeRoute(REACT_APP_SUPPORTED_CHAINID, WETH9.address, TOKEN.address, new bn(payValue) );

  return swapParameters;
}


export const getSwapPrice =async(earnTokenAdd: string,payValue: any)=>{
       
  const swapParameters = await getBestTradeRoute(REACT_APP_SUPPORTED_CHAINID, WETH9.address, earnTokenAdd, new bn(payValue) );

  return swapParameters;
}




export const getTokenPerSecond = async (
  earnTokenName: string,
  poolContract: ethers.Contract,
  depositTokenName: string
) => {
  const rewardPerSecond = await poolContract.tSharePerSecond();

  return rewardPerSecond.mul(20000).div(45000);
};


export const tokenBalance = async (
  provider: any,
  address: any,
  stakingTokenAddress: any
) => {
  const tokenContract = new ethers.Contract(
    stakingTokenAddress,
    contracts.tomb.abi,
    provider
  );
  const userBalance = await tokenContract.balanceOf(address);
  return userBalance;
};
 
  

export const userAllowance = async (
  provider: any,
  address: any,
  stakingTokenAddress: any,
  poolContractAddress: any
) => {
  const tokenContract = new ethers.Contract(
    stakingTokenAddress,
    contracts.tomb.abi,
    provider
  );
  const userAllowance = await tokenContract.allowance(
    address,
    poolContractAddress
  );
  return userAllowance;
};


export const  getShareStat = async( signer: any, earnTokenName: string,) => {
 
  const priceInFTMZ : SwapParameters | any= await getSwapPrice(DEPS.tShare.address,new bn('1000000000000000'));
 

  let obj  = priceInFTMZ.data.tokens;
    let price;
     
    let addressval = new String(DEPS.tShare.address).toLowerCase()
    price = obj[addressval].price; 

  const priceOfSharesInDollars = price; 
 

  return { 
    priceInDollars: priceOfSharesInDollars, 
  };
}


export const poolStatistics = async (
  provider: any,
  address: any,
  stakingTokenAddress: any,
  depositTokenName: string,
  earnTokenName: string,
  poolContractAddress: any
) => { 

  const signer = provider.getSigner();
  const poolContract = new ethers.Contract(
    poolContractAddress,
      DEPS.HamSingleStakeHShareReward.abi,
      provider
    );

    const depositToken = new ERC20(stakingTokenAddress, signer, depositTokenName, TOKEN.decimals);

    const tokensPrice : SwapParameters | any= await getSwaps(new bn('1000000000000000'));

    let obj : Token[] = tokensPrice.data.tokens;
    let price; 
      price = obj[stakingTokenAddress.toLowerCase()].price; 

    const depositTokenPrice = price;
    const stakeInPool = await depositToken.balanceOf(poolContractAddress);
      const TVL = Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
      const stat =  await getShareStat(signer,earnTokenName);
      let tokenPerSecond = await poolContract.hSharePerSecond();
      tokenPerSecond= tokenPerSecond.div(5);
      const tokenPerHour = tokenPerSecond.mul(60).mul(60);
      const totalRewardPricePerYear =
        Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24).mul(365)));
      const totalRewardPricePerDay = Number(stat.priceInDollars) * Number(getDisplayBalance(tokenPerHour.mul(24)));
      const totalStakingTokenInPool =
        Number(depositTokenPrice) * Number(getDisplayBalance(stakeInPool, depositToken.decimal));
      const dailyAPR = (totalRewardPricePerDay / totalStakingTokenInPool) * 100;
      const yearlyAPR = (totalRewardPricePerYear / totalStakingTokenInPool) * 100;



    return {
      dailyAPR: dailyAPR.toFixed(2).toString(),
      yearlyAPR: yearlyAPR.toFixed(2).toString(),
      TVL: TVL.toFixed(2).toString(),
    };
};
 

export const updateBackendForStats = async(apr:string,tvl:string)=> {


   const queryAppConfig: Parse.Query = new Parse.Query('PoolConfig');
  queryAppConfig.equalTo('appId', APP_ID);

  const object: Parse.Object[] = await queryAppConfig.find();

    const json =object[0].toJSON();
    const PoolConfig: Parse.Object  = object[0];
    const saveObject :Parse.Object = PoolConfig.clone();

    saveObject.set(json);  
    saveObject.set('stakingAPY',Number(apr));
    saveObject.set('stakingTvl',Number(tvl));

    saveObject.save(); 
  
}



const getXbombExchange = async(xbombToken: ethers.Contract)=> {
  const XbombExchange = await xbombToken.getExchangeRate();

  const xBombPerBomb = parseFloat(XbombExchange) / 1000000000000000000;
  const xBombRate = xBombPerBomb.toString();
  return parseUnits(xBombRate, 18);
}

const getDepositTokenPriceInDollars= async(symbol: any, bombToken: ethers.Contract)=> {

    let tokenPrice;
 
    tokenPrice = await  getTokenPriceFrom1Inch(bombToken);

   return tokenPrice;
}

const  getWBNBPriceFromPancakeswap = async()=> {

  const usdtAddress = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
  const wbnbAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

  const APIURL = "https://api.1inch.io/v4.0/56/quote?fromTokenAddress=" + wbnbAddress + "&toTokenAddress=" + usdtAddress + "&amount=" + parseEther("1.0");
  const res = await fetch(APIURL);
  const data = await res.json();

  const value = BigNumber.from(data.toTokenAmount);

  const value1 = ethers.utils.formatEther(value);

  console.log(value1);

  return value1;
   
}


const  getTokenPriceFrom1Inch = async(bombToken: ethers.Contract)=> {

  const usdtAddress = '0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56';
  const wbnbAddress = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c';

  const APIURL = "https://api.1inch.io/v4.0/56/quote?fromTokenAddress=" + bombToken.address  + "&toTokenAddress=" + usdtAddress+ "&amount=" + parseEther("1.0");
  const res = await fetch(APIURL);
  const data = await res.json();

  const value = BigNumber.from(data.toTokenAmount);

  const value1 = ethers.utils.formatEther(value);

  console.log(value1);

  return value1;
   
}




export async function createTransactionData(address: any,tnxtype: any,transaction: any,SRCCONTRACT: any,DESTCONTRACT: any,amountInBn: any){



  const myNewObject: Parse.Object = new Parse.Object('UserTransactions');
  myNewObject.set('Address', address);
  myNewObject.set('Type', tnxtype); 
  myNewObject.set('TnxHash', transaction);
  myNewObject.set('FromToken',SRCCONTRACT);
  myNewObject.set('ToToken', DESTCONTRACT);
  myNewObject.set('AmountInUsd', 'A string');
  myNewObject.set('Amount', amountInBn);
  myNewObject.set('Currency', SRCCONTRACT);
  try {
    const result: Parse.Object = await myNewObject.save();
    // Access the Parse Object attributes using the .GET method
    console.log('UserTransactions created', result);
  } catch (error: any) {
    console.error('Error while creating UserTransactions: ', error);
  }

}
