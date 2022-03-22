import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Text,
  useMantineTheme,
  Title,
  Group,
  Button,
  Modal,
  Image,
  LoadingOverlay,
  Input,
  Paper,
  ActionIcon,
  Grid,
} from "@mantine/core";
import { useAppSelector } from "../hooks";
import { useSelector, useDispatch } from "react-redux";

import { Settings } from "tabler-icons-react";
import { useAddress } from "../hooks/web3Context";
import { abi as ierc20Abi } from "../abi/IERC20.json";
import { ethers } from "ethers";
import {
  userAllowance,
  tokenBalance,
  poolStatistics,
} from "../functions/Getstatistics";
import { ArrowDownCircle } from "tabler-icons-react";
import { changeApproval, stakeToken,unstakeToken } from "../functions/AppStakerInterface";
import { isPendingTxn, txnButtonText } from "../reducers/PendingTxnsSlice";
import { useNotifications } from "@mantine/notifications";
import staking from "../abi/staking.json";

export default function Stake(props) {
  const address = useAddress();
  const dispatch = useDispatch();
  const notifications = useNotifications();

  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(false);

  const [poolId, setPoolId] = useState(1);

  const [appId, setAppId] = useState();
  const [stakingAPY, setStakingAPY] = useState();
  const [stakingTvl, setStakingTvl] = useState(1);
  const [stakingTokenName, setStakingTokenName] = useState('');
  const [stakingTokenAddress, setStakingTokenAddress] = useState('');
  const [stakingTokenLogo, setStakingTokenLogo] = useState('');
  const [poolContractName, setPoolContractName] = useState('');
  const [poolContractAddress, setPoolContractAddress] = useState('');
  const [poolContractLogo, setPoolContractLogo] = useState('');
  const [tokenBuyurl, setTokenBuyurl] = useState('');
  const [poolName, setPoolName] = useState('');
  const [userTokenBalance, setUserTokenBalance] = useState('');
  const [allowance, setAllowance] = useState('');
  const [approved, setApproved] = useState(false);

  const [depositvalue, setDepositvalue] = useState("");

  const [userStakeBalance, setUserStakeBalance] = useState('');

  const [userClaimableBalance, setUserClaimableBalance] = useState('');



  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const pendingTransactions = useSelector((state) => {
    return state.pendingTransactions;
  });

  const chainid = useAppSelector((state) => {
    return state.app && state.app.chainid;
  });

  const stakingInfo = useAppSelector((state) => {
    return state.app && state.app.stakingInfo;
  });

  const onSeekApproval = async (token, pool) => {
    await dispatch(
      changeApproval({ token, pool, provider, address, notifications })
    );
  };

  const onStakeToken = async (token, amount, pool) => {
    await dispatch(
      stakeToken({ token, amount, pool, provider, address, notifications })
    );
  };

  const onUnStakeToken = async (token, amount, pool) => {
      const claimFlag=false;
    await dispatch(
        unstakeToken({ token, amount, pool, provider, address, notifications,claimFlag })
    );
  };

  const onClaimToken = async (token, amount, pool) => {      
      const claimFlag=false;

    await dispatch(
        unstakeToken({ token, amount, pool, provider, address, notifications ,claimFlag })
    );
  };

  const swaptokenList = async (poolId) => {
    const poolInfo = stakingInfo[poolId - 1];

    setLoading(true);

    console.log(poolInfo.appId);
    console.log(poolInfo.poolId);
    console.log(poolInfo.stakingAPY);
    console.log(poolInfo.stakingTvl);
    console.log(poolInfo.stakingTokenName);
    console.log(poolInfo.stakingTokenAddress);
    console.log(poolInfo.stakingTokenLogo);
    console.log(poolInfo.poolContractName);
    console.log(poolInfo.poolContractAddress);
    console.log(poolInfo.poolContractLogo);
    console.log(poolInfo.tokenBuyurl);
    console.log(poolInfo.poolName);

    const tokenContract = new ethers.Contract(
      poolInfo.stakingTokenAddress,
      ierc20Abi,
      provider
    );


    const poolContract = new ethers.Contract(
        poolInfo.poolContractAddress,
        staking,
        provider
      );

    const userBalance = await tokenBalance(
      provider,
      address,
      poolInfo.stakingTokenAddress
    );
    const allowance = await userAllowance(
      provider,
      address,
      poolInfo.stakingTokenAddress,
      poolInfo.poolContractAddress
    );

    const { dailyAPR, yearlyAPR, TVL } = await poolStatistics(
      provider,
      address,
      poolInfo.stakingTokenAddress,
      poolInfo.stakingTokenName,
      poolInfo.poolContractName,
      poolInfo.poolContractAddress
    );


    const [a, b] = await poolContract.userInfo(0, address);

    const earned = ethers.utils.formatEther(await poolContract.pendingShare(0, address));

    const staked = ethers.utils.formatEther(a); 


    setUserStakeBalance(staked);
    setUserClaimableBalance(Math.round(earned,4));



    setUserTokenBalance(ethers.utils.formatEther(userBalance));
    setAllowance(ethers.utils.formatEther(allowance));

    setAppId(poolInfo.appId);
    setStakingAPY(yearlyAPR);
    setStakingTvl(TVL);
    setStakingTokenName(poolInfo.stakingTokenName);
    setStakingTokenAddress(poolInfo.stakingTokenAddress);
    setStakingTokenLogo(poolInfo.stakingTokenLogo);
    setPoolContractName(poolInfo.poolContractName);
    setPoolContractAddress(poolInfo.poolContractAddress);
    setPoolContractLogo(poolInfo.poolContractLogo);
    setTokenBuyurl(poolInfo.tokenBuyurl);
    setPoolName(poolInfo.poolName);

    if (allowance.gt(0)) setApproved(true);

    // set Loading ON
    // set Labels.
    // fetch balances from Contracts.
    // set Loading Off

    setLoading(false);
  };

  useEffect(() => {
    if (stakingInfo && stakingInfo.length > 0) swaptokenList(poolId);
  }, []);

  return (
    <Box>
      <Card
        shadow="lg"
        radius="md"
        style={{ marginTop: 10, backgroundColor: "#303250" }}
      >
        <Group position="apart" style={{ marginBottom: 5 }}>
          <Title order={5} align={"center"}>
            Select pool
          </Title>
          <ActionIcon
            color="violet"
            size="lg"
            radius="xs"
            variant="filled"
            onClick={() => setOpened(true)}
          >
            <Settings size={16} />
          </ActionIcon>
        </Group>
      </Card>
      <div style={{ position: "relative" }}>
        <LoadingOverlay visible={loading}  style={{zIndex:+10}}/>

        <Card shadow="lg" style={{ marginTop: 10, backgroundColor: "#282942" }}>
          <Group position="left" style={{ marginBottom: 5 }}>
            <Image
              style={{ height: 40, width: 40 }}
              src={stakingTokenLogo}
              alt="Token image"
            />
            <Title order={4} align={"center"} >
              Stake {stakingTokenName}
            </Title>
          </Group>
          <Group position="apart" style={{ marginBottom: 15 }}>
            <Title order={6} align={"left"} >
              APR :{" "}
              <span style={{ color: theme.colors.blue[3] }}>
                {" "}
                {stakingAPY} %{" "}
              </span>
            </Title>
            <Title order={6} align={"left"} >
              TVL : <span style={{ color: "orange" }}> {stakingTvl} </span>
            </Title>
          </Group>

          <Paper
            shadow="xl"
            radius="md"
            p="xs"
            withBorder
            style={{ marginTop: 10, backgroundColor: "#303250", border: 0 }}
          >
            <Title order={6} style={{ marginBottom: 10}}>
              Balance : {userTokenBalance} {stakingTokenName}
            </Title>

            <Grid columns={24}>
              <Grid.Col span={16}>
                <Input
                  placeholder="0.0"
                  variant="filled"
                  styles={{ input: { width: "100%", boxSizing: "border-box" } }}
                  style={{ marginBottom: 15 }}
                  value={depositvalue}
                  rightSectionWidth={70}
                  onChange={(event) =>
                    setDepositvalue(event.currentTarget.value)
                  }
                  rightSection={
                    <Button
                      variant="default"
                      gradient={{ from: "indigo", to: "violet" }}
                      size="xs"
                      compact
                      radius="xs"
                      onClick={() => setDepositvalue(userTokenBalance)}
                    >
                      MAX
                    </Button>
                  }
                />
              </Grid.Col>
              <Grid.Col span={8}>
                {!approved && (
                  <Button
                    variant="gradient"
                    gradient={{ from: "orange", to: "red" }}
                    size="xs"
                    radius="xs"
                    fullWidth
                    loading={isPendingTxn(
                      pendingTransactions,
                      "approve_deposit"
                    )}
                    onClick={() => {
                      onSeekApproval(stakingTokenAddress, poolContractAddress);
                    }}
                  >
                    {txnButtonText(
                      pendingTransactions,
                      "approve_deposit",
                      "Approve"
                    )}
                  </Button>
                )}
                {approved && (
                  <Button
                    variant="gradient"
                    gradient={{ from: "indigo", to: "violet" }}
                    size="xs"
                    radius="xs"
                    fullWidth
                    onClick={() => {
                      onStakeToken(
                        stakingTokenAddress,
                        depositvalue,
                        poolContractAddress
                      );
                    }}
                  >
                    {" "}
                    Stake
                  </Button>
                )}{" "}
              </Grid.Col>
            </Grid>
          </Paper>

          <Paper
            shadow="xl"
            radius="md"
            p="xs"
            withBorder
            style={{ marginTop: 10, backgroundColor: "#303250", border: 0 }}
          >
            <Title order={6} style={{ marginBottom: 10 }}>
              Deposited : {userStakeBalance} {stakingTokenName}
            </Title>
            <Grid columns={24}>
              <Grid.Col span={16}>
                <Input
                  placeholder="0.0"
                  variant="filled"
                  style={{ marginBottom: 15 }}
                  value={userStakeBalance}
                  rightSectionWidth={70}
                  onChange={(event) =>
                    setUserStakeBalance(event.currentTarget.value)
                  }
                  rightSection={
                    <Button
                      variant="default"
                      gradient={{ from: "indigo", to: "violet" }}
                      size="xs"
                      compact
                      onClick={() => setUserStakeBalance(userStakeBalance)}
                    >
                      MAX
                    </Button>
                  }
                />{" "}
              </Grid.Col>
              <Grid.Col span={8}>
                <Button
                  variant="gradient"
                  gradient={{ from: "indigo", to: "violet" }}
                  size="xs"
                  radius="xs"
                  fullWidth
                  
                  onClick={() => {
                    onUnStakeToken(
                      stakingTokenAddress,
                      userStakeBalance,
                      poolContractAddress
                    );
                  }}
                >
                  Unstake
                </Button>
              </Grid.Col>
            </Grid>
          </Paper>
          <Group position="center">
            <ArrowDownCircle
              size={60}
              strokeWidth={1}
              color={theme.colors.indigo[5]}
            />
          </Group>
          <Paper
            shadow="xl"
            radius="md"
            p="xs"
            withBorder
            style={{ marginTop: 10, backgroundColor: "#303250", border: 0 }}
          >
            <Group position="left" style={{ marginBottom: 5 }}>
              <Image
                style={{ height: 40, width: 40 }}
                src={poolContractLogo}
                alt="Token image"
              />
              <Title
                order={6}
                align={"center"}
                style={{ marginBottom: 10}}
              >
                Claimable: {userClaimableBalance} {poolContractName}
              </Title>
            </Group>
            <Group position="center">
              <Button
                variant="gradient"
                gradient={{ from: "indigo", to: "violet" }}
                size="xs"
                radius="xs"
                
                  
                onClick={() => {
                    onClaimToken(
                      stakingTokenAddress,
                      userClaimableBalance,
                      poolContractAddress
                    );
                  }}
              >
                Claim Rewards
              </Button>
            </Group>
          </Paper>
        </Card>
      </div>

      <Modal
        opened={opened}
        centered
        onClose={() => setOpened(false)}
        title="Select Pool to Stake"
        style={{
          background: "#282942",
          fontSize: 16,
          fontWeight: "bold",
          color: "white",
        }}
      >
        {stakingInfo &&
          stakingInfo.map((pool) => (
            <Card
              shadow="lg"
              radius="lg"
              key={pool.poolId}
              style={{ marginTop: 10, backgroundColor: "#0f2247" }}
              onClick={() => {
                setPoolId(pool.poolId);
                setOpened(false);
                swaptokenList(pool.poolId);
              }}
            >
              <Group position="apart" style={{ marginBottom: 5 }}>
                <Image
                  style={{ height: 40, width: 40 }}
                  src={pool.poolContractLogo}
                  alt="Token image"
                />
                <Text weight={500}>{pool.poolContractName}</Text>
              </Group>
            </Card>
          ))}
      </Modal>
    </Box>
  );
}
