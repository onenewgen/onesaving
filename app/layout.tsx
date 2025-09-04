import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ThemeToggle from "./components/ThemeToggle";
import Header from "./components/Header";
import LocaleProvider from "./components/LocaleProvider";
import LocaleSwitcher from "./components/LocaleSwitcher";
import SettingsDialog from "./components/SettingsDialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OneSaving",
  description: "ระบบจัดการรายรับ-รายจ่าย",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LocaleProvider>
          <div className="fixed top-0 right-0 z-50 flex items-center gap-2">
            <SettingsDialog />
          </div>
          <main className="min-h-screen bg-gradient-to-br from-indigo-400 via-indigo-500 to-purple-600 py-8 px-4">
            <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-2xl">
              <Header />
              {children}
            </div>
          </main>
        </LocaleProvider>
      </body>
    </html>
  );
}
