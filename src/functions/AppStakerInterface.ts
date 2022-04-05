import { ethers} from "ethers"; 
  import { clearPendingTxn, fetchPendingTxns } from "../reducers/PendingTxnsSlice";
import { createAsyncThunk } from "@reduxjs/toolkit"; 
import { error, info } from "../reducers/MessagesSlice";
import { IActionValueAsyncThunk, IChangeApprovalAsyncThunk, IJsonRPCError, IStakeAsyncThunk } from "./interfaces"; 
 import deps from "../abi/deployments.mainnet.json";
import { BNToEther } from "../handlers";
import { tokenBalance,getSwaps } from '../functions/useStatistics';


interface IUAData {
  address: string;
  amount: string;
  approved: boolean;
  txHash: string | null;
  type: string | null;
}
 
export const changeApproval = createAsyncThunk(
  "app/changeApproval",
  async ({ token, pool,provider, address,notifications  }: IChangeApprovalAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const tokenContract = new ethers.Contract(
        token,
        deps.tomb.abi,
        signer
    ); 
    let approveTx;
    let presaleAllowance = await tokenContract.allowance(address, pool);

 
    // return early if approval has already happened
    if (presaleAllowance.gt(0)) {
      dispatch(info("Approval completed."));  
      notifications.showNotification({
        title: 'Approval completed.',
        message: 'Approval completed. 🤥',
      })
    }

    try {
      
        console.log("Approve address "+address);
        console.log("Approve token ere "+token);
        console.log("Approve pool ere "+pool);
        // won't run if stakeAllowance > 0
        approveTx = await tokenContract.approve(
            pool,
            ethers.utils.parseUnits("1000000000", "ether").toString(),
        );
      
        console.log("Approve Tnx recieved ere "+approveTx);

      const text = "Approve Token";
      const pendingTxnType = "approve_deposit";
      dispatch(fetchPendingTxns({ txnHash: approveTx.hash, text, type: pendingTxnType }));

      await approveTx.wait();
    } catch (e: unknown) { 

      notifications.showNotification({
        color: 'red',
        title: 'Error.',
        message: (e as IJsonRPCError).message,
      })


      return;
    } finally {
      if (approveTx) {
        dispatch(clearPendingTxn(approveTx.hash));
        notifications.showNotification({
            title: 'Info.',
            message: 'Succesfully Approved',
          })

          window.location.reload();

     
      }
    } 
  },
);


export const stakeToken = createAsyncThunk(
  "app/stakeToken",
  async ({ token,amount, pool,provider, address,notifications  }: IStakeAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const poolContract = new ethers.Contract(
        pool,
        deps.PiggyPShareRewardPool.abi,
        signer
    );  
    const value1 = ethers.utils.parseEther(amount.toString());
    let depositTx;
    let uaData: IUAData = {
      address: address,
      amount: value1.toString(),
      approved: true,
      txHash: null,
      type: null,
    }; 

    try {
      
        console.log("Approve address "+address);
        console.log("Approve token ere "+token);
        console.log("Approve pool ere "+pool);
        // won't run if stakeAllowance > 0
        depositTx = await poolContract.deposit(2,uaData.amount);
      
        console.log("Deposit Tnx recieved ere "+depositTx);

      const text = "Deposit Token";
      const pendingTxnType = "deposit";
      dispatch(fetchPendingTxns({ txnHash: depositTx.hash, text, type: pendingTxnType }));

      await depositTx.wait();
    } catch (e: unknown) { 

      notifications.showNotification({
        color: 'red',
        title: 'Error.',
        message: (e as IJsonRPCError).message,
      })


      return;
    } finally {
      if (depositTx) {
        dispatch(clearPendingTxn(depositTx.hash));
        notifications.showNotification({
            title: 'Info.',
            message: 'Succesfully Deposited',
          })
          window.location.reload();
    
      }
    } 
  },
);



export const unstakeToken = createAsyncThunk(
  "app/unstakeToken",
  async ({ token,amount, pool,provider, address,notifications,claimFlag  }: IStakeAsyncThunk, { dispatch }) => {
    if (!provider) {
      dispatch(error("Please connect your wallet!"));
      return;
    }

    const signer = provider.getSigner();
    const poolContract = new ethers.Contract(
      deps.PiggyPShareRewardPool.address,
      deps.PiggyPShareRewardPool.abi,
        signer
    );  
    const value1 = ethers.utils.parseEther(amount.toString());
    let depositTx;
    let uaData: IUAData = {
      address: address,
      amount: value1.toString(),
      approved: true,
      txHash: null,
      type: null,
    }; 

    try {
      
        console.log("Approve address "+address);
        console.log("Approve token ere "+token);
        console.log("Approve pool ere "+pool);
        // won't run if stakeAllowance > 0
        if(claimFlag)uaData.amount="0";

        depositTx = await poolContract.withdraw(2,uaData.amount);
      
        console.log("Deposit Tnx recieved ere "+depositTx);

      const text = "Unstake Token";
      const pendingTxnType = "Unstake";
      dispatch(fetchPendingTxns({ txnHash: depositTx.hash, text, type: pendingTxnType }));

      await depositTx.wait();
    } catch (e: unknown) { 

      notifications.showNotification({
        title: 'Error.',
        message: (e as IJsonRPCError).message,
      })


      return;
    } finally {
      if (depositTx) {
        dispatch(clearPendingTxn(depositTx.hash));
        notifications.showNotification({
            title: 'Info.',
            message: 'Succesfully Unstaked',
          })
          window.location.reload();
    
      }
    } 
  },
);

 
