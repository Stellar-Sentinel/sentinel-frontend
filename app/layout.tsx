import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "Stellar Sentinel | Account intelligence",
  description:
    "Screen Stellar accounts with explainable activity signals and review Soroban contract flag events.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
