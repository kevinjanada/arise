# Arise
Arise network is a payment bridge converting crypto to fiat and vice-versa.
Arise connects crypto holders to fiat-only merchants.
Arise allows fiat holding users to buy crypto.

Arise also has a Proof of Authority Blockchain, that has 0 fees when transferring Arise Tokens between wallets.
The PoA Blockchain is controlled by Arise, but in the future may become decentralized.

# Arise Token
Arise Token is a Stable Coin backed by USDC.

## How it Works
Arise Token lives in Arise Chain.
Arise Token is minted when USDC is added to the collateral pool on a public Blockchain.
When users cash out their Arise Token, the tokens are burnt, and an equal amount of USDC is sent to the user on the opposite chain.


# High Level TODO:
- [ ] Bridge In USDC -> Arise
  - [ ] Create a vault contract holding the USDC collateral.
  - [ ] When a user deposits USDC into the vault it tells the bridge that a deposit has occured.
  - [ ] The Bridge, upon receiving the info that deposit has occured, relay the message to Arise Chain.
  - [ ] Someone (an authority) mints Arise Tokens equal to the deposit amount to the depositor address.  

# Implementation TODO:
- [ ] Create a Vault contract
  - [ ] `public mintArise(amount uint256, cosmosReceiver string)` // for users wanting to mint Arise Tokens
  - [ ] `public deposit(amount) onlyOwner` // for authority to increase collateral
- [ ] Have a bridge to listen for deposits
  - [ ] Run local EVM (Later this will be Polygon)
  - [ ] Deploy wormhole contract
  - [ ] Run a wormhole Guardian
  - [ ] Register new Token (TestUSDC) to Token Bridge Contract -> https://book.wormhole.com/technical/evm/tokenLayer.html#registering-new-tokens
    > Later on we may not need to do this. USDC is probably already registered to wormhole 
  - [ ] Do basic transfer -> https://book.wormhole.com/technical/evm/tokenLayer.html#basic-transfer
- [ ] Mint Arise token on Arise Chain
  - [ ] Read VAA message from Wormhole Guardian.
  - [ ] Mint Arise token equivalent as per the message.



## Notes
### User Address
When a user deposits USDC to the vault, he provides the cosmos address to receive Arise Token to.
From the user perspective, A user has an Ethereum Wallet and a separate Cosmos Wallet.

Based on quick research, you can convert cosmos public key to ethereum public key.
But to convert eth public key to cosmos public key, not sure how, but maybe can be done.
But the consensus is that it should not be done.

### ChainID and NetworkID
There is Wormhole Chain ID, and there is Network ID (sometimes also called chain id)
e.g Ethereum's
  - Wormhole Chain ID == 2 // Stored on Wormhole's contract
  - Network chain id == 1 // How it is in EVM world

### Local Wormhole Validator
https://github.com/wormhole-foundation/xdapp-book/tree/main/projects/wormhole-local-validator
