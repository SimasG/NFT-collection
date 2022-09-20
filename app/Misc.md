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

1. No auto re-rendering after walletConnected state changes or I change an account within the wallet.
   The changes are displayed in UI only after a manual refresh. Should be a fix somewhere in the useEffect.
2. Logging out of MetaMask
   If I log out of MetaMask, I see the following problems:

- I get "MetaMask - RPC Error: Request of type 'wallet_requestPermissions' already pending for origin http://localhost:3000." every 5 seconds
- If I click on "Connect your Wallet", I don't get a MetaMask login popup. Instead, I get an error: "Error: User Rejected". The only way to log into the wallet is by manually going to the MetaMask extension and opening the popup.
