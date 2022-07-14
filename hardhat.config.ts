import { HardhatUserConfig } from "hardhat/types";
import "@shardlabs/starknet-hardhat-plugin";
import "@nomiclabs/hardhat-ethers";
require("dotenv").config();

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
const config: HardhatUserConfig = {
  solidity: "0.6.12",
  starknet: {
    dockerizedVersion: "0.9.0", // alternatively choose one of the two venv options below
    // uses (my-venv) defined by `python -m venv path/to/my-venv`
    // venv: "path/to/my-venv",

    // uses the currently active Python environment (hopefully with available Starknet commands!)
    // venv: "active",
    // network: "alpha",
    network: "devnet",
    wallets: {
      OpenZeppelin: {
        accountName: "OpenZeppelin",
        modulePath:
          "starkware.starknet.wallets.open_zeppelin.OpenZeppelinAccount",
        accountPath: "~/.starknet_accounts",
      },
    },
  },
  mocha: {
    timeout: 6000000,
  },
  networks: {
    devnet: {
      url: "http://127.0.0.1:5050",
      args: ["--lite-mode", "--gas-price", "2000000000"],
    },
    integratedDevnet: {
      url: "http://127.0.0.1:5050",
      // venv: "active",
      // dockerizedVersion: "<DEVNET_VERSION>",
      args: ["--lite-mode", "--gas-price", "2000000000"],
    },
    hardhat: {},
  },
};

export default config;
