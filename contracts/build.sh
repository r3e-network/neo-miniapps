#!/bin/bash
# Compile every miniapp contract in this repo to build/.
#
# The platform's own contracts (PlatformRegistry, PlatformDeFi, ...) are built in
# neo-os-contracts; only the app layer is built here. MiniApp.DevPack is the
# shared base library the app contracts derive from, so it is compiled first by
# virtue of sorting ahead of the MiniApp* projects.
#
# Unlike neo-minigames, this repo has no legacy game clones, so there is no
# BUILD_LEGACY_CLONES switch - every project found is built.
set -e

script_dir="$(cd "$(dirname "$0")" && pwd)"
# shellcheck source=scripts/lib/dotnet_tools.sh
source "$script_dir/../scripts/lib/dotnet_tools.sh"
cd "$script_dir"
mkdir -p build

ensure_dotnet_root
NCCS_BIN="$(resolve_dotnet_tool nccs 'dotnet tool install -g Neo.Compiler.CSharp')"

echo "=== Building MiniApp Contracts ==="

find . -mindepth 2 -maxdepth 3 -name '*.csproj' \
  ! -path './__tests__/*' | sort | while read -r project; do
  d="$(basename "$(dirname "$project")")"
  echo "Building $d..."
  dotnet build "$project" -c Release
  "$NCCS_BIN" "$project" --optimize=All --output ./build/
done

echo "=== Build Complete ==="
