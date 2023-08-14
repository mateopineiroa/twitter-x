import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AuthButtonServer from "./auth-button-server";

const inter = Inter({ subsets: ["latin"] });

/* the next line fixes the error 'DynamicServerError: Dynamic server usage: cookies' */
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ height: "100dvh" }} className={inter.className}>
        {children}
      </body>
    </html>
  );
}
