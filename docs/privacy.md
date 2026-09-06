# Zenvora Privacy Policy & Data Architecture

> **Effective Date:** September 2026  
> **Core Guarantee:** "Zenvora is designed to minimize tracking and does not maintain a personal search history."

---

## 1. Introduction & Philosophy

Zenvora was engineered from the ground up on the principle of **Zero-Knowledge Metasearch**. Traditional search engines track your search queries to construct detailed behavioral dossiers, which are then monetized for targeted advertising. 

Zenvora operates on an entirely different model: we treat search queries as transient, encrypted requests that belong solely to you.

---

## 2. What Information Zenvora Collects

### 2.1 Search Queries
- **Never Logged:** When you submit a search query, it exists in server memory only for the fraction of a second required to fetch results from SearXNG.
- **No Query History:** Zenvora does not write search queries to databases, flat files, analytics dashboards, or disk storage.
- **No User Profiles:** We do not track who searched for what, when, or from where.

### 2.2 IP Addresses
- **Upstream Shielding:** External search engines (Google, Bing, Brave, Wikipedia) only see the IP address of the Zenvora server. Your real IP address is never transmitted to them.
- **Server Ephemeral Logs:** Web server connection logs do not correlate client IP addresses with specific search query content.

### 2.3 Cookies and Local Storage
- **Zero Tracking Cookies:** Zenvora sets **no** tracking cookies, session identifiers, advertising cookies, or third-party analytical beacons.
- **Client-Side Preferences Only:** Your chosen preferences (e.g. Dark Mode, SafeSearch setting, interface language) are stored strictly within your browser's `localStorage`. This data never leaves your computer or device.

---

## 3. How Search Queries Travel Through Zenvora

```
[ Your Browser ]
      │  (HTTPS Encrypted)
      ▼
[ Zenvora Edge (Caddy) ]
      │  (Stripped of tracking identifiers)
      ▼
[ Zenvora API Layer ]
      │  (Input validation & query sanitization)
      ▼
[ SearXNG Internal Node ]
      │  (Aggregates across multiple engines)
      ▼
[ Upstream Search Engines (Google, Bing, Brave) ]
      └── Only sees Zenvora's server IP & generic user agent.
```

---

## 4. Upstream Search Providers

When you search via Zenvora, SearXNG queries multiple search engines in parallel.

### What upstream providers receive:
- The search keywords.
- The IP address of the Zenvora server.
- A standardized, generic HTTP User-Agent.

### What upstream providers NEVER receive:
- Your personal IP address.
- Your browser cookies.
- Your geographical GPS or Wi-Fi location.
- Your device fingerprint or browsing history.

---

## 5. Third-Party Services & Analytics

- **No Third-Party Scripts:** Zenvora does not include Google Analytics, Facebook SDKs, Hotjar, or any ad networks.
- **No Fonts Telemetry:** Google Fonts are loaded using privacy-conscious headers without storing cookies.
- **Open Source Verification:** Every line of code running Zenvora is publicly accessible for auditing and self-hosting.

---

## 6. Open Source Self-Hosting Rights

Because Zenvora is fully containerized and open source under the MIT license, you are encouraged to audit the code, inspect Docker configurations, and deploy your own private instance on your personal VPS.
