import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Leaf, Users } from "lucide-react";

const VALUES = [
  {
    icon: Leaf,
    title: "Local beans",
    description: "Sourced from farmers in Benguet and Bukidnon.",
  },
  {
    icon: Heart,
    title: "Made with care",
    description: "Every cup is handcrafted by our baristas.",
  },
  {
    icon: Users,
    title: "Community first",
    description: "A cozy corner built for barkada and quiet mornings.",
  },
];

export function AboutTeaser() {
  return (
    <section
      data-ocid="home.about.section"
      className="bg-secondary/60 py-16 md:py-24"
    >
      <div className="container grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col items-start gap-6">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
            Our story
          </span>
          <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
            A neighborhood kapehan with a big heart
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Kape Corner started as a small stall with one espresso machine and a
            simple promise: serve honest coffee at a fair price. Today we still
            roast in small batches, greet regulars by name, and believe a good
            cup can turn an ordinary day around.
          </p>
          <Button
            asChild
            size="lg"
            data-ocid="home.about.learn_more_button"
            className="h-12 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground shadow-subtle transition-smooth hover:bg-primary/90 hover:shadow-elevated"
          >
            <Link to="/about">
              Read our story
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <ul className="flex flex-col gap-4">
          {VALUES.map((value) => {
            const Icon = value.icon;
            return (
              <li
                key={value.title}
                className="flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-subtle transition-smooth hover:shadow-elevated"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <h3 className="font-display text-base font-bold">
                    {value.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {value.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
