import { ethers } from "hardhat";
import "dotenv/config";
import { WHITELIST_CONTRACT_ADDRESS, METADATA_URL } from "../constants/index";

// Deployed "CryptoDevs" at 0x4f7b14149ee30d80e685125353a73D15C02263ac

async function main() {
    // Address of the whitelist contract that you deployed in the previous module
    // ** Wouldn't it be better to name it "whitelistContractAddress" or smth?
    const whitelistContract = WHITELIST_CONTRACT_ADDRESS;
    // URL from where we can extract the metadata for a Crypto Dev NFT
    const metadataURL = METADATA_URL;
    /*
  A ContractFactory in ethers.js is an abstraction used to deploy new smart contracts,
  so cryptoDevsContract here is a factory for instances of our CryptoDevs contract.
  */
    const cryptoDevsContract = await ethers.getContractFactory("CryptoDevs");

    // deploy the contract
    // "metadataURL" & "whitelistContract" are constructor args
    const deployedCryptoDevsContract = await cryptoDevsContract.deploy(metadataURL, whitelistContract);

    // ** Shouldn't we wait for the contract to be deployed (aka "await deployedCryptoDevsContract.deployed();")

    // print the address of the deployed contract
    console.log("Deployed CryptoDevs contract at:", deployedCryptoDevsContract.address);
}

// Call the main function and catch if there is any error
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
