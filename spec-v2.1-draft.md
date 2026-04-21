
# XMR402: The Stateless, Anonymous Payment Primitive for the Machine Economy

* **An agnostic protocol for agents, context retrieval, APIs, and P2P relays**
* **Drafted by: [@XBToshi](https://x.com/xbtoshi)**
* **[XMR402.org](https://xmr402.org) / [@XMR402](https://x.com/xmr402) / Protocol Spec / x402**
* **Draft v2.1 / March 2026**

## Abstract
The internet is shifting. Human browsing is out; autonomous AI agents are in. But the underlying payment infrastructure is stuck in Web2. Credit cards, account registrations, fiat gateways—AI agents don't have bank accounts. Hit a paywall, and they just crash.

XMR402 proposes a native, censorship-resistant machine-to-machine (M2M) payment protocol. By fusing stateless cryptographic intent binding with Monero (XMR) transaction proofs (TX Proofs), XMR402 lets any client buy network resources in milliseconds. No sign-ups. No identity leaks. No waiting for block confirmations.

In v2.1, XMR402 remains a **transport-agnostic primitive**, ready to secure API gateways, P2P WebSocket relays, and darknet hidden services alike. This version introduces optional Server-Sent Events (SSE) for HTTP transport and timestamp-based replay protection — both fully backward-compatible with v2.0 clients.

## 1. The Dead End of Legacy Tech
Current crypto payment gateways and Web3 agent standards (like ERC-8183) are bloated. They suffer from four fatal flaws:
1. **State Bloat:** Servers have to maintain order databases, generate unique receiving addresses, and constantly poll nodes. It's a DDoS nightmare.
2. **Confirmation Latency:** Traditional on-chain payments take minutes to hours. For an API call demanding a millisecond response, that's a joke.
3. **Privacy Leaks:** Transparent ledgers expose an AI agent's money flow and behavioral footprint.
4. **Smart Contract Toll Booths:** Web3 ecosystems force agents to use heavy on-chain escrow contracts to trade. This introduces massive gas fees and relies on the blockchain as a slow, expensive middleman.

## 2. The Decoupled Architecture
To scale infinitely, XMR402 drops the database entirely. It relies purely on math. The protocol splits the cryptographic verification from the network transport layer into three distinct modules:

* **`xmr402-core`**: The pure cryptographic engine. It handles intent binding, HMAC nonce generation, and `check_tx_proof` validation. Zero network dependencies.
* **`xmr402-http`**: The Web middleware. It implements IETF HTTP 402 standards, handling Headers and RESTful API gating. *v2.1 adds optional SSE push state.*
* **`xmr402-ws`**: The Relay binding. Uses standardized JSON frames for P2P agent communication behind NATs or on Nostr relays. Dumb pipes, smart edges.

## 3. Transport Layer I: The HTTP Flow
For traditional API gateways, XMR402 hijacks the "order" concept and goes back to the stateless roots of HTTP. The protocol operates in three tactical phases:

```mermaid
sequenceDiagram
    autonumber
    participant C as Client (Agent/Browser)
    participant W as Wallet (Gateway/Terminal)
    participant S as Server (Ripley Guard)

    C->>S: POST /protected-resource (Payload)
    S-->>C: HTTP 402 Payment Required<br/>WWW-Authenticate: XMR402 address="...", amount="...", message="...", timestamp="..."

    C->>W: Request Payment Execution (address, amount, message)

    Note over W: Local RPC: transfer<br/>Local RPC: get_tx_proof(message)

    W-->>C: Returns (txid, proof_signature)

    C->>S: POST /protected-resource (Payload)<br/>Authorization: XMR402 txid="...", proof="..."

    Note over S: RPC: check_tx_proof<br/>Verify 0-conf mempool TX & Payload Hash
    S-->>C: HTTP 200 OK (Access Granted)

```

When an agent hits a protected resource, the Guard intercepts it and returns an `HTTP 402 Payment Required` status. It drops the payment specs inside the standard `WWW-Authenticate` header. This includes the receiving subaddress, the amount in atomic units (piconeros), a dynamic intent-bound nonce (`message`), and a `timestamp` for replay window enforcement.

The agent broadcasts the transaction, grabs the TX hash, and calls the local Monero wallet's `get_tx_proof`. It re-fires the identical HTTP request, packing the cryptographic credential into the `Authorization` header.

### 3.1 SSE Extension (v2.1)

Standard HTTP flow returns an immediate `200 OK` once `check_tx_proof` passes. This works, but forces agents to either accept 0-conf risk or implement their own polling for confirmation upgrades.

v2.1 introduces an optional SSE handshake that eliminates polling entirely:

**Server signals support:**
```
WWW-Authenticate: XMR402 address="...", amount="...", message="...", timestamp="...", features="sse"
```

**Client opts in:**
```
Authorization: XMR402 txid="...", proof="..."
Accept: text/event-stream
```

**Server opens SSE stream:**
```
HTTP/1.1 200 OK
Content-Type: text/event-stream

event: accepted
data: {"status": "mempool", "access_token": "..."}

event: confirmed
data: {"status": "confirmed", "confirmations": 1}
```

**Backward compatibility:**
- v2.0 servers omit `features` from the challenge. v2.1 clients fall back to standard flow.
- v2.0 clients ignore the `features="sse"` field and never send `Accept: text/event-stream`. The server returns a standard `200 OK`.
- No protocol negotiation required. Feature detection is implicit.

## 4. Transport Layer II: The Relay Flow
Agents running locally without public IPs cannot receive HTTP callbacks. XMR402-WS solves this by passing JSON frames over persistent WebSocket connections.

Instead of heavy smart contracts acting as middlemen, agents use simple messaging relays (like Nostr). The relay is just a dumb pipe. The validation happens entirely at the edge.

```mermaid
sequenceDiagram
    autonumber
    participant A as Agent A (Requestor)
    participant R as Relay (WebSocket/Nostr)
    participant B as Agent B (Provider)
    participant W as Local Wallet (RPC)

    A->>R: Push Task Request (JSON)
    R->>B: Route Task Request

    Note over B: Calculate stateless HMAC nonce (message) + timestamp
    B->>R: Push PAYMENT_CHALLENGE (JSON)
    R->>A: Route Challenge

    A->>W: Execute transfer & get_tx_proof(nonce)
    W-->>A: Returns (txid, proof_signature)

    A->>R: Push PAYMENT_PROOF (JSON)
    R->>B: Route Proof

    Note over B: Edge Verification: check_tx_proof<br/>Verify mempool TX & payload hash
    B->>R: Push Task Result (JSON)
    R->>A: Route Result

```

The serving agent (Agent B) pushes a `PAYMENT_CHALLENGE` JSON frame. The requesting agent (Agent A) processes the payment locally through its own node and pushes the `PAYMENT_PROOF` frame back. The relay stays dumb, fast, and free. No gas fees, no waiting for blocks.

### 4.1 Timestamp Field (v2.1)

v2.1 adds an optional `timestamp` field to the `PAYMENT_CHALLENGE` frame:

```json
{
  "type": "PAYMENT_CHALLENGE",
  "address": "...",
  "amount": "...",
  "message": "...",
  "timestamp": 1711468800
}
```

The timestamp enables replay window enforcement on the relay layer, matching the HTTP transport's behavior. v2.0 providers that omit `timestamp` continue to function — requestors treat missing timestamps as "no expiry" and fall back to nonce-only replay protection.

Because WebSocket connections are inherently push-based, SSE is not needed here. The relay naturally delivers `TASK_RESULT` frames the moment verification completes.

## 5. Tactical Breakthroughs

### Hyper-Speed: Mempool 0-Conf

Monero's privacy hides the sender and the amount. But its proof mechanism lets us cryptographically verify that a specific transaction paid a specific amount to a specific address. By checking the mempool, we crush the crypto payment delay from 10 minutes down to 200 milliseconds.

### Intent Binding: Defeating the Bait-and-Switch

To prevent instruction replacement attacks, the server dynamically calculates a stateless HMAC-SHA256 hash using a server secret, the client's IP, the timestamp, and a **hash of the request payload**.

When the proof returns, the server recalculates this binding. A payment for a cheap text prompt cannot be reused for an expensive rendering task. The machine intent is locked down. No database. Massive concurrency. Military-grade security.

*v2.1 change: The `timestamp` is now included in the HMAC input, enabling time-bounded challenge expiry without server-side state. Recommended TTL: 300 seconds. Servers SHOULD reject proofs where `now - timestamp > TTL`.*

### Defending Wallet Bloat

Traditional privacy gateways demand a new address per invoice. High traffic instantly kills the node's wallet scanning engine. XMR402 routes all requests to a single subaddress. We rely on Monero's on-chain stealth addresses for absolute privacy, and use the HMAC nonce + timestamp to completely kill replay attacks.

## 6. The Component Matrix

XMR402 isn't just an isolated repo. It's the foundational protocol for autonomous economies. We built three standard components around it:

* **Guard (The Shield):** Stateless middleware deployed on the server side or relay edge. Issues challenges and verifies proofs.
* **Gateway (The Sword):** A tactical wallet interface bolted onto AI Agents. Gives models the power to read 402s or JSON challenges, pay autonomously, and breach firewalls.
* **Terminal (The Anchor):** The human control deck. Triggers via Deep Link (`xmr402://`) when a browser hits a 402, offering one-click signature clearance.

## 7. The Endgame

Code is law. Cryptography is consensus. Ethereum builds heavy, stateful toll booths for agents. XMR402 builds the stateless, invisible highway. We seamlessly weld modern transport standards with Monero's anonymity. We are dropping this protocol to serve as the permissionless blood engine for the imminent AI machine economy.

---

## Appendix: v2.0 → v2.1 Changelog

| Change | HTTP | WS/Relay | Breaking? |
|--------|------|----------|-----------|
| `timestamp` in challenge | Added to `WWW-Authenticate` | Added to `PAYMENT_CHALLENGE` | No — v2.0 clients ignore unknown fields |
| `timestamp` in HMAC input | Included in intent binding | Included in intent binding | No — v2.0 servers without timestamp continue to work |
| `features="sse"` signal | Added to `WWW-Authenticate` | N/A (WS is push-native) | No — v2.0 clients ignore unknown fields |
| SSE response stream | Client opts in via `Accept: text/event-stream` | N/A | No — without opt-in, standard `200 OK` returned |
| Recommended challenge TTL | 300 seconds | 300 seconds | No — servers MAY enforce, not MUST |
