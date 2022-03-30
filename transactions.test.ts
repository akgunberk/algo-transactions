import algosdk from "algosdk";

import StakingContractJSON from "./governance-api-staking.json";
import VotingContractJSON from "./governance-api-voting.json";

import { GovernorClient } from "./transactions";

describe("algorand governance on chain transactions", () => {
  const token = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const server = "http://localhost";
  const port = 4001;

  const client = new algosdk.Algodv2(token, server, port);
  const stakingAppID = StakingContractJSON.networks.default.appID;
  const votingAppID = VotingContractJSON.networks.default.appID;

  const governor = algosdk.mnemonicToSecretKey(
    "furnace veteran cook bleak gap sell ridge uncover title approve vendor source used when ketchup hold loud cook parrot pig stable much quit abstract turn"
  );

  it("signup", async () => {
    const tsnx = await GovernorClient.signUp({
      client,
      governor,
      contract: new algosdk.ABIContract({
        name: StakingContractJSON.name,
        desc: StakingContractJSON.desc,
        networks: StakingContractJSON.networks,
        methods: StakingContractJSON.methods,
      }),
      stakingAppID,
      votingAppID,
      beneficiary: governor.addr,
      stakingAmount: 3000,
    });
    expect(tsnx.length).toBeGreaterThan(0);
  });

  it("vote", async () => {
    const sessionVote = [
      [10000000, 20000000, 0, 0], // voting for measure #1
      [0, 0, 0, 0], // non-existant measure
      [0, 0, 0, 0], // non-existant measure
      [0, 0, 0, 0], // non-existant measure
    ];
    const tsnx = await GovernorClient.vote({
      client,
      governor,
      contract: new algosdk.ABIContract({
        name: StakingContractJSON.name,
        desc: StakingContractJSON.desc,
        networks: StakingContractJSON.networks,
        methods: StakingContractJSON.methods,
      }),
      stakingAppID,
      votingAppID,
      beneficiary: governor.addr,
      sessionVote,
    });
    expect(tsnx.length).toBeGreaterThan(0);
  });
  it("claim", async () => {
    const tsnx = await GovernorClient.claim({
      client,
      governor,
      contract: new algosdk.ABIContract({
        name: StakingContractJSON.name,
        desc: StakingContractJSON.desc,
        networks: StakingContractJSON.networks,
        methods: StakingContractJSON.methods,
      }),
      stakingAppID,
      votingAppID,
      beneficiary: governor.addr,
    });
    expect(tsnx.length).toBeGreaterThan(0);
  });
  it("withdraw", async () => {
    const tsnx = await GovernorClient.withdraw({
      client,
      governor,
      contract: new algosdk.ABIContract({
        name: StakingContractJSON.name,
        desc: StakingContractJSON.desc,
        networks: StakingContractJSON.networks,
        methods: StakingContractJSON.methods,
      }),
      stakingAppID,
      votingAppID,
    });
    expect(tsnx.length).toBeGreaterThan(0);
  });
});
