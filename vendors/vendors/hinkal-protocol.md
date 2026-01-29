### **Overview**

Hinkal is a privacy-focused infrastructure layer on Ethereum that enables users and institutions to interact with public blockchains **without exposing sensitive financial activity by default**. Hinkal consists of two complementary products: a **non-custodial wallet** and an **SDK**, both built to deliver protocol-level privacy for balances, transfers, and transaction relationships while preserving public-chain settlement and finality.

Hinkal is positioned as **privacy-preserving infrastructure on top of Ethereum and EVM-compatible chains**—not as an L1 or L2. Privacy is introduced at the execution layer and can be accessed either directly through the wallet or programmatically via the SDK.

---

## **Institutional Privacy Problem Addressed**

Public blockchain accounts expose complete transaction histories and balances by default. For institutions and organizations operating on-chain, this transparency can create material risks, including:

- Exposure of treasury balances and operational flows
- Third-party tracking and behavioral analysis
- Unwanted visibility into counterparties, payment relationships, and internal financial activity

Hinkal addresses these risks by enabling **protocol-level privacy**, allowing assets to be held, moved, and settled on public blockchains without making all activity publicly observable through standard block explorers.

This privacy model is available both through the **Hinkal Wallet** for direct usage and through the **Hinkal SDK**, which allows applications, PSPs, and institutional systems to embed the same privacy guarantees into existing workflows—without replacing wallets, custody providers, or compliance processes.

### Core Capabilities

Hinkal provides the following wallet and SDK capabilities:

- **Confidential Transfers**
    
    Hinkal enables asset transfers where transaction metadata is not publicly exposed. Sender and/or recipient attribution, amounts, and transaction linkage are shielded on-chain. The SDK allows the same confidential transfer logic to be triggered programmatically by applications, payment systems, or backend services.
    
- **Private Asset Holding**
    
    Assets can be held in a private state rather than fully exposed public wallets. The SDK exposes private balance management without requiring integrators to design or operate custom privacy infrastructure.
    
- **Public ↔ Private Execution.** Users and systems can move assets seamlessly between public and private contexts, enabling selective privacy depending on operational needs.
- **IP data obfuscation.** Via opt-in embedded TOR functionality.
- **Non-Custodial Architecture**
    
    Hinkal does not custody funds or control private keys. Asset ownership and transaction authorization remain fully with the user or institution.
    
- **Privacy Guarantees**
    - Origin and/or destination addresses are not publicly visible
    - Balances are shielded and indistinguishable within the pool
    - Token amounts and identifiers are encrypted on-chain
    - Network-level metadata is protected via IP obfuscation (TOR)
- **Wallet-Agnostic Integration**
    
    Hinkal operates as a privacy layer that can be embedded into existing wallet infrastructure. Enterprises, institutions, PSPs, and applications can integrate Hinkal without replacing their current wallets, custody providers, or operational workflows.
    

### User Experience and Wallet Operation

Hinkal maintains a **first-party wallet** that serves as:

- A **reference implementation** of the Hinkal execution model
- A **distribution surface** for individual users and power users
- A **live demonstration** of private execution, settlement, and UX flows

The wallet is built on top of the same **Hinkal SDK and shielded pool infrastructure** used by partners and institutions. It does not introduce proprietary capabilities or privileged access.

Importantly, the Hinkal wallet is **not required** to use the protocol.

All privacy functionality is exposed via the SDK and can be integrated into:

- Existing wallets
- MPC / custody providers
- Treasury and settlement systems
- **Supported Blockchains:** Ethereum, Arbitrum, Optimism, Polygon, Base, Arc Testnet
- Internal financial tooling

The wallet exists to **prove the model, accelerate adoption, and de-risk integrations**—not to compete with ecosystem wallets or custody providers.

### Compliance and Institutional Considerations

**Hinkal** is designed to provide on-chain privacy **without compromising compliance or auditability**. The protocol incorporates multiple safeguards to prevent illicit usage and shielded-pool contamination.

### **1. Preventing Illicit Activity and Pool Tainting**

- **KYT at the smart-contract level**
    
    Addresses with high-risk KYT scores are blocked from interacting with the Hinkal shielded pool at the protocol level. Hinkal uses Chainalysis for KYT. 
    
- **Post-deposit enforcement**
    
    If an address becomes illicit *after* depositing into Hinkal, it is restricted from making private transactions. The only permitted action is a withdrawal back to the original deposit address, which occurs publicly and results in loss of privacy.
    
- **Isolated compliance sets**
    
    As a result, illicit users are never commingled with compliant users inside the shielded pool, preventing contamination of the privacy set and preserving the integrity of legitimate transactions.
    

### **2. Additional Controls for the Hinkal Wallet**

For the Hinkal first-party wallet, an additional safeguard is applied for large deposits:

- **zkTLS verification for high-value deposits**
    
    For deposits above $10,000, users are required to prove ownership of a centralized exchange (CEX) account using zkTLS.
    
    This verification is performed **in full privacy**:
    
    - No user data is revealed to Hinkal
    - No credentials or personal information are stored
    - No data is recorded on-chain or off-chain by the protocol

This mechanism provides an additional risk control layer without introducing custodial or data-retention obligations.

