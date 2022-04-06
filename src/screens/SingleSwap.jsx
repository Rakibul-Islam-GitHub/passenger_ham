import {
    Box,
    Card,
    Text,
    Title,
    Group,
    Button,
    LoadingOverlay, 
    Badge,
    Image,
    Input,
    Grid,
} from "@mantine/core"; import { useEffect, useState } from "react";
import { ethers } from "ethers";
import srcLogo from '../assets/networks/fantom-network.png'
import destLogo from '../assets/tokens/Ham.svg'
import { tokenBalance,getSwaps } from '../functions/useStatistics';
import {  REACT_APP_SUPPORTED_CHAINID,  TOKEN, WETH9, PEG,MINSLIPPAGE,SWAPFEES,FEEWALLET } from "../appconfig";
import { useWeb3Context } from "../hooks";
import ERC20 from "../types/ERC20";
import { useNotifications } from "@mantine/notifications";
import { getBestTradeRoute, getData, getRouterAddress } from 'elloswap-sdk'
import { BigNumber } from 'bignumber.js'
import { Contract } from '@ethersproject/contracts'
import DMM_ABI from '../abi/dmm-router-v2.json'

export default function SingleSwap(props) {

    const { address } = useWeb3Context();
    const { AGGREGATOR_ROUTER } = getRouterAddress();
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const [loading, setLoading] = useState(false); 
    const signer = provider.getSigner();
    const notifications = useNotifications();
    const [destPrice, setDestPrice] = useState(0);
    const [usersrcBalance, setUsersrcBalance] = useState(0);
    const [destBalance, setDestBalance] = useState(0);
    const [payValue, setPayValue] = useState(0)
    const [buyValue, setBuyValue] = useState(0);
    const [allowanceIn, setAllowanceIn] = useState(false);
    const [allowanceOut, setAllowanceOut] = useState(false);
    const [swapEnabled, setSwapEnabled] = useState(false);
    const [destPriceCoeff, setDestPriceCoeff] = useState(0);
    const [minAmountOut, setMinAmountOut] = useState(0);
    const DESTCONTRACT = new ERC20(TOKEN.address, signer, TOKEN.name, TOKEN.decimals);
    const SRCCONTRACT = new ERC20(WETH9.address, signer, WETH9.name, WETH9.decimals);
    const amount = new BigNumber("1000000000000000000");

    const swapToken = async (payValue) => {


        const amountInBn = new BigNumber(payValue).times(10 ** WETH9.decimals);
        const feeInBn = new BigNumber(amountInBn).times(SWAPFEES).div(10000)
        const amountInAfterFeeInBn = amountInBn.minus(feeInBn) 
        setLoading(true); 
        const swapdata = await getSwaps(amountInAfterFeeInBn);
        const outputAmount = swapdata.data.outputAmount
        let newMinAmountOut = new BigNumber(outputAmount)
        newMinAmountOut = newMinAmountOut.div(1 + +MINSLIPPAGE / 100)
        await setMinAmountOut(newMinAmountOut.integerValue(BigNumber.ROUND_HALF_UP).toFixed())
    


        const data = await getData({
            chainId: REACT_APP_SUPPORTED_CHAINID,
            currencyInAddress: PEG.address,
            currencyInDecimals: PEG.decimals,
            amountIn: amountInAfterFeeInBn.toFixed(),
            currencyOutAddress: TOKEN.address,
            currencyOutDecimals: TOKEN.decimals,
            tradeConfig: {
                minAmountOut,
                recipient: address,
                deadline: Date.now() + 20 * 60 * 1000,
            },
            feeConfig: {
                isInBps:true,
                chargeFeeBy: 'currency_in',
                feeReceiver: FEEWALLET,
                feeAmount:  SWAPFEES
            },
            customTradeRoute: swapdata.swaps,
        });
 

        if (data.swapV2Parameters) {
            const methodName = data.swapV2Parameters.methodNames.join(',');
            const ethValue = data.swapV2Parameters.value;
            const args = data.swapV2Parameters.args;

            const {AGGREGATOR_ROUTER} = await getRouterAddress();
            const contract = new Contract(
                AGGREGATOR_ROUTER,
                DMM_ABI,
                address && provider ? provider.getSigner(address) : provider
            )
            const signer = provider?.getSigner()
            if (address && args && signer && ethValue>0) {
                
                
                try{
                    await contract[methodName](...args, ethValue === '0' ? { from: address } : { value: ethValue, from: address })
                } 
                catch(err) {
                    console.log(err);
                    notifications.showNotification({
                        color: 'red',
                        title: 'Error.',
                        message: err.data? err.data.message : err.message,
                    })
                } 

                await stats();
            }
        }



    }

    const setSwapparametersPay = (value) => {
        setPayValue(value);

        if (value && value > 0) setBuyValue(Number(value) * destPriceCoeff);
        else { setBuyValue(0); setSwapEnabled(false); return; }

        setSwapEnabled(true); return;
    }
    const ApproveDest = async () => {

        try {
            await DESTCONTRACT.approve(AGGREGATOR_ROUTER, '100000000000000000000000');
        } catch (err) {
            notifications.showNotification({
                color: 'red',
                title: 'Error.',
                message: err.message,
            })
            return;
        }
        setAllowanceOut(true);

    }

    const ApproveSrc = async () => {

        try {
            await SRCCONTRACT.approve(AGGREGATOR_ROUTER, '1000000000000000000000');
        } catch (err) {
            console.log(err.message)
            notifications.showNotification({
                color: 'red',
                title: 'Error.',
                message: err.message,
            })
            return;
        }
        setAllowanceIn(true);

    }

    const isSRCApproved = async () => {
        const allowance = await SRCCONTRACT.allowance(address, AGGREGATOR_ROUTER);
        if (allowance.lte(0)) {
            return false;
        }
        return true;
    }

    const isDESTApproved = async () => {
        const allowance = await DESTCONTRACT.allowance(address, AGGREGATOR_ROUTER);
        console.log(allowance);
        if (allowance.lte(0)) {
            return false;
        }
        return true;
    }



    const stats = async () => {

       
        if (address) {
            setLoading(true);
            const swapParameters = await getSwaps(amount);
            const amountOutUsd = new BigNumber(swapParameters.data.amountOutUsd);
            const outputAmount = new BigNumber(swapParameters.data.outputAmount);
            const priceInUsd = amountOutUsd.multipliedBy(amount).dividedBy(outputAmount);
            const coeff = amountOutUsd.dividedBy(priceInUsd);  // USD per TOKEN 
            setDestPriceCoeff(coeff);
            setDestPrice(priceInUsd.toFixed(4));
            console.log(priceInUsd.toFixed(4));
            const usersrcBalance = await provider.getBalance(address)
            setUsersrcBalance(Number(ethers.utils.formatEther(usersrcBalance)).toFixed(4));
            const rBalance = await tokenBalance(provider, address, TOKEN.address)
            setDestBalance(Number(ethers.utils.formatEther(rBalance)).toFixed(4));
            const inAllowance = await isSRCApproved();
            setAllowanceIn(inAllowance);
            const outAllowance = await isDESTApproved();
            setAllowanceOut(outAllowance);
            setLoading(false);
        } 

    }

    useEffect(() => {
        if (address) {

            stats();
        }

    }, [address]);

    return (
        <Box>
            <Card
                shadow="lg"
                radius="md"
                style={{ marginTop: 10, backgroundColor: "#303250" }}
            >
                <Group position="center" style={{ marginBottom: 5 }}>
                    <Title order={5} align={"center"} style={{ color: '#969bd5' }}>
                        Swap {PEG.name} for {TOKEN.name}
                    </Title>
                </Group>

                <Box display="flex">
                    <Group position="apart">
                        <Text style={{ color: '#969bd5', fontSize: "10" }}>
                            Slippage Tolerance:{" "}</Text>

                        <Text style={{ color: '#969bd5', fontSize: "10" }}>
                            {MINSLIPPAGE / 50}%</Text>

                    </Group>
                </Box>
                <LoadingOverlay visible={loading}  style={{zIndex:+10}}/>
                <Grid columns={16} style={{ marginTop: 20 }}>
                    <Grid.Col span={16}>
                        <Group position="apart">
                            <Text style={{ color: '#969bd5', fontSize: "10" }}>
                                From</Text>

                            <Text style={{ color: '#969bd5', fontSize: "10" }}>
                                Balance:  {usersrcBalance && usersrcBalance}</Text>

                        </Group>
                        <Input
                            placeholder="0.0"
                            variant="filled"
                            size="lg"
                            styles={{ input: { width: "100%", boxSizing: "border-box" } }}
                            style={{ marginBottom: 15 }}
                            value={payValue}
                            onChange={(event) =>
                                setSwapparametersPay(event.currentTarget.value)
                            }

                            rightSectionWidth={120}
                            rightSection={
                                <Group position="right">

                                    <Image
                                        style={{ height: 32, width: 32 }}
                                        src={srcLogo}
                                        alt="Token image" />

                                    <Title order={5} style={{ color: '#969bd5' }}>
                                    {PEG.name} </Title>

                                </Group>
                            }

                        />
                    </Grid.Col>
                </Grid>
                <Grid columns={16}>
                    <Grid.Col span={16}>
                        <Group position="apart">
                            <Text style={{ color: '#969bd5', fontSize: "10" }}>
                                To</Text>

                            <Text style={{ color: '#969bd5', fontSize: "10" }}>
                                Balance: {destBalance && destBalance}</Text>

                        </Group>
                        <Input
                            placeholder="0.0"
                            variant="filled"
                            size="lg"
                            styles={{ input: { width: "100%", boxSizing: "border-box" } }}
                            style={{ marginBottom: 15 }}
                            value={buyValue}
                            rightSectionWidth={120}
                            disabled
                            rightSection={
                                <Group position="right">
                                    <Image
                                        style={{ height: 32, width: 32 }}
                                        src={destLogo}
                                        alt="Token image"
                                    />
                                    <Title order={5} style={{ color: '#969bd5' }}>
                                    {TOKEN.name} 
                                    </Title>

                                </Group>
                            }

                        />
                    </Grid.Col>

                </Grid>


                <Group position="apart" style={{ marginTop: 20 }}>
                    <Text style={{ color: '#969bd5' }}>
                        Price</Text>

                    <Text style={{ color: '#969bd5' }}>
                        ${destPrice && destPrice} / {TOKEN.name} </Text>

                </Group>
                {usersrcBalance && usersrcBalance > 0 &&
                    <Group position="apart">
                        {!allowanceIn ? (
                            <Button
                                variant="gradient"
                                gradient={{ from: "indigo", to: "violet" }}
                                style={{ marginTop: 20, width: "47%" }}
                                size="xs"
                                radius="md"
                                onClick={() => {
                                    ApproveSrc();
                                }}
                            >
                                Approve {PEG.name}
                            </Button>

                        ) : (
                            <Button variant="gradient"
                                gradient={{ from: "indigo", to: "violet" }}
                                style={{ marginTop: 20, width: "47%", color: "gray" }}
                                size="xs"
                                radius="md" disabled> Approve {PEG.name}</Button>
                        )}
                        {!allowanceOut ? (
                            <Button
                                variant="gradient"
                                gradient={{ from: "indigo", to: "violet" }}
                                style={{ marginTop: 20, width: "47%" }}
                                size="xs"
                                radius="md"
                                onClick={() => {
                                    ApproveDest();
                                }}
                            >
                                Approve Token
                            </Button>

                        ) : (
                            <Button
                                variant="gradient"
                                gradient={{ from: "indigo", to: "violet" }}
                                style={{ marginTop: 20, width: "47%", color: !swapEnabled ? 'gray' : 'white' }}
                                size="xs"
                                disabled={!swapEnabled}
                                radius="md"
                                onClick={() => {
                                    swapToken(payValue);
                                }}
                            >
                                Swap
                            </Button>
                        )}


                    </Group>
                }

                {usersrcBalance === 0 &&
                    <Group position="center" style={{ marginTop: 20 }}>
                        <Badge size="lg" variant="gradient" gradient={{ from: 'orange', to: 'red' }}>Insufficient {PEG.name} Balance</Badge>
                    </Group>
                }

            </Card>
        </Box>
    );







}