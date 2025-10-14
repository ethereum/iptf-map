---
title: Technical slicing of Institutional Privacy
status: draft WIP
---

# Investor Onboarding

This is the compliant onchain ID problem.

A bank needs to whitelist an investor's EOA on Ethereum network, such a whitelisting can be done:
- manually through the offchain component of the bank, where the investor can do traditional KYC/AML and indicate the EOA for the bank to add to a list of whitelisted EOA via sending a transaction to a smart contract, this can be pretty trivial technological-wise and there is no privacy leakage beyond the fact that the onchain ID is for the specified Bank that whitelist the EOA;
- automatically through an onchain smart contract, where the investor can send an EOA along with a proof of KYC/AML compliance, and upon successful verification, the EOA will be added to the whitelist, such a proof needs to be privacy-preserving, i.e. the proof is unlinkable to the wrapped ID, aka a zkID presentation to the smart contract.

To preserve the anonymity of the EOA, we can leverage Stealth Address, i.e. instead of whitelisting the EOA, we can whitelist the Stealth Address, this allows the sender to derive a receiver address from this Stealth Address.

As such, the smart contract needs to maintain a PKI of Stealth Address - per - investor.

## Non-transferability of the proof of KYC/AML

A potential attack vector is for an identity thief to onboard a Stealth Address using the proof of KYC/AML of an eligible investor. Thus, it is important that, the proof of KYC/AML is non-transferrable, potentially via binding the proof (the presentation) to the investor's real world ID, and perhaps including additional 2nd factor authentication mechanism.


## Patterns
- Stealth Address for receiver privacy (this also implies sender privacy)
- ERC standards for ONCHAIN ID extended to Stealth ONCHAIN ID
- Automation of Stealth Address (Stealth ONCHAIN ID) creation via proof verification in smart contract
- zkKYC/AML for proof generation
- MPC-KYC/AML for proof generation
- zkTLS if no api for data exportation

# Asset Issuance

While investor privacy is quite straightforward, how to onboard the Bank and register its onchain ID and let it issue onchain assets are a little bit more tricky and much more dependent of the regulatory framework (same for [Regulator Onboarding and Administration](#Regulator-Onboarding-and-Administration)):
- PKI for Banks, can be done similarly to ENS
- Per Bank, a PKI of its onchain assets (also ENS for its onchain assets but under Bank?)
- To issue an onchain asset, it can:
    - create an ERC directly;
    - create an ERC with a proof of KYC/AML compliant from its Regulator;
    > An asset is at least per Regulator, Bank and maybe even granular (regional, country);

Nevertheless, asset issuance may need to adhere to asset anonymity and amount privacy, i.e. the asset type is unlinkable among issuances, and the amount per issuance is private. This can be done as a private Deposit from the Bank, however, for asset anonymity, all assets need to be of the same ERC.

## Patterns
- ENS for Regulator, Bank
- Compliant Onchain Asset (ERC 3643)
- Automation of onchain asset creation via proof verification in smart contract
- zkKYC/AML for proof generation
- MPC-KYC/AML for proof generation
- zkTLS if no api for data exportation
- modified shielded/privacy pool for anonymous asset creation

# Transactional Privacy

Transactional Privacy is the most standard part of the whole institutional privacy stack as this has been very similar for DeFi privacy via privacy/shielded pool: every transaction needs to hide the sender, the receiver and also the amount. Besides, per transfer, not only a proof of solvency is needed but also a proof of KYC/AML compliance needs to be generated.

It is important to note that, besides the assets issued by the Bank, there may be also DeFi tokens and stablecoins deposited into the investor/Bank's Stealth Address. Such DeFi tokens and stablecoins are necessary to come from some KYC/AML compliant privacy/shielded pools if we want to hide the origin of the deposits. Such KYC/AML compliant pool is an independent problem from this section.

## Order Discovery and Matching vs MEV
As institutions going onchain, the orders/intents discovery and matching become vulnerable to onchain MEV unless such processes are done via traditional offchain component of the Bank, however, this will significantly limit the available liquidity. MEV prevention mechanisms such as encrypted mempools or direct builder submission must be deployed to alleviate the situation. Such mempools or builders network can be the universal or, for better controlled environment, specific to the Bank or a set of Banks.

## Patterns
- zkKYC/AML for proof generation
- MPC-KYC/AML for proof generation
- zkTLS if no api for data exportation
- shielded/privacy pool for private transactions
- encrypted mempool
- direct builder submission

# Regulator Onboarding and Administration

Regulators need to be recognized via a PKI (can be done with ENS), and given special access controls, i.e.
- selectively open private transactions to see trade details, this can be done via viewing key mechanism
- pause or freeze an asset or an investor account, both can be implemented with a rule in the smart contract to grant access to the asset and the investor account;

As the regulators are granted such great power, its keys must be managed carefully with key management techniques:
- distributed key generation
- distributed decryption
- distributed signing
- key rotation and proactive refresh (especially in the case of compromise)

## Patterns
- special admin access for regulator in onchain asset smart contract
- viewing key for seletive disclosure
- distributed key generation for distributed regulator + threshold decryption (for viewing) + threshold signing (for intervention)
- key rotation
- proactive refresh of private key
- (?) key recovery via master proof such as proof of holding the private key of the regulator private key (the ENS address), this is basically a signature

# Private Data Oracles

Data oracles are used to bridge offchain and onchain systems. Public oracles such as chainlink has been in the DeFi scene for a long time, it provides public data feed such as market price of some DeFi token for managing position solvency.

Private Data Oracles are necessary for institutional privacy for a couple of reasons:
- Provide offchain data for onchain processing in a privacy preserving manner, such as the Merkle Tree root of the tradfi database to use to verify onchain proof
- Provide a way for the Bank's tradfi system to perform operations such as KYC/AML and feed result to onchain system

## Patterns
- confidential oracle

# L1 vs L2
Institutions considering going onchain needs to bridge the privacy gap between a traditional system, or a consortium/permissioned blockchain (of strict access control). The paths can be various: going to L1 directly, going through an L2 platform, or deploy a (shared among institutions?) L2 platform; each with pros and cons.

Important criteria wise:
- decentralization, settlement finality, and censorship resistance are the best quality of L1, but the transaction cost is high and throughput is low (low frequency friendly applications only), and feasible tech is only zk-SNARK + Stealth Address, which limits the deployable instrument types (think of mixer-like applications). The transparant mempool of L1 is also susceptible to MEV. Liquidity is abundant on L1.
- a common L2 such as Optimism or zkEVM offer higher throughput, much lower cost, but with the risk of censorship resistance, and only soft finality (until the L2 state is updated to L1). Feasible tech here is more abundant: FHE, zk-SNARKs and also MPC are usable, especially through optimistic rollup such as Optimism. As such, the deployable instruments type is richer. Yet, L2 suffers from governance issue and needs a liquidity bridge. If additional data availability is a requirement, L2's throughput will be limited due to gas cost. The transparant mempool of common L2 is also susceptible to MEV.
- institutions can deploy its own L2 to rollup its own tradtional system or consortium blockchain to L1, but the development and infrastructure cost can be a problem.

## Patterns
- Fraudproof
- zkEVM
- Full data availability
- cross L1 <> L2 bridge
- cross L2s bridge (leveraging L1)
- cross L2s bridge (relay oracle)

# Misc.
- Non-transferability via public statement
- KYC/AML compliant privacy/shielded pool
- Insurance
- Standards for ERC + protocols
- L2 or not L2, bridges and governnance
- Maturity of crypto libs