import { Link } from "@tanstack/react-router";
import {
  Clock,
  Coffee,
  Facebook,
  Instagram,
  Mail,
  MapPin,
  Phone,
} from "lucide-react";

const SHOP = {
  address: "128 Katipunan Avenue, Loyola Heights, Quezon City, Metro Manila",
  phone: "+63 917 555 0142",
  email: "hello@kapeCorner.ph",
  hours: [
    { days: "Monday – Friday", time: "7:00 AM – 10:00 PM" },
    { days: "Saturday – Sunday", time: "8:00 AM – 11:00 PM" },
  ],
};

const SOCIALS = [
  { label: "Facebook", href: "https://facebook.com", Icon: Facebook },
  { label: "Instagram", href: "https://instagram.com", Icon: Instagram },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      data-ocid="footer"
      className="border-t border-border bg-primary text-primary-foreground"
    >
      <div className="container grid gap-10 py-14 md:grid-cols-2 md:py-16 lg:grid-cols-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-foreground/10">
              <Coffee className="size-5" aria-hidden="true" />
            </span>
            <span className="font-display text-xl font-bold tracking-tight">
              Kape Corner
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-primary-foreground/75">
            A neighborhood coffee shop serving freshly brewed local beans, iced
            lattes, and Filipino merienda favorites — every day of the week.
          </p>
          <div className="flex gap-2">
            {SOCIALS.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                data-ocid={`footer.social.${label.toLowerCase()}`}
                className="flex size-11 items-center justify-center rounded-full bg-primary-foreground/10 transition-smooth hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
            Visit Us
          </h2>
          <ul className="space-y-3 text-sm text-primary-foreground/85">
            <li className="flex gap-3">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span>{SHOP.address}</span>
            </li>
            <li className="flex gap-3">
              <Phone
                className="mt-0.5 size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <a
                href={`tel:${SHOP.phone.replace(/\s/g, "")}`}
                data-ocid="footer.phone_link"
                className="transition-smooth hover:text-accent"
              >
                {SHOP.phone}
              </a>
            </li>
            <li className="flex gap-3">
              <Mail
                className="mt-0.5 size-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <a
                href={`mailto:${SHOP.email}`}
                data-ocid="footer.email_link"
                className="transition-smooth hover:text-accent"
              >
                {SHOP.email}
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
            Opening Hours
          </h2>
          <ul className="space-y-3 text-sm text-primary-foreground/85">
            {SHOP.hours.map((entry) => (
              <li key={entry.days} className="flex gap-3">
                <Clock
                  className="mt-0.5 size-4 shrink-0 text-accent"
                  aria-hidden="true"
                />
                <span>
                  <span className="block font-medium text-primary-foreground">
                    {entry.days}
                  </span>
                  <span className="text-primary-foreground/70">
                    {entry.time}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-foreground/60">
            Quick Links
          </h2>
          <ul className="space-y-2.5 text-sm text-primary-foreground/85">
            {[
              { to: "/menu", label: "Full Menu" },
              { to: "/cart", label: "Your Cart" },
              { to: "/track", label: "Track an Order" },
              { to: "/about", label: "About Us" },
              { to: "/contact", label: "Contact Us" },
            ].map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  data-ocid={`footer.link.${link.label.toLowerCase().replace(/\s+/g, "_")}`}
                  className="transition-smooth hover:text-accent"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-xs text-primary-foreground/60">
            All prices in Philippine Peso (₱). Cash, GCash, and Maya accepted.
          </p>
        </div>
      </div>

      <div className="border-t border-primary-foreground/15">
        <div className="container flex flex-col items-center justify-between gap-3 py-6 text-xs text-primary-foreground/70 sm:flex-row">
          <p>© {year} Kape Corner. All rights reserved.</p>
          <p>
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-accent transition-smooth hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
