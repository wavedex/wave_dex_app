import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VisualEditsMessenger } from "orchids-visual-edits";
import { SolanaProvider } from "@/components/SolanaProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WaveDex | Conviction Over Luck",
  description: "The ultimate DeFi trading contest on Solana. Buy, hold, and earn conviction points.",
  icons: {
    icon: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/project-uploads/1d69b988-7f20-42cb-acb9-faa4090f6e5e/image-removebg-preview-1-1769820808958.png?width=8000&height=8000&resize=contain",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <SolanaProvider>
          {children}
        </SolanaProvider>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
