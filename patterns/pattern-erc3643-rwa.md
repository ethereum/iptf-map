---
title: "Pattern: ERC-3643 Tokenized RWAs"
status: ready
maturity: production
layer: L1
privacy_goal: Enforce compliant token transfers with identity verification at contract level
assumptions: ONCHAINID infrastructure, trusted claim issuers, ERC-734/735 key management
last_reviewed: 2026-01-14
works-best-when:
  - Regulatory compliance is mandatory
  - Need permissioned transfers with identity verification
  - Tokenizing real-world assets (bonds, equity, funds)
avoid-when:
  - Full ERC-20 interoperability is needed (unrestricted transfers)
  - High-frequency trading with minimal compliance checks
dependencies: [ERC-3643, ONCHAINID, ERC-734, ERC-735]
---

## Intent

Enable compliant tokenization of real-world assets with built-in identity management, transfer restrictions, and regulatory compliance enforced at the smart contract level.

## Ingredients

- **ERC-3643**: Core permissioned token standard with compliance framework
  - **ONCHAINID**: Decentralized identity management system for KYC/AML verification
  - **T-REX Protocol**: Complete suite of smart contracts for tokenized securities
  - **ERC-734/735**: Key and claim management for identity verification
  - **Compliance Modules**: Pluggable rules engine for transfer restrictions
  - **Identity Registry**: On-chain registry of verified participants

## Protocol (concise)

1. **Identity Setup**: Participants create ONCHAINID with verified claims (KYC, accreditation, jurisdiction)
2. **Token Deployment**: Issue ERC-3643 token with specific compliance rules and transfer restrictions
3. **Registry Population**: Add eligible participants to identity registry with required credentials
4. **Transfer Initiation**: Token holder initiates transfer to eligible recipient
5. **Compliance Check**: Smart contract validates both sender and receiver against transfer rules
6. **Execution**: Transfer executes only if all compliance conditions are met; reverts if failed
7. **Audit Trail**: All transfers and compliance checks logged on-chain for regulatory reporting

## Guarantees

- **Identity Verification**: All token holders verified through ONCHAINID system
- **Regulatory Compliance**: Transfer rules enforce KYC/AML, investor accreditation, jurisdiction restrictions
- **Selective Permissions**: Granular control over who can hold, transfer, and receive tokens
- **Audit Transparency**: Complete on-chain history of ownership and compliance status
- **Interface Compatibility**: Uses ERC-20 interface but with additional transfer restrictions

## Trade-offs

- **Complexity**: More complex than simple ERC-20 tokens, requires identity infrastructure
- **Gas Costs**: Additional compliance checks increase transaction costs
- **Permissioned Nature**: Not suitable for permissionless DeFi applications
- **Regulatory Dependency**: Compliance rules must be maintained and updated
- **Privacy Limitation**: Identity verification may conflict with transaction privacy needs
- **Limited support for Stock Split events**: Stock split events mint new tokens, which is infeasible for larger amounts of token holders. Reverse stock splits introduce uncertainties around burning/transferring tokens which are not modelled. [ERC-8056](https://eips.ethereum.org/EIPS/eip-8056) proposes an extension to ERC-20 tokens that enables issuers to apply an updatable multiplier to the UI, efficiently handling stock splits and reverse stock splits.

## Example

"Corporation issues €100M tokenized bond series with ERC-3643 compliance":
• Corporation deploys ERC-3643 bond token with investor accreditation requirements
• Qualified institutional investors complete KYC process and receive ONCHAINID credentials
• Bond tokens distributed to verified investors' addresses in identity registry
• Secondary trading restricted to other qualified investors meeting compliance rules
• All transfers automatically enforce regulatory requirements without manual oversight

## See also

- [Private Bonds Approach](../approaches/approach-private-bonds.md)
- [Crypto Registry Bridge eWpG EAS](pattern-crypto-registry-bridge-ewpg-eas.md)
- [Regulatory Disclosure Keys Proofs](pattern-regulatory-disclosure-keys-proofs.md)
- [ZK KYC ML ID ERC734-735](pattern-zk-kyc-ml-id-erc734-735.md)
- [ERC-3643 Documentation](https://docs.erc3643.org/erc-3643)
