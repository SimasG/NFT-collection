{
"presets": [
[
"next/babel",
{
"preset-react": {
"runtime": "automatic",
"importSource": "@emotion/react"
}
}
]
],
"plugins": ["xwind/babel", "@emotion/babel-plugin"]
}

# Things that don't work well:

1. MetaMask problems (WIP)
   I'm having a couple of issues with MetaMask:

-   If I log out of MetaMask, I don't get the wallet login popups, even if I click on "Connect your Wallet" button. Instead, I get a console error: "Error: User Rejected". The only way to log into the wallet is by manually clicking on the MetaMask extension to open the popup. I guess it makes sense since `web3ModalRef.current.connect()` probably only works for users already logged into their browser wallets. Is there a way to cause the MetaMask wallet popup to appear on the initial render & when clicking "Connect your Wallet" button? -> Example: https://testnets.opensea.io/

-   If I'm logged in with MetaMask (not connected to the dapp though) & I cancel the initial MetaMask popup, it keeps popping up every 5 seconds because of `presaleEndedInterval's` `checkIfPresaleStarted()`. Is there a way to adjust the UI logic to have the MetaMask popup appear automatically only on the initial render & then only if the user clicks on the "connect wallet" button?

"it wont popup if youre not logged into metamask and thats not something you can control on the frontend side of things unfortunately.

as for making it pop up when the website first loads, you can call the connect function within a useEffect that has an empty dependency array (i.e. runs only on first render)

you can wrap the checkIfPresaleStarted function to only be run if a provider/signer is set already. the way we do it in sophomore isnt ideal, but you can perhaps set a state variable from within getProviderOrSigner to be true/false depending on if a user successfully connected wallet or not
to look into better wallet connection practices i think the Celo Track right now has the best functionality
the sophomore things work but you run into issues like you mentioned"

2. No auto re-rendering after walletConnected state changes or I change an account within the wallet.
   The changes are displayed in UI only after a manual refresh. Should be a fix somewhere in the useEffect.

3. It seems like we started minting from the second image onwards (`1.svg` at `https://testnets.opensea.io/assets/goerli/0x64B7F93643ae76E95D50534dC564e0A7759f49fF/1`). Where did the first one go?
   A: I think it's probably the way LearnWeb3 set it up: `const image_url = "https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/"`

4. Why can't I access the image url directly (`https://raw.githubusercontent.com/LearnWeb3DAO/NFT-Collection/main/my-app/public/cryptodevs/`) -> `400: Invalid request`? Getting a million errors in the console.
