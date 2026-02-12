import "./globals.css";
import Navbar from "@/components/Navbar";
import PublicFooter from "@/components/PublicFooter";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col bg-slate-950 text-white">
        <Navbar />
        <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
          {children}
        </main>
        <PublicFooter />
      </body>
    </html>
  );
}
