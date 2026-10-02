import type { Metadata } from "next";
import "../globals.css";


export const metadata: Metadata = {
  title: "Creator Group — International services",
  description: "Study, travel, healthcare and international coordination in three languages.",
  icons: {
    icon: "/brand/creator-logo.webp",
    shortcut: "/brand/creator-logo.webp",
  },
};

export default async function RootLayout({
  children, params,
}: Readonly<{
  children: React.ReactNode; params: Promise<{lang:string}>;
}>) {
  const {lang:language}=await params;
  return (
    <html lang={language} dir={language==='fa'?'rtl':'ltr'}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
