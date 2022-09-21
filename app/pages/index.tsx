import type { NextPage } from "next";
import { Contract, ethers, providers, utils } from "ethers";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Web3Modal from "web3modal";
import { abi, NFT_CONTRACT_ADDRESS } from "../constants/index";
import { walletconnect } from "web3modal/dist/providers/connectors";

const Home: NextPage = () => {
    // walletConnected keep track of whether the user's wallet is connected or not
    const [walletConnected, setWalletConnected] = useState(false);
    // presaleStarted keeps track of whether the presale has started or not
    const [presaleStarted, setPresaleStarted] = useState(false);
    // presaleEnded keeps track of whether the presale ended
    const [presaleEnded, setPresaleEnded] = useState(false);
    // loading is set to true when we are waiting for a transaction to get mined
    const [loading, setLoading] = useState(false);
    // checks if the currently connected MetaMask wallet is the owner of the contract
    const [isOwner, setIsOwner] = useState(false);
    // tokenIdsMinted keeps track of the number of tokenIds that have been minted
    const [tokenIdsMinted, setTokenIdsMinted] = useState("0");
    const [saleEnded, setSaleEnded] = useState(false);
    const maxTokenIds = 20;
    // Create a reference to the Web3 Modal (used for connecting to Metamask) which persists as long as the page is open
    const web3ModalRef = useRef();

    /**
     * presaleMint: Mint an NFT during the presale
     */
    const presaleMint = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            // ** Where do the update methods come together?
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

            // call the presaleMint from the contract, only whitelisted addresses would be able to mint
            const tx = await nftContract.presaleMint({
                // value signifies the cost of one crypto dev which is "0.01" eth.
                // We are parsing `0.01` string to ether using the utils library from ethers.js
                value: utils.parseEther("0.01"),
            });
            setLoading(true);
            await tx.wait();
            setLoading(false);
            window.alert("You successfully minted a Crypto Dev!");
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * publicMint: Mint an NFT after the presale
     */
    const publicMint = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            // ** Where do the update methods come together?
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

            // call the presaleMint from the contract, only whitelisted addresses would be able to mint
            const tx = await nftContract.mint({
                // value signifies the cost of one crypto dev which is "0.01" eth.
                // We are parsing `0.01` string to ether using the utils library from ethers.js
                value: utils.parseEther("0.01"),
            });
            setLoading(true);
            await tx.wait();
            setLoading(false);
            window.alert("You successfully minted a Crypto Dev!");
        } catch (error) {
            console.error(error);
        }
    };

    /*
      connectWallet: Connects the MetaMask wallet
    */
    const connectWallet = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // When used for the first time, it prompts the user to connect their wallet
            await getProviderOrSigner();
            setWalletConnected(true);
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * startPresale: starts the presale for the NFT Collection
     */
    const startPresale = async () => {
        try {
            // We need a Signer here since this is a 'write' transaction.
            const signer = await getProviderOrSigner(true);
            // Create a new instance of the Contract with a Signer, which allows
            // update methods
            // ** Where do the update methods come together?
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, signer);

            const tx = await nftContract.startPresale();
            setLoading(true);
            await tx.wait();
            setLoading(false);
            // set the presale started to true
            await checkIfPresaleStarted(); // ** Interesting func. I guess we'll set "presaleStarted" to true there?
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * checkIfPresaleStarted: checks if the presale has started by quering the `presaleStarted`
     * variable in the contract
     */
    const checkIfPresaleStarted = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            // call the presaleStarted from the contract
            const _presaleStarted = await nftContract.presaleStarted();
            if (!_presaleStarted) {
                await getOwner(); // ** Why?
            }
            setPresaleStarted(_presaleStarted);
            return _presaleStarted;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    /**
     * checkIfPresaleEnded: checks if the presale has ended by quering the `presaleEnded`
     * variable in the contract
     */
    const checkIfPresaleEnded = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            // call the presaleEnded from the contract
            const _presaleEnded = await nftContract.presaleEnded(); // returns `0` if the presale hasn't even started
            console.log("_presaleEnded:", _presaleEnded.toString());
            if (_presaleEnded.toString() === "0") return false;
            // _presaleEnded is a Big Number, so we are using the lt(less than function) instead of `<`
            // Date.now()/1000 returns the current time in seconds
            // We compare if the _presaleEnded timestamp is less than the current time
            // which means presale has ended (ethers syntax)
            const hasEnded = _presaleEnded.lt(Math.floor(Date.now() / 1000));
            if (hasEnded) {
                setPresaleEnded(true);
            } else {
                setPresaleEnded(false);
            }
            return hasEnded;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    /**
     * getOwner: calls the contract to retrieve the owner
     */
    const getOwner = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            // call the owner function from the contract
            const _owner = await nftContract.owner(); // "owner()" func is from imported "Ownable" contract
            // We will get the signer now to extract the address of the currently connected MetaMask account
            const signer = await getProviderOrSigner(true);
            // Get the address associated to the signer which is connected to MetaMask
            // @ts-ignore
            const address = await signer.getAddress(); // "getAddress()" is an ethers method
            // It seems that (at least some) addresses in injected wallets have uppercase letters (why tho?)
            if (address.toLowerCase() === _owner.toLowerCase()) {
                setIsOwner(true);
            }
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * getTokenIdsMinted: gets the number of tokenIds that have been minted
     */
    const getTokenIdsMinted = async () => {
        try {
            // Get the provider from web3Modal, which in our case is MetaMask
            // No need for the Signer here, as we are only reading state from the blockchain
            const provider = await getProviderOrSigner();
            // We connect to the Contract using a Provider, so we will only
            // have read-only access to the Contract
            const nftContract = new Contract(NFT_CONTRACT_ADDRESS, abi, provider);
            const _tokenIds = await nftContract.tokenIds();
            setTokenIdsMinted(_tokenIds.toString());
        } catch (error) {
            console.error(error);
        }
    };

    /**
     * Returns a Provider or Signer object representing the Ethereum RPC with or without the
     * signing capabilities of metamask attached
     *
     * A `Provider` is needed to interact with the blockchain - reading transactions, reading balances, reading state, etc.
     *
     * A `Signer` is a special type of Provider used in case a `write` transaction needs to be made to the blockchain, which involves the connected account
     * needing to make a digital signature to authorize the transaction being sent. Metamask exposes a Signer API to allow your website to
     * request signatures from the user using Signer functions.
     *
     * @param {*} needSigner - True if you need the signer, default false otherwise
     */
    const getProviderOrSigner = async (needSigner = false) => {
        // Connect to Metamask
        // Since we store `web3Modal` as a reference, we need to access the `current` value to get access to the underlying object
        // @ts-ignore
        const provider = await web3ModalRef.current.connect();
        const web3Provider = new providers.Web3Provider(provider);

        // If user is not connected to the Goerli network, let them know and throw an error
        const { chainId } = await web3Provider.getNetwork();
        if (chainId !== 5) {
            window.alert("Change the network to Goerli");
            throw new Error("Change network to Goerli");
        }

        if (needSigner) {
            const signer = web3Provider.getSigner();

            return signer;
        }
        return web3Provider;
    };

    useEffect(() => {
        // if wallet is not connected, create a new instance of Web3Modal and connect the MetaMask wallet
        // Since on first render "walletConnected" will always be "false", this code block will always run at least once
        if (!walletConnected) {
            // Assign the Web3Modal class to the reference object by setting its `current` value
            // The `current` value is persisted throughout as long as this page is open
            // @ts-ignore
            web3ModalRef.current = new Web3Modal({
                network: "goerli",
                providerOptions: {},
                disableInjectedProvider: false,
            });
            connectWallet();

            // This block is meant for rendering the correct btn immediately, instead of waiting for 5s
            // Check if presale has started and ended

            // `checkIfPresaleStarted` also checks if current user is owner (for correct btn re-rendering)
            const _presaleStarted = checkIfPresaleStarted();
            // const _presaleEnded = checkIfPresaleEnded();

            const randomFunc = async () => {
                const _presaleStarted = await checkIfPresaleStarted();
                const _presaleEnded = await checkIfPresaleEnded();
                console.log("_presaleStarted:", _presaleStarted, "_presaleEnded:", _presaleEnded);
            };
            randomFunc();
            // ** Why no "await" here?
            getTokenIdsMinted();

            console.log("tokenIdsMinted:", tokenIdsMinted);
            // Set an interval which gets called every 5 seconds to check presale has started & ended
            const presaleEndedInterval = setInterval(async function () {
                // ** `checkIfPresaleStarted` is causing MetaMask to pop up every 5s if it's not connect to dapp
                // ** Unable to resolve easily
                const _presaleStarted = await checkIfPresaleStarted();
                if (_presaleStarted) {
                    const _presaleEnded = await checkIfPresaleEnded();
                    if (_presaleEnded) {
                        clearInterval(presaleEndedInterval);
                    }
                }
            }, 5 * 1000);

            // set an interval to get the number of token Ids minted every 5 seconds
            setInterval(async function () {
                await getTokenIdsMinted();
            }, 5 * 1000);
        }
    }, [walletConnected]);

    useEffect(() => {
        if (parseInt(tokenIdsMinted) >= maxTokenIds) setSaleEnded(true);
    }, [saleEnded]);

    /*
      renderButton: Returns a button based on the state of the dapp
    */
    const renderButton = () => {
        // If wallet is not connected, return a button which allows them to connect their wllet
        if (!walletConnected) {
            return (
                <button onClick={connectWallet} className="button">
                    Connect your wallet
                </button>
            );
        }

        // If we are currently waiting for something, return a loading button
        if (loading) {
            return <button className="button">Loading...</button>;
        }

        // If connected user is the owner, and presale hasn't started yet, allow them to start the presale
        if (isOwner && !presaleStarted) {
            return (
                <button className="button" onClick={startPresale}>
                    Start Presale!
                </button>
            );
        }

        // If connected user is not the owner but presale hasn't started yet, tell them that
        if (!presaleStarted) {
            return (
                <div>
                    <div className="description">Presale hasn't started!</div>
                </div>
            );
        }

        // If presale started, but hasn't ended yet, allow for minting during the presale period
        if (presaleStarted && !presaleEnded) {
            return (
                <div>
                    <div className="description">Presale has started!!! If your address is whitelisted, Mint a Crypto Dev 🥳</div>
                    <button className="button" onClick={presaleMint}>
                        Presale Mint 🚀
                    </button>
                </div>
            );
        }

        // If presale started and has ended, its time for public minting
        if (presaleStarted && presaleEnded && !saleEnded) {
            return (
                <button className="button" onClick={publicMint}>
                    Public Mint 🚀
                </button>
            );
        }

        if (presaleStarted && presaleEnded && saleEnded) {
            return <button className="button bg-red-500">Sold out 🙏🔥</button>;
        }
    };

    return (
        <div>
            <Head>
                <title>Crypto Devs</title>
                <meta name="description" content="Whitelist-Dapp" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <div className="main">
                <div>
                    <h1 className="title">Welcome to Crypto Devs!</h1>
                    <div className="description">It's an NFT collection for developers in Crypto.</div>
                    <div className="description">{tokenIdsMinted}/20 have been minted</div>
                    {renderButton()}
                </div>
                <div>
                    <img className="image" src="./cryptodevs/0.svg" />
                </div>
            </div>
            <footer className="footer">Made with &#10084; by Crypto Devs</footer>
        </div>
    );
};

export default Home;
