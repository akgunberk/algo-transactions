import algosdk from "algosdk";

import type { Account, Transaction, ABIContract, ABIArgument, TransactionWithSigner, SuggestedParams } from "algosdk";

export interface BasicGovernorTxn {
  client: algosdk.Algodv2;
  governor: Account;
  stakingAppID: number;
  votingAppID: number;
  contract: ABIContract;
  beneficiary: ABIArgument;
}

export interface VoteTxn extends BasicGovernorTxn {
  sessionVote: number[][];
}

export interface SignUpTxn extends BasicGovernorTxn {
  stakingAmount: number;
}

export type WithdrawTxn = Omit<BasicGovernorTxn, "beneficiary">;

async function signUp({
  client,
  governor,
  stakingAppID,
  stakingAmount,
  votingAppID,
  contract,
  beneficiary,
}: SignUpTxn): Promise<TransactionWithSigner[]> {
  const signer = algosdk.makeBasicAccountTransactionSigner(governor);
  const stakingAppAddress = algosdk.getApplicationAddress(stakingAppID);

  const stakingComposer = new algosdk.AtomicTransactionComposer();
  const method = contract.methods.find((method) => method.name === "Governor_commitStake")!;
  const suggestedParams = await client.getTransactionParams().do();

  const txns: Transaction[] = [
    algosdk.makeApplicationOptInTxnFromObject({
      from: governor.addr,
      appIndex: stakingAppID,
      suggestedParams,
    }),
    algosdk.makeApplicationOptInTxnFromObject({
      from: governor.addr,
      appIndex: votingAppID,
      suggestedParams,
    }),
    algosdk.makePaymentTxnWithSuggestedParamsFromObject({
      from: governor.addr,
      to: stakingAppAddress,
      amount: stakingAmount,
      suggestedParams,
    }),
  ];

  for (const txn of txns) {
    stakingComposer.addTransaction({ txn, signer });
  }

  stakingComposer.addMethodCall({
    appID: stakingAppID,
    sender: governor.addr,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    method,
    methodArgs: [beneficiary],
    signer,
  });

  return stakingComposer.buildGroup();
}

async function vote({
  client,
  governor,
  stakingAppID,
  votingAppID,
  contract,
  sessionVote,
}: VoteTxn): Promise<TransactionWithSigner[]> {
  const signer = algosdk.makeBasicAccountTransactionSigner(governor);

  const votingComposer = new algosdk.AtomicTransactionComposer();
  const method = contract.methods.find((method) => method.name === "Governor_vote")!;
  const suggestedParams = await client.getTransactionParams().do();

  votingComposer.addMethodCall({
    appID: stakingAppID,
    sender: governor.addr,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    method,
    methodArgs: [sessionVote, votingAppID],
    signer,
  });

  return votingComposer.buildGroup();
}

async function claim({
  client,
  governor,
  stakingAppID,
  votingAppID,
  contract,
  beneficiary,
}: BasicGovernorTxn): Promise<TransactionWithSigner[]> {
  const signer = algosdk.makeBasicAccountTransactionSigner(governor);

  const stakingComposer = new algosdk.AtomicTransactionComposer();
  const method = contract.methods.find((method) => method.name === "Governor_claimRewards")!;
  const suggestedParams = await client.getTransactionParams().do();

  stakingComposer.addMethodCall({
    appID: stakingAppID,
    sender: governor.addr,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    method,
    methodArgs: [beneficiary, votingAppID],
    signer,
  });

  const txn = algosdk.makeApplicationClearStateTxnFromObject({
    appIndex: votingAppID,
    from: governor.addr,
    suggestedParams,
  });

  stakingComposer.addTransaction({ txn, signer });

  return stakingComposer.buildGroup();
}

async function withdraw({
  client,
  governor,
  stakingAppID,
  votingAppID,
  contract,
}: WithdrawTxn): Promise<TransactionWithSigner[]> {
  const signer = algosdk.makeBasicAccountTransactionSigner(governor);

  const stakingComposer = new algosdk.AtomicTransactionComposer();
  const method = contract.methods.find((method) => method.name === "Governor_withdraw")!;
  const suggestedParams = await client.getTransactionParams().do();

  stakingComposer.addMethodCall({
    appID: stakingAppID,
    sender: governor.addr,
    suggestedParams,
    onComplete: algosdk.OnApplicationComplete.NoOpOC,
    method,
    methodArgs: [votingAppID],
    signer,
  });

  const txn = algosdk.makeApplicationClearStateTxnFromObject({
    appIndex: votingAppID,
    from: governor.addr,
    suggestedParams,
  });

  stakingComposer.addTransaction({ txn, signer });

  return stakingComposer.buildGroup();
}

export const GovernorClient = {
  signUp,
  vote,
  claim,
  withdraw,
};
