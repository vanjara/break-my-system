import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Break My System",
  description: "Build it. Break it. Understand it. Interactive system-design learning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
