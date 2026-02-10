import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-slate-950 text-white">
        <Navbar />
        <main className="max-w-5xl mx-auto px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
