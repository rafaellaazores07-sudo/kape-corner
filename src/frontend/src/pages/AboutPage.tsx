import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coffee,
  Heart,
  Leaf,
  MapPin,
  Sparkles,
  Users,
} from "lucide-react";

const STORY_IMAGE = "/assets/generated/hero-latte.jpg";

const VALUES = [
  {
    Icon: Leaf,
    title: "Local beans, fair prices",
    body: "We buy directly from smallholder farms in Benguet, Sagada, and Bukidnon — paying above market so our growers can keep planting.",
  },
  {
    Icon: Coffee,
    title: "Roasted in small batches",
    body: "Every batch is roasted weekly in our Quezon City kitchen, so the beans behind your barista are never more than a few days old.",
  },
  {
    Icon: Heart,
    title: "Made for the neighborhood",
    body: "Students, remote workers, and lolo-and-lola regulars all share the same tables here. Everyone gets a warm cup and a seat.",
  },
];

const MILESTONES = [
  {
    year: "2016",
    title: "A cart and a dream",
    body: "Kape Corner started as a weekend brew cart outside a Quezon City dorm, serving 40 cups a day.",
  },
  {
    year: "2019",
    title: "Our first corner",
    body: "We opened the Katipunan shop — twelve seats, one espresso machine, and a very patient regular crowd.",
  },
  {
    year: "2022",
    title: "Roasting our own",
    body: "We brought roasting in-house and began sourcing single-origin beans straight from Cordillera farmers.",
  },
  {
    year: "Today",
    title: "Still brewing daily",
    body: "Three branches, a loyal neighborhood, and the same promise: good coffee, made with care.",
  },
];

const STATS = [
  { value: "3", label: "Branches in Metro Manila" },
  { value: "12", label: "Partner coffee farms" },
  { value: "9 yrs", label: "Serving the neighborhood" },
];

export function AboutPage() {
  return (
    <div data-ocid="about.page" className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-warm">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent/20 blur-3xl"
        />
        <div className="container relative grid items-center gap-12 py-16 md:py-20 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col items-start gap-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-accent/40 bg-card/70 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Our Story
            </span>
            <h1 className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl">
              Your corner for
              <span className="block text-primary">good coffee.</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg">
              Kape Corner is a family-run coffee shop in Quezon City. We roast
              Philippine-grown beans in small batches, pull every shot to order,
              and serve it all in a space that feels like your lola&rsquo;s
              kitchen — only with better espresso.
            </p>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                data-ocid="about.hero.menu_button"
                className="h-12 rounded-full bg-accent px-7 text-base font-semibold text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
              >
                <Link to="/menu">
                  Browse the menu
                  <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                data-ocid="about.hero.contact_button"
                className="h-12 rounded-full border-primary/30 bg-transparent px-7 text-base font-semibold text-primary transition-smooth hover:bg-primary/5"
              >
                <Link to="/contact">Visit us</Link>
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="relative -rotate-2 rounded-[2rem] border border-border bg-card p-3 shadow-elevated transition-smooth hover:rotate-0">
              <img
                src={STORY_IMAGE}
                alt="A freshly poured latte with rosetta latte art in a white cup on a warm wooden table"
                width={1200}
                height={1000}
                loading="eager"
                className="aspect-[6/5] w-full rounded-[1.5rem] object-cover"
              />
            </div>
            <div className="absolute -bottom-5 -right-3 flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-elevated sm:-right-6">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
                <MapPin className="h-5 w-5" aria-hidden="true" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold">Katipunan, QC</p>
                <p className="text-xs text-muted-foreground">
                  Brewing since 2016
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        data-ocid="about.story.section"
        className="border-y border-border bg-background"
      >
        <div className="container grid gap-10 py-16 md:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="space-y-5">
            <h2 className="font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
              From a weekend brew cart to your daily kape
            </h2>
            <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>
                It began with a secondhand espresso machine and a folding table
                outside a dormitory in Loyola Heights. We sold forty cups on our
                first Saturday — mostly to friends who were too polite to say
                no. But the line kept growing, and so did the little community
                around it.
              </p>
              <p>
                Nearly a decade later, the recipe hasn&rsquo;t changed. We still
                greet regulars by name, still grind to order, and still believe
                that a good cup of coffee should be something everyone in the
                barangay can afford. What changed is the reach: today our beans
                travel from Cordillera farms to three cozy corners across Metro
                Manila.
              </p>
              <p>
                Whether you&rsquo;re cramming for an exam, catching up with
                friends, or just need five quiet minutes — there&rsquo;s a seat
                and a warm cup waiting for you here.
              </p>
            </div>
          </div>

          <dl className="grid grid-cols-1 gap-4 self-start rounded-3xl border border-border bg-card p-6 shadow-subtle sm:grid-cols-3 lg:grid-cols-1">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="flex flex-col gap-1 border-b border-border pb-4 last:border-b-0 last:pb-0 sm:border-b-0 sm:pb-0 lg:border-b lg:pb-4 lg:last:border-b-0 lg:last:pb-0"
              >
                <dd className="font-display text-3xl font-bold text-primary">
                  {stat.value}
                </dd>
                <dt className="text-sm leading-snug text-muted-foreground">
                  {stat.label}
                </dt>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section data-ocid="about.values.section" className="bg-secondary/40">
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
              What we stand for
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Coffee with a conscience
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Three simple promises guide everything we brew, roast, and serve.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {VALUES.map(({ Icon, title, body }) => (
              <article
                key={title}
                className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-1 hover:shadow-elevated"
              >
                <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent-foreground">
                  <Icon className="size-6" aria-hidden="true" />
                </span>
                <h3 className="font-display text-xl font-bold tracking-tight">
                  {title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section
        data-ocid="about.timeline.section"
        className="border-t border-border bg-background"
      >
        <div className="container py-16 md:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
              Our journey
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
              A few cups along the way
            </h2>
          </div>

          <ol className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {MILESTONES.map((milestone) => (
              <li
                key={milestone.year}
                className="relative flex flex-col gap-3 rounded-3xl border border-border bg-card p-6 shadow-subtle"
              >
                <span className="inline-flex w-fit items-center rounded-full bg-primary px-3 py-1 font-display text-sm font-bold text-primary-foreground">
                  {milestone.year}
                </span>
                <h3 className="font-display text-lg font-bold tracking-tight">
                  {milestone.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {milestone.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section
        data-ocid="about.cta.section"
        className="bg-gradient-primary text-primary-foreground"
      >
        <div className="container flex flex-col items-center gap-6 py-16 text-center md:py-20">
          <span className="flex size-14 items-center justify-center rounded-full bg-primary-foreground/10">
            <Users className="size-7" aria-hidden="true" />
          </span>
          <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Come sit with us — the kettle&rsquo;s always on
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-primary-foreground/80">
            Drop by any of our branches, or order ahead and we&rsquo;ll have
            your cup ready when you arrive.
          </p>
          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              asChild
              size="lg"
              data-ocid="about.cta.order_button"
              className="h-12 rounded-full bg-accent px-7 text-base font-semibold text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
            >
              <Link to="/menu">Order now</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              data-ocid="about.cta.contact_button"
              className="h-12 rounded-full border-primary-foreground/40 bg-transparent px-7 text-base font-semibold text-primary-foreground transition-smooth hover:bg-primary-foreground/10 hover:text-primary-foreground"
            >
              <Link to="/contact">Get in touch</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
