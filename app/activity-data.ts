export type ActivityAmount = {
  asset_type?: string;
  asset_code?: string;
  asset_issuer?: string;
  amount?: string;
};

export function formatActivityAmount(amount: ActivityAmount) {
  const value = amount.amount?.trim() || "—";
  const asset = amount.asset_type === "native"
    ? "XLM"
    : amount.asset_code?.trim() || "Unknown asset";
  const issuer = amount.asset_type !== "native" && amount.asset_issuer?.trim()
    ? ` · issuer ${amount.asset_issuer.trim()}`
    : "";

  return `${value} ${asset}${issuer}`;
}
