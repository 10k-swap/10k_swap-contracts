import { starknet } from "hardhat";
import { ensureEnvVar } from "./util";

describe("OZ account init", function () {
  it("Deploy OZ account", async function () {
    const account = await starknet.deployAccount("OpenZeppelin", {
      privateKey: ensureEnvVar("OZ_ACCOUNT_PRIVATE_KEY"),
    });
    console.warn("account::: ", account.address);
    console.warn("account.privateKey::: ", account.privateKey);
  });
});
