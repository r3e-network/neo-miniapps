import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

/**
 * The app-owned half of the platform's production-data guardrails, which used to
 * read these files across the repo boundary. Each assertion is the platform's
 * verbatim - what moved is which repo holds the source being scanned.
 */
const repoRoot = path.resolve(__dirname, "../../..");

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot, relativePath), "utf8");
}

describe("Production data guardrails", () => {
  it("does not ship local preview mocks for chain stats or recent transactions", () => {
    const explorerSource = read("apps/explorer/src/composables/useExplorer.ts");

    expect(explorerSource).not.toMatch(/LOCAL_.*MOCK/);
    expect(explorerSource).not.toContain("isLocalPreview");
  });

  it("does not ship fake private transfer or bridge input values", () => {
    const sources = read("apps/private-transfer/src/PlayArea.tsx");

    expect(sources).not.toContain("N...recipient");
    expect(sources).not.toContain('useState("private payment")');
    expect(sources).not.toContain("0xAxLabs...");
    expect(sources).not.toContain("sync:miniapp-state");
    expect(sources).not.toContain("inline encrypted_payload");
    expect(sources).not.toContain("nullifier_hash_preview");
  });

  it("does not ship local randomness or fake VRF request defaults", () => {
    const sources = [
      "apps/automation-copilot/src/composables/useAutomationCopilot.ts",
      "apps/automation-copilot/src/PlayArea.tsx",
      "apps/automation-copilot/src/main.tsx",
      "apps/automation-copilot/src/manifest.ts",
      "apps/automation-copilot/src/locale/messages.ts",
      "apps/oracle-vrf-console/src/appConfig.ts",
    ]
      .map((relativePath) => read(relativePath))
      .join("\n");

    expect(sources).not.toContain("miniapp-game-round");
    expect(sources).not.toContain("round-42");
    expect(sources).not.toContain("recipe_preview");
    expect(sources).not.toContain("local pseudorandomness");
    expect(sources).not.toContain("loadJitter");
    expect(sources).not.toContain("Jitter");
    expect(sources).not.toContain("Build and preview");
  });

  it("does not expose tutorial copy that points users to implementation chrome", () => {
    // The live red-envelope play surface. Was src/PlayArea.tsx, an unmounted
    // DOM component that has since been deleted; main.tsx mounts this one.
    const sources = read("apps/red-envelope/src/PhaserPlayArea.tsx");

    expect(sources).not.toMatch(/right action console/i);
    expect(sources).not.toMatch(/shared action console/i);
    expect(sources).not.toMatch(/from the action console/i);
  });
});

describe("Official brand assets", () => {
  it("uses the official Neo icon as the app-source logo for Neo governance miniapps", () => {
    // The platform half of this parity check - that everything the host serves
    // for these slugs is the official mark - stays in the platform. This half
    // pins the app source it is compared against.
    const officialNeoIcon = fs.readFileSync(
      path.join(
        repoRoot,
        "node_modules/@r3e-network/neo-miniapp-shared/assets/tokens/neo-icon.svg",
      ),
      "utf8",
    );

    for (const slug of ["council-governance", "gov-merc"]) {
      expect(read(`apps/${slug}/public/logo.svg`).trim()).toBe(officialNeoIcon.trim());
    }
  });
});

describe("Memorial Shrine embedded flows", () => {
  it("keeps the createMemorial and payTribute wallet flows in the embedded app", () => {
    // The platform half - that the host does not duplicate these with a generic
    // operation panel - stays in the platform's miniapp-definitions guard.
    const embeddedFlow = read("apps/memorial-shrine/src/composables/useMemorialShrine.ts");

    expect(embeddedFlow).toContain('"createMemorial"');
    expect(embeddedFlow).toContain('"payTribute"');
  });
});
