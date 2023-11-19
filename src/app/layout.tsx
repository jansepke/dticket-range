import CssBaseline from "@mui/material/CssBaseline";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Deutschlandticket Reichweite",
  description: "Wie weit kommt man mit dem Deutschlandticket?",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <CssBaseline />
      <body className={inter.className}>{children}</body>
    </html>
  );
}
