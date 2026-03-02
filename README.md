# 🛡️ XMR402-org Portal

XMR402 is an open, stateless, and decentralized HTTP payment standard built for the Monero ecosystem. It allows AI Agents and browser-based users to bypass service gates via millisecond-level 0-conf transaction proofs (TX Proof).

## 🚀 Overview

- **IETF Standard**: Fully compatible with `WWW-Authenticate` and `Authorization` headers.
- **Privacy First**: Built on Monero's subaddress and stealth technology.
- **Agent Native**: Designed for autonomous AI-to-Service payments without human intervention.
- **Zero Friction**: No accounts, no signups, no data harvesting.

## 📂 Repository Structure

- `/src`: React + Vite frontend for the portal.
- `SPEC.md`: The official XMR402 RFC-style protocol specification.

## 🛠️ Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev
```

## 📜 Protocol at a Glance

### 1. The Challenge (Server to Client)
```http
HTTP 402 Payment Required
WWW-Authenticate: XMR402 address="<subaddress>", amount="<piconero>", message="<nonce>"
```

### 2. The Proof (Client to Server)
```http
Authorization: XMR402 txid="<hash>", proof="<signature>"
```

---
Built by [KYC.rip](https://kyc.rip)
