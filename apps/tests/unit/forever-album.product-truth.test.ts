import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

function repoRoot(): string {
  return process.cwd().endsWith(`${path.sep}apps${path.sep}shared`)
    ? path.resolve(process.cwd(), "../..")
    : process.cwd();
}

function read(relativePath: string): string {
  return fs.readFileSync(path.join(repoRoot(), relativePath), "utf8");
}

describe("Forever Album product truth", () => {
  it("declares the real device-local, non-transactional product boundary", () => {
    const manifest = JSON.parse(read("apps/forever-album/neo-manifest.json")) as Record<string, unknown> & {
      contracts: Record<string, unknown>;
      permissions: string[];
      platform: { transactions: boolean };
      operation_panel: { operations: unknown[] };
    };

    expect(manifest.contracts).toEqual({});
    expect(manifest.permissions).toEqual([]);
    expect(manifest.platform.transactions).toBe(false);
    expect(manifest.operation_panel.operations).toEqual([]);
    expect(manifest).not.toHaveProperty("stateSource");
    expect(String(manifest.description)).toMatch(/this browser|this device/i);
    expect(String(manifest.description)).toMatch(/no transaction/i);
  });

  it("does not reintroduce chain, payment, or remote-storage behavior", () => {
    const logic = read("apps/forever-album/src/composables/useForeverAlbum.ts");
    const runtimeManifest = read("apps/forever-album/src/manifest.ts");

    expect(logic).not.toMatch(/app\.chain|app\.storage\.(?:remote|hybrid)|invokeWithPayment/);
    expect(runtimeManifest).toMatch(/chainWarning:\s*false/);
    expect(runtimeManifest).toMatch(/permissions:\s*\{\}/);
    expect(runtimeManifest).not.toMatch(/payments:\s*true|contract:\s*\{/);
  });

  // Assertion update (audit fix C-4, commit a8101a750): this test previously
  // pinned the `allow-same-origin` sandbox grant on the album iframe. That
  // grant let a compromised miniapp bundle reach the host origin (session
  // storage included); C-4 removed it and the contract regression
  // AuditFixC4_MiniAppIframesAreSandboxed now forbids allow-same-origin on
  // every miniapp sandbox line — so the old assertion pinned a security hole
  // and was already failing by design. The product capability it guarded —
  // persistent, device-local album storage inside the embedded iframe — is
  // now delivered by the appId-gated host<->miniapp storage bridge (the same
  // pattern as the goose-game saves and the copilot credential). The
  // successor invariant checks that capability end to end: the sandbox stays
  // opaque, the host mounts the storage bridge for the album iframe, the
  // bridge serves the album's legacy first-party "forever-album:" namespace
  // (byte-identical keys, so pop-out and pre-C-4 albums are not orphaned),
  // and the app routes persistence through the bridge when the sandbox
  // blocks direct Web Storage.
  it("persists album data through the storage bridge", () => {
    // App side: album persistence rides the bridge protocol inside the
    // opaque sandbox, with acknowledged (not fire-and-forget) writes.
    const albumStore = read("apps/forever-album/src/utils/album-store.ts");
    const sharedStorageClient = read("node_modules/@r3e-network/neo-miniapp-shared/utils/embedded-storage-client.ts");
    expect(sharedStorageClient).toContain("neo-miniapp-storage:request");
    expect(albumStore).toContain("createEmbeddedStorageClient");
    expect(albumStore).toContain('"miniapp-forever-album"');
    const logic = read("apps/forever-album/src/composables/useForeverAlbum.ts");
    expect(logic).toContain("resolveAlbumStore");
  });

  it("uses product-specific album art for the catalog cover", () => {
    const manifest = JSON.parse(read("apps/forever-album/neo-manifest.json")) as {
      urls: { banner: string };
    };
    expect(manifest.urls.banner).toBe("/miniapps/forever-album/forever-album-memory-stage.webp");
  });
});
