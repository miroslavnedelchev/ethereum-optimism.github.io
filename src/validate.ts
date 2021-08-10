import dotenv from "dotenv";
import * as core from "@actions/core";
import { providers, Contract } from "ethers";
import tokenList from "../optimism.tokenlist.json";
import validationInterface from "./validationInterface.json";

dotenv.config();

const infuraKey = process.env.INFURA_KEY || core.getInput("INFURA_KEY");

const chainIdMap = {
  1: `https://mainnet.infura.io/v3/${infuraKey}`,
  10: `https://mainnet.optimism.io`,
  42: `https://kovan.infura.io/v3/${infuraKey}`,
  69: `https://kovan.optimism.io`
};

const networkMap = {
  1: "Mainnet",
  10: "Optimistic Ethereum",
  42: "Kovan",
  69: "Optimistic Kovan"
};

async function main() {
  const tokenListsByChainId = Object.keys(chainIdMap).map(chainId =>
    tokenList.tokens.filter(tokenData => tokenData.chainId === Number(chainId))
  );

  for (const tokenList of tokenListsByChainId) {
    const chainId = tokenList[0]?.chainId;
    const networkURL = chainIdMap[chainId];
    const provider = new providers.JsonRpcProvider(networkURL);

    for (const token of tokenList) {
      const contract = new Contract(
        token.address,
        JSON.stringify(validationInterface),
        provider
      );

      const symbol = await contract.symbol();
      const decimals = await contract.decimals();

      if (symbol !== token.symbol) {
        throw Error(
          `Contract symbol mismatch. ${symbol} !== ${token.symbol} \nAddress: ${token.address}`
        );
      }
      if (decimals !== token.decimals) {
        throw Error(
          `Contract decimals mismatch. ${decimals} !== ${token.decimals} \nAddress: ${token.address}`
        );
      }
      console.log(
        `${symbol} validated on ${networkMap[chainId]} - Address: ${token.address}`
      );
    }
  }
}

const isBridgeValid = (symbol: string, chainId: number) => {
  let isValid = false;
  // todo: figure out how to do validate these
  if (symbol === "SNX" || symbol === "DAI") {
    isValid = true;
  } else {
    new Contract(token.address, JSON.stringify(validationInterface), provider);
    try {
      const l1TokenBridgeAddress = await contracts.l2.bridge.l1TokenBridge();
      const l2TokenBridgeAddress = await contracts.l1.bridge.l2TokenBridge();
      console.log(l1TokenBridgeAddress, l2TokenBridgeAddress);
      if (
        l2TokenBridgeAddress !== contracts.l2.bridge.address ||
        l1TokenBridgeAddress !== contracts.l1.bridge.address
      ) {
      } else {
        isValid = true;
      }
    } catch (err) {
      console.error(err);
      Sentry.captureException(err, { tags: { handler: "handleDeposit" } });
    }
  }
  return isValid;
};

main()
  .then(() => {
    console.log("\nToken list validated!\n");
  })
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
