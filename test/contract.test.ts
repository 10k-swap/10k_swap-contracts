import { expect } from "chai";
import { starknet } from "hardhat";
import { TIMEOUT } from "./constants";
import { StarknetContractFactory } from "hardhat/types/runtime";
import { getPredeployedOZAccount } from "./util";
import { OpenZeppelinAccount } from "@shardlabs/starknet-hardhat-plugin/dist/src/account";
import { StarknetContract } from "@shardlabs/starknet-hardhat-plugin/dist/src/types";

describe("StarknetContract tests", function () {
    this.timeout(TIMEOUT);
    let contractFactory: StarknetContractFactory;
    let account: OpenZeppelinAccount;
    let contract: StarknetContract;
    const initial_balance = 25n;

    before(async function () {
        account = await getPredeployedOZAccount();
        contractFactory = await starknet.getContractFactory("contract");
        console.warn("ddd:", new Date());
        
        await account.declare(contractFactory);
        contract = await account.deploy(contractFactory, { initial_balance });
    });
    it("should have address", async () => {
        // const { address } = account;
        // expect(typeof address).to.be.eq("string");
        // expect(address.indexOf("0x")).to.be.eq(0);
    });
});
