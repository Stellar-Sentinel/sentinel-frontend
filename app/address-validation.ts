const STELLAR_ALPHABET = "[A-Z2-7]";

export type AddressValidation =
  | { valid: true; address: string; kind: "classic" | "muxed" }
  | { valid: false; address: string; message: string };

export function validateStellarAddress(value: string): AddressValidation {
  const address = value.trim();
  if (!address) {
    return { valid: false, address, message: "Enter a Stellar account address." };
  }

  if (new RegExp(`^G${STELLAR_ALPHABET}{55}$`).test(address)) {
    return { valid: true, address, kind: "classic" };
  }

  if (new RegExp(`^M${STELLAR_ALPHABET}{68}$`).test(address)) {
    return { valid: true, address, kind: "muxed" };
  }

  return {
    valid: false,
    address,
    message: "Enter a 56-character G-prefixed or 69-character M-prefixed Stellar address.",
  };
}
