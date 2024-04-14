# $RESI-TOKENOMICS

[![GitHub tag](https://img.shields.io/github/tag/Comunidad-Resiliente/Resi-token-v1?include_prereleases=&sort=semver&color=blue)](https://github.com/Comunidad-Resiliente/Resi-token-v1/releases/)
[![License](https://img.shields.io/badge/License-MIT-blue)](#license)
[![issues - Resi-token-v1](https://img.shields.io/github/issues/Comunidad-Resiliente/Resi-token-v1)](https://github.com/Comunidad-Resiliente/Resi-token-v1/issues)

#### Stack

- yarn
- Node js v18
- Typescript
- Hardhat

#### Commands

- Install:

```bash
yarn
```

- Compile contracts:

```bash
yarn compile
```

- Deploy locally:

```bash
yarn deploy
```

- Deploy to live network: For this step you would need to provide your MNEMONIC inside .envrc file

```bash
export MNEMONIC='YOUR MNEMONIC'

direnv allow .envrc
```

And then run:

```bash
yarn deploy:network <network>
```

- Run Test:

```bash
yarn test
```

- Run coverage:

```bash
yarn coverage
```

- Generate abis:

```bash
yarn abis
```

- Know the size of your contracts:

```bash
yarn size
```

- Verify contracts: due to they are all upgradeable contracts, we just need to provide the address of the deployed contract and the network. Also, do not forget to provide the api key of your network to your hardhat.config.ts. For instance, to verify on Polygon Mumbai testnet:

```js
etherscan: {
    apiKey: {
      polygonMumbai: process.env.MUMBAI_ETHERSCAN_API_KEY ? process.env.MUMBAI_ETHERSCAN_API_KEY : ''
    }
  },
```

```bash
npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS>
```

---

### Tasks

1. Set serie vault: set serie vault address.

```bash
npx hardhat set-serie-vault --vault <VAULT_ADDRESS> --serie <SERIE_ID> --network <NETWORK>
```

2. Enable exits

```bash
npx hardhat enable-exits --network <NETWORK>
```

3. Disable exits

```bash
npx hardhat disable-exits --network <NETWORK>
```

4. Add builder

```bash
npx hardhat add-builder --builder <BUILDER_ADDRESS> --network <NETWORK>
```

5. Remove builder

```bash
npx hardhat remove-builder --builder <BUILDER_ADDRESS> --network <NETWORK>
```

6. Award builder

```bash
npx hardhat award --builder <BUILDER_ADDRESS> --amount <AMOUNT_TO_AWARD> --serie-id <SERIE_ID> --network <NETWORK>
```

7. Get contract version

```bash
npx hardhat get-version --network <NETWORK>
```

8. Get serie supply

```bash
npx hardhat serie-supply --serie-id <SERIE_ID> --network <NETWORK>
```

9. Get user serie balance

```bash
npx hardhat user-serie-balance --serie-id <SERIE_ID> --user <USER_ADDRESS>
```

10. Update serie vault status

```bash
npx hardhat update-serie-vault-status --serie <SERIE_ID> --status <STATUS> --network <NETWORK>
```

11. Create vault

```bash
npx hardhat create-vault --stable-token  <TOKEN_ADDRESS> --serie <SERIE_ID> --network <NETWORK>
```

### Authors

- Alejo Lovallo

  - [Github](https://github.com/AlejoLovallo)
  - [Medium](https://alejolovallo.medium.com/)

### Contribution

Thank you for considering helping out with the source code! We welcome contributions from anyone on the internet, and are grateful for even the smallest of fixes!

If you'd like to contribute to resi-tokenomics, please fork, fix, commit and send a pull request for the maintainers to review and merge into the main code base.
