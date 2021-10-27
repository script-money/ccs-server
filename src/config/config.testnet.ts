import * as fcl from '@onflow/fcl';
import dotenv from 'dotenv';
dotenv.config();

export const taskConfig = {
  redis: 'redis://127.0.0.1:6379',
  prefix: 'midway-task',
  defaultJobOptions: {
    repeat: {
      tz: 'Asia/Shanghai',
    },
  },
};

export const redis = {
  client: {
    port: 6379, // Redis port
    host: '127.0.0.1', // Redis host
    password: '',
    db: 1,
  },
};

fcl
  .config()
  .put('accessNode.api', 'https://access-testnet.onflow.org')
  .put('discovery.wallet', 'https://fcl-discovery.onflow.org/testnet/authn');

export const fungibleToken = '0x9a0766d93b6608b7';
export const activityContract = process.env.TESTNET_MINTER_ADDRESS;
export const ballotContract = process.env.TESTNET_MINTER_ADDRESS;
export const ccsToken = process.env.TESTNET_MINTER_ADDRESS;
export const memorials = process.env.TESTNET_MINTER_ADDRESS;
export const nonFungibleToken = '0x631e88ae7f1d7c20';

export const shortQueryBlock = 20; // fit every 20 seconds
export const midRangeQueryBlock = 60; // fit greater than 1 minute
export const maxRangeQueryBlock = 250;
export const closeActivityIntervalMinutes = 3;
export const startHeight = 49360871; // check at https://testnet.flowscan.org/

export const minterFlowAddress = process.env.TESTNET_MINTER_ADDRESS;
export const minterKeys = [
  {
    publicKey: process.env.TESTNET_PUBLICKEY_0,
    privateKey: process.env.TESTNET_PRIVATEKEY_0,
    keyId: process.env.TESTNET_KEYINDEX_0,
    weight: 1000,
  },
  {
    publicKey: process.env.TESTNET_PUBLICKEY_1,
    privateKey: process.env.TESTNET_PRIVATEKEY_1,
    keyId: process.env.TESTNET_KEYINDEX_1,
    weight: 1000,
  },
  {
    publicKey: process.env.TESTNET_PUBLICKEY_2,
    privateKey: process.env.TESTNET_PRIVATEKEY_2,
    keyId: process.env.TESTNET_KEYINDEX_2,
    weight: 1000,
  },
];

export const facuetAmount = 1000;
