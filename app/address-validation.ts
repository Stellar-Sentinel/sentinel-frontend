/**
 * Keep client-side validation network-agnostic and bounded. The backend
 * performs checksum validation after the request is accepted by the UI.
 */
export function isStellarAddressFormat(address: string) {
  return /^G[A-Z2-7]{55}$/.test(address) || /^M[A-Z2-7]{68}$/.test(address);
}

export const stellarAddressFormatHint = "Use a 56-character G-prefixed or 69-character M-prefixed Stellar account address. The backend checks its checksum.";
