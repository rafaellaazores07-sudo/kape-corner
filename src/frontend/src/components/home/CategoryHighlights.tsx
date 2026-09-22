import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Coffee,
  Cookie,
  CupSoda,
  type LucideIcon,
  Snowflake,
} from "lucide-react";

interface CategoryHighlight {
  name: string;
  description: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon chip background + foreground. */
  chipClass: string;
}

const CATEGORY_HIGHLIGHTS: CategoryHighlight[] = [
  {
    name: "Hot Coffee",
    description: "Espresso, americano, and silky lattes pulled fresh.",
    icon: Coffee,
    chipClass: "bg-primary/10 text-primary",
  },
  {
    name: "Iced Coffee",
    description: "Cold brew and iced lattes over crystal-clear ice.",
    icon: Snowflake,
    chipClass: "bg-accent/15 text-accent-foreground",
  },
  {
    name: "Non-Coffee",
    description: "Matcha, chocolate, and fruity refreshers for everyone.",
    icon: CupSoda,
    chipClass: "bg-success/15 text-success",
  },
  {
    name: "Pastries & Snacks",
    description: "Warm ensaymada, croissants, and light merienda bites.",
    icon: Cookie,
    chipClass: "bg-warning/20 text-warning-foreground",
  },
];

export function CategoryHighlights() {
  return (
    <section
      data-ocid="home.categories.section"
      className="bg-background py-16 md:py-24"
    >
      <div className="container flex flex-col gap-10">
        <div className="flex flex-col items-start gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            What we serve
          </span>
          <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
            Something for every kind of craving
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            From a strong morning kape to an afternoon sweet treat — pick a
            category and we'll take it from there.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORY_HIGHLIGHTS.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to="/menu"
                data-ocid="home.categories.card"
                className="group flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 shadow-subtle transition-smooth hover:-translate-y-1 hover:border-accent/50 hover:shadow-elevated"
              >
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${category.chipClass}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="font-display text-lg font-bold leading-snug">
                    {category.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                </div>
                <span className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-primary transition-smooth group-hover:gap-2.5">
                  Explore
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
