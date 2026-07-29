# neo-miniapps

Neo MiniApps — app sources, their contracts, and the pipeline that publishes
built bundles to the CDN. Split out of
[neo-os-web](https://github.com/r3e-network/neo-os-web),
which now holds only platform code and loads these apps from the CDN at runtime.

## Layout

```
apps/<slug>/            one Vite SPA per app, with its neo-manifest.json
apps/tests/unit/        per-app tests (they reach their app by relative path)
apps/tests/test-utils/  shared vitest setup and SDK mocks
contracts/              per-app Neo N3 contracts + vendored MiniApp.DevPack
scripts/                build-all, CDN publisher, DevPack drift check
```

## Apps (53)

| Slug | Name | Category | Contract |
| --- | --- | --- | --- |
| `aa-account-lab` | AA Account Lab | tools | shared platform contract |
| `aa-market-hub` | AA Market Hub | tools | shared platform contract |
| `aa-permissions-lab` | AA Permissions | tools | shared platform contract |
| `aa-relay-console` | AA Relay Console | tools | shared platform contract |
| `aa-session-key-lab` | AA Session Key Lab | tools | shared platform contract |
| `asset-factory` | Asset Factory | tools | shared platform contract |
| `automation-copilot` | Automation Copilot | data | shared platform contract |
| `breakup-contract` | Breakup Contract | social | `MiniAppBreakupPact` |
| `council-governance` | Council Governance | governance | shared platform contract |
| `custom-anchor` | Custom Anchor | governance | shared platform contract |
| `dev-tipping` | Developer Tipping | social | `MiniAppTipJar` |
| `event-ticket-pass` | Event Ticket | social | `MiniAppEventTicketPass` |
| `explorer` | Block Explorer | tools | shared platform contract |
| `flashloan` | Flash Loan | defi | shared platform contract |
| `forever-album` | Forever Album | social | shared platform contract |
| `gas-sponsor` | Gas Sponsor | defi | shared platform contract |
| `gov-merc` | Gov Merc | governance | `MiniAppGovMerc` |
| `graveyard` | Graveyard | tools | shared platform contract |
| `memorial-shrine` | Memorial Shrine | social | shared platform contract |
| `milestone-escrow` | Milestone Escrow | finance | `MiniAppMilestoneEscrow` |
| `miniapp-factory` | MiniApp Factory | tools | shared platform contract |
| `neo-convert` | Neo Convert | tools | shared platform contract |
| `neo-message` | Neo Message | social | shared platform contract |
| `neo-multisig` | Neo Multisig | tools | `MiniAppMultisig` |
| `neo-ns` | Neo Name Service | tools | shared platform contract |
| `neo-pay` | NeoPay | finance | shared platform contract |
| `neo-pay-shared-example` | NeoPay Stream Studio | finance | shared platform contract |
| `neo-sign-anything` | Neo Signature Desk | tools | shared platform contract |
| `neo-swap` | Neo Swap | finance | shared platform contract |
| `neo-treasury` | Neo Treasury | tools | shared platform contract |
| `neo-x-bridge` | Neo X Bridge | defi | shared platform contract |
| `neodid-passport` | NeoDID Passport | tools | shared platform contract |
| `nft-factory` | NFT Factory | nft | shared platform contract |
| `oracle-compute-lab` | Oracle Compute Lab | tools | shared platform contract |
| `oracle-http-console` | Oracle HTTP Console | tools | shared platform contract |
| `oracle-neodid-console` | Oracle NeoDID Console | tools | shared platform contract |
| `oracle-price-console` | Oracle Price Console | tools | shared platform contract |
| `oracle-seal-console` | Oracle Seal Console | tools | shared platform contract |
| `oracle-vrf-console` | Oracle VRF Workbench | tools | shared platform contract |
| `private-transfer` | Confidential Transfer | defi | shared platform contract |
| `profitanchor` | ProfitAnchor | defi | shared platform contract |
| `profitanchor-admin` | ProfitAnchor Admin | utility | shared platform contract |
| `quadratic-funding` | Quadratic Funding | finance | `MiniAppQuadraticFunding` |
| `recovery-guardian` | Recovery Guardian | tools | shared platform contract |
| `red-envelope` | Red Envelope | social | `MiniAppRedEnvelope` |
| `self-loan` | SelfLoan | finance | `MiniAppSelfLoan` |
| `soulbound-certificate` | Soulbound Certificate | nft | `MiniAppSoulboundCertificate` |
| `time-capsule` | Time Capsule | social | `MiniAppTimeCapsule` |
| `timestamp-proof` | Timestamp Proof | tools | shared platform contract |
| `trustanchor` | TrustAnchor | governance | shared platform contract |
| `trustanchor-admin` | TrustAnchor Admin | utility | shared platform contract |
| `unbreakable-vault` | Unbreakable Vault | defi | shared platform contract |
| `wallet-health` | Wallet Health | tools | shared platform contract |

## Develop

```bash
npm install
npm test
cd apps/<slug> && npx vite
```

Apps import the SDK through the `@shared/*` and `@framework/*` aliases, which
resolve to [`neo-miniapp-sdk`](https://github.com/r3e-network/neo-miniapp-sdk)
in `node_modules`. Installing needs an `.npmrc` pointed at GitHub Packages for
the `@r3e-network` scope (one is committed here).

## Publish to the CDN

```bash
npm run build
npm run publish:cdn:dry-run     # prints the plan, uploads nothing
npm run publish:cdn
```

Bundles land in R2 under an immutable, versioned prefix and a small mutable
pointer flips a release live:

```
miniapps/<slug>/<version>/index.html          immutable, 1y
miniapps/<slug>/<version>/assets/*            immutable, 1y
miniapps/<slug>/<version>/neo-manifest.json   immutable, 1y
meta/miniapps/<slug>/latest.json              60s — the pointer the platform reads
catalog/miniapps.json                         60s — meta + logo for the launcher grid
```

Because the version is in the path, a rollback is a pointer flip rather than a
re-upload, and the platform never has to bust an asset cache.

Credentials come from the environment (`CLOUDFLARE_API_TOKEN`,
`CF_API_TOKEN_ID`, `CLOUDFLARE_ACCOUNT_ID`, `MINIAPP_R2_BUCKET`); see
`scripts/publish-bundles-r2.mjs`.

## Contracts

```bash
npm run build:contracts
npm run check:devpack-drift
```

`contracts/MiniApp.DevPack` is vendored: Neo contracts compile their base
classes in via `<Compile Include>` rather than linking a package, so there is
no dependency form to use. `check:devpack-drift` fails if the vendored copy
diverges from the platform's canonical one.
