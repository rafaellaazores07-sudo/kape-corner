import { ContactForm } from "@/components/contact/ContactForm";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";

const SHOP = {
  addressLines: [
    "128 Katipunan Avenue",
    "Loyola Heights, Quezon City",
    "Metro Manila 1108, Philippines",
  ],
  phone: "+63 917 555 0142",
  email: "hello@kapeCorner.ph",
  hours: [
    { days: "Monday – Friday", time: "7:00 AM – 10:00 PM" },
    { days: "Saturday – Sunday", time: "8:00 AM – 11:00 PM" },
    { days: "Holidays", time: "9:00 AM – 9:00 PM" },
  ],
};

const CONTACT_CARDS = [
  {
    Icon: MapPin,
    title: "Visit the shop",
    lines: SHOP.addressLines,
    action: {
      label: "Open in Maps",
      href: "https://maps.google.com/?q=128+Katipunan+Avenue+Loyola+Heights+Quezon+City",
      external: true,
    },
  },
  {
    Icon: Phone,
    title: "Call or text",
    lines: [SHOP.phone, "Viber & WhatsApp available"],
    action: {
      label: "Call us",
      href: `tel:${SHOP.phone.replace(/\s/g, "")}`,
      external: false,
    },
  },
  {
    Icon: Mail,
    title: "Email us",
    lines: [SHOP.email, "Replies within one business day"],
    action: {
      label: "Send an email",
      href: `mailto:${SHOP.email}`,
      external: false,
    },
  },
];

export function ContactPage() {
  return (
    <div data-ocid="contact.page" className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-warm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="container relative flex flex-col items-center gap-5 py-16 text-center md:py-20">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
            Contact Us
          </span>
          <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
            Kumusta? Let&rsquo;s talk coffee
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Whether it&rsquo;s a catering inquiry, a bulk order, or feedback on
            your last cup — we&rsquo;d love to hear from you.
          </p>
        </div>
      </section>

      <section
        data-ocid="contact.details.section"
        className="border-y border-border bg-background"
      >
        <div className="container grid gap-6 py-14 md:grid-cols-3 md:py-16">
          {CONTACT_CARDS.map(({ Icon, title, lines, action }) => (
            <article
              key={title}
              className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-1 hover:shadow-elevated"
            >
              <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent-foreground">
                <Icon className="size-6" aria-hidden="true" />
              </span>
              <h2 className="font-display text-xl font-bold tracking-tight">
                {title}
              </h2>
              <div className="space-y-1 text-sm leading-relaxed text-muted-foreground">
                {lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
              <a
                href={action.href}
                {...(action.external
                  ? { target: "_blank", rel: "noreferrer" }
                  : {})}
                data-ocid={`contact.details.${title.toLowerCase().replace(/\s+/g, "_")}_link`}
                className="mt-auto inline-flex w-fit items-center text-sm font-semibold text-primary transition-smooth hover:text-accent"
              >
                {action.label}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section data-ocid="contact.main.section" className="bg-secondary/40">
        <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14">
          <div className="space-y-8">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
                Opening hours
              </p>
              <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
                We&rsquo;re brewing every day
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground">
                Walk-ins are always welcome. For groups of six or more, give us
                a call ahead so we can save you a table.
              </p>
            </div>

            <ul
              data-ocid="contact.hours.list"
              className="space-y-3 rounded-3xl border border-border bg-card p-6 shadow-subtle"
            >
              {SHOP.hours.map((entry) => (
                <li
                  key={entry.days}
                  className="flex items-start gap-3 border-b border-border pb-3 last:border-b-0 last:pb-0"
                >
                  <Clock
                    className="mt-0.5 size-4 shrink-0 text-accent"
                    aria-hidden="true"
                  />
                  <span className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {entry.days}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {entry.time}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <div className="rounded-3xl border border-border bg-card p-6 shadow-subtle">
              <h3 className="font-display text-lg font-bold tracking-tight">
                Find us here
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {SHOP.addressLines.join(", ")}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                Two minutes from the Katipunan LRT-2 station. Street parking is
                available along Esteban Abada.
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </div>
  );
}
