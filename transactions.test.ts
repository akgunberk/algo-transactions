import algosdk from "algosdk";
import fs from "node:fs";

import StakingContractJSON from "./governance-api-staking.json";
import VotingContractJSON from "./governance-api-voting.json";

import { GovernorClient } from "./transactions";

const mnemonic =
  "dismiss duck goddess course jeans brick bounce hub mushroom side proof crime feed try decade sand any empower about curve celery cube photo abandon collect";

describe("algorand governance on chain transactions", () => {
  const token =
    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  const server = "http://localhost";
  const port = 4001;

  const client = new algosdk.Algodv2(token, server, port);
  const stakingAppID = StakingContractJSON.networks.default.appID;
  const votingAppID = VotingContractJSON.networks.default.appID;

  const contract = new algosdk.ABIContract({
    name: StakingContractJSON.name,
    desc: StakingContractJSON.desc,
    networks: StakingContractJSON.networks,
    methods: StakingContractJSON.methods,
  });

  const governor = algosdk.mnemonicToSecretKey(mnemonic);

  it("signup", async () => {
    const txns = await GovernorClient.signUp({
      client,
      governor,
      contract,
      stakingAppID,
      votingAppID,
      beneficiary: governor.addr,
      stakingAmount: 3000,
    });

    fs.writeFileSync(
      "./signs.json",
      JSON.stringify(txns.map((txn) => txn.txn))
    );

    expect(txns.length).toBeGreaterThan(0);
  });

  it("vote", async () => {
    const sessionVote = [
      [10000000, 20000000, 0, 0], // voting for measure #1
      [0, 0, 0, 0], // non-existant measure
      [0, 0, 0, 0], // non-existant measure
      [0, 0, 0, 0], // non-existant measure
    ];
    const txns = await GovernorClient.vote({
      client,
      governor,
      contract,
      stakingAppID,
      votingAppID,
      beneficiary: governor.addr,
      sessionVote,
    });

    fs.writeFileSync(
      "./votes.json",
      JSON.stringify(txns.map((txn) => txn.txn))
    );

    expect(txns.length).toBeGreaterThan(0);
  });

  it("claim", async () => {
    const txns = await GovernorClient.claim({
      client,
      governor,
      contract,
      stakingAppID,
      votingAppID,
      beneficiary: governor.addr,
    });

    fs.writeFileSync(
      "./claims.json",
      JSON.stringify(txns.map((txn) => txn.txn))
    );

    expect(txns.length).toBeGreaterThan(0);
  });

  it("withdraw", async () => {
    const txns = await GovernorClient.withdraw({
      client,
      governor,
      contract,
      stakingAppID,
      votingAppID,
    });

    fs.writeFileSync(
      "./withdraws.json",
      JSON.stringify(txns.map((txn) => txn.txn))
    );

    expect(txns.length).toBeGreaterThan(0);
  });
});
