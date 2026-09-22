import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Coffee, MapPin, Star } from "lucide-react";

const HERO_IMAGE = "/assets/generated/hero-latte.dim_1200x1000.jpg";

const HERO_STATS = [
  { value: "100%", label: "Arabica beans" },
  { value: "15 min", label: "Average pickup" },
  { value: "4.9★", label: "Customer rating" },
];

export function HeroSection() {
  return (
    <section
      data-ocid="home.hero.section"
      className="relative overflow-hidden bg-gradient-warm"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="container relative grid items-center gap-12 py-16 md:py-24 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
            <Coffee className="h-3.5 w-3.5" aria-hidden="true" />
            Made in the Philippines
          </span>

          <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Fresh Coffee.
            <span className="block text-primary">Great Moments.</span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
            Kape Corner is your neighborhood coffee shop — slow-roasted local
            beans, creamy iced blends, and warm pastries served with a smile.
            Order ahead and skip the line.
          </p>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <Button
              asChild
              size="lg"
              data-ocid="home.hero.order_now_button"
              className="h-12 rounded-full bg-accent px-7 text-base font-semibold text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
            >
              <Link to="/menu">
                Order Now
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              data-ocid="home.hero.about_link"
              className="h-12 rounded-full border-primary/30 bg-transparent px-7 text-base font-semibold text-primary transition-smooth hover:bg-primary/5"
            >
              <Link to="/about">Our story</Link>
            </Button>
          </div>

          <dl className="mt-2 grid w-full max-w-md grid-cols-3 gap-4 border-t border-border pt-6">
            {HERO_STATS.map((stat) => (
              <div key={stat.label} className="flex flex-col gap-1">
                <dt className="sr-only">{stat.label}</dt>
                <dd className="font-display text-xl font-bold text-primary">
                  {stat.value}
                </dd>
                <dd className="text-xs leading-snug text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative rotate-2 rounded-[2rem] border border-border bg-card p-3 shadow-elevated transition-smooth hover:rotate-0">
            <img
              src={HERO_IMAGE}
              alt="A freshly poured latte with rosetta latte art in a white cup on a wooden table, surrounded by roasted coffee beans"
              width={1200}
              height={1000}
              loading="eager"
              className="aspect-[6/5] w-full rounded-[1.5rem] object-cover"
            />
          </div>

          <div className="absolute -bottom-5 -left-3 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-elevated sm:-left-6">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
              <Star className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Brewed to order</p>
              <p className="text-xs text-muted-foreground">
                Every cup, made fresh
              </p>
            </div>
          </div>

          <div className="absolute -right-2 top-6 hidden items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-subtle sm:flex">
            <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
            <span className="text-xs font-semibold">Quezon City</span>
          </div>
        </div>
      </div>
    </section>
  );
}
