import "./globals.css";
import type { Metadata } from "next";
import Nav from "@/components/Nav";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: "Present",
  description: "A protocol for being a better partner.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <Nav />
          <main className="max-w-3xl mx-auto px-6 pb-24">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
        </div>
      </body>
    </html>
  );
}