### **3. Selective Disclosure and Auditability**

- **Viewing keys**
    
    Each user controls a viewing key that can be shared with counterparties, auditors, or regulators to disclose transaction history when required.
    
- **Partial disclosure**
    
    Hinkal supports granular, partial reveals, allowing users to disclose specific transactions or relationships without exposing their full on-chain history.
    

### **4. Non-Custodial Architecture**

- Hinkal operates as a **non-custodial protocol**.
- Users retain full control over their assets and private keys at all times.
- Transactions ultimately settle on public blockchains, preserving finality and verifiability.

This model aligns with institutional custody, accounting, and risk frameworks that require user-controlled assets rather than pooled custody.

### **5. SDK and Institutional Integration**

- The Hinkal SDK is designed to support institutional compliance requirements while minimizing unnecessary public exposure.
- Privacy is applied at the execution and settlement layer, while internal systems (PSP dashboards, treasury records, accounting systems) remain the system of record.

### Target Use Cases

### **1. Institutional Treasury Operations on Public Chains**

**Who:** Corporates, fintechs, crypto-native companies, foundations

**Problem:**

- Treasury balances and movements are publicly visible
- Counterparties infer cash position, run-rate, or financial stress
- Increased security and governance risk
    
    **Hinkal enables:**
    
- Private treasury balances on Ethereum
- Confidential internal transfers and rebalancing
- Public-chain execution without public exposure

---

### **2. B2B Crypto Payments & Settlement**

**Who:** Enterprises paying suppliers, partners, subsidiaries in crypto

**Problem:**

- Payment amounts, recipients, and cadence are visible on-chain
- Business relationships and pricing can be reverse-engineered
    
    **Hinkal enables:**
    
- Confidential B2B payments on Ethereum
- Hidden sender, recipient, and amount
- Auditability via selective disclosure (viewing keys)

---

### **3. Institutional Payroll & Contractor Payments**

**Who:** Global companies, DAOs, remote-first organizations

**Problem:**

- Salaries and contractor payments publicly visible
- Internal compensation structures exposed
    
    **Hinkal enables:**
    
- Private payroll payments in stablecoins
- No public linkage between employer and employees
- Works with existing wallets and custody

---

### **4. Asset Managers, Funds & Family Offices**

**Who:** Funds deploying capital on-chain, family offices

**Problem:**

- Capital deployment size and timing is public
- Strategy and positioning leak to market observers
    
    **Hinkal enables:**
    
- Confidential capital movement on Ethereum
- Reduced signaling risk
- Private rebalancing and treasury ops

---

### **5. OTC Desks, Liquidity Providers & Market Makers**

**Who:** OTC desks, institutional liquidity providers

**Problem:**

- Inventory levels and trade flows visible
- Counterparties infer pricing and liquidity positions
    
    **Hinkal enables:**
    
- Confidential settlement between desks and counterparties
- Private inventory movements
- Reduced competitive leakage

---

### **6. Fintechs & Neobanks Using Stablecoin Rails**

**Who:** Stablecoin-based fintechs, payment platforms

**Problem:**

- Omnibus wallets still expose aggregate flows
- Customer behavior and volumes visible publicly
    
    **Hinkal enables:**
    
- Shielded internal settlement layer
- Optional privacy for high-value or sensitive flows
- No change to customer UX or custody model

---

### **7. Enterprise DeFi Execution (Selective)**

**Who:** Enterprises interacting with DeFi protocols

**Problem:**

- Strategy, size, and timing visible to the market
- Front-running and signaling risk
    
    **Hinkal enables:**
    
- Private execution paths
- Confidential interaction with DeFi while remaining on Ethereum

### Limitations and Open Questions

- Hinkal has undergone 6 smart contract audits from: [zkSecurity](https://www.zksecurity.xyz/reports/hinkal-audit), [Zokyo](https://github.com/zokyo-sec/audit-reports/blob/main/Hinkal/Hinkal_Zokyo_Feb20th_2024.pdf), [Quantstamp](https://certificate.quantstamp.com/full/hinkal-protocol/66b9b783-8b42-4a4e-89ed-3ef2a2df5958/index.html), [Secure3](https://github.com/Secure3Audit/Secure3Academy/tree/main/audit_reports/Hinkal), and [Hexens](https://drive.google.com/file/d/1A0kGmlg04X88-_c4uU0F5WvaMGTDUT3s/view?usp=sharing). And a bug bounty program with [Immunefi](https://immunefi.com/boost/hinkal-iop/leaderboard/)
- Hardware and MPC wallets wallets are currently supported on the access level. More support will be added on the transaction level.
- SDK-level key management, role-based access control, and enterprise governance features are on the roadmap.

### Summary

 Hinkal is a privacy infrastructure layer for public blockchains, delivered through a **non-custodial wallet** for end users and an **SDK for applications and institutional systems**. It reduces on-chain visibility of balances, counterparties, and transaction flows at the protocol level, enabling confidential asset holding, execution, and settlement **without relying on private blockchains, mixers, or custodial solutions**.

Hinkal allows privacy to be embedded directly into existing wallets, payment flows, and treasury systems, preserving compliance, auditability, and public-chain finality while eliminating unnecessary exposure.
