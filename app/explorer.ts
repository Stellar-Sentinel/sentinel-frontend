export type ExplorerResource = "account" | "contract" | "tx" | "ledger";

const NETWORK_PATHS = new Map([
  ["testnet", "testnet"],
  ["test sdf network ; september 2015", "testnet"],
  ["public", "public"],
  ["public global stellar network ; september 2015", "public"],
]);

function explorerNetworkPath(network?: string) {
  return network ? NETWORK_PATHS.get(network.trim().toLowerCase()) : undefined;
}

export function explorerUrl(network: string | undefined, type: ExplorerResource, value: string) {
  const networkPath = explorerNetworkPath(network);
  return networkPath && value.trim()
    ? `https://stellar.expert/explorer/${networkPath}/${type}/${encodeURIComponent(value)}`
    : null;
}
