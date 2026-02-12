import Link from "next/link";

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Home", href: "/" },
      { label: "Verify Badge", href: "/verify" },
      { label: "Compare FD/RD Rates", href: "/rates-comparison" },
      { label: "Calculators", href: "/calculators" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about-us" },
      { label: "How It Works", href: "/how-it-works" },
      { label: "Contact Us", href: "/contact-us" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Use", href: "/terms-of-use" },
      { label: "Disclaimer", href: "/disclaimer" },
    ],
  },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 px-6 py-10 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <h3 className="text-base font-semibold text-white">Nation Builder Badge</h3>
          <p className="text-sm leading-6 text-slate-400">
            A civic recognition platform for responsible Indian taxpayers.
          </p>
        </div>

        {footerSections.map((section) => (
          <div key={section.title} className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
              {section.title}
            </h3>
            <ul className="space-y-2 text-sm">
              {section.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="transition hover:underline">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-800">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {currentYear} Nation Builder Badge</p>
          <p>Built for financial responsibility &amp; civic pride</p>
        </div>
      </div>
    </footer>
  );
}
