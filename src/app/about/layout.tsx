import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About - Routineum",
  description: "Routineumについての詳細情報",
};

export default function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
