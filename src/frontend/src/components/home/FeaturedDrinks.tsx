import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuView } from "@/hooks/use-menu";
import { storedFileBlob } from "@/lib/backend";
import { formatPeso } from "@/lib/format";
import type { Product } from "@/types";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Coffee } from "lucide-react";
import { useMemo, useState } from "react";

const FEATURED_LIMIT = 3;
const SKELETON_IDS = Array.from(
  { length: FEATURED_LIMIT },
  (_, index) => `featured-skeleton-${index}`,
);

/** Resolve a stored product image to a browser-displayable URL. */
function useStoredImageUrl(product: Product): string | null {
  const image = product.image;
  return useMemo(() => {
    if (!image) return null;
    return storedFileBlob(image).getDirectURL();
  }, [image]);
}

function FeaturedCard({ product }: { product: Product }) {
  const imageUrl = useStoredImageUrl(product);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = !!imageUrl && !imageFailed;

  return (
    <article
      data-ocid="home.featured.card"
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-subtle transition-smooth hover:-translate-y-1 hover:shadow-elevated"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary">
        {showImage ? (
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-smooth group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-warm">
            <Coffee className="h-12 w-12 text-primary/40" aria-hidden="true" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-wider text-accent-foreground shadow-subtle">
          Best seller
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-lg font-bold leading-snug">
          {product.name}
        </h3>
        <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
          {product.description}
        </p>
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="font-display text-xl font-bold text-primary">
            {formatPeso(product.price)}
          </span>
          <Button
            asChild
            size="sm"
            data-ocid="home.featured.order_button"
            className="rounded-full bg-accent px-4 font-semibold text-accent-foreground transition-smooth hover:bg-accent/90"
          >
            <Link to="/menu">Order</Link>
          </Button>
        </div>
      </div>
    </article>
  );
}

export function FeaturedDrinks() {
  const { data, isLoading, isError } = useMenuView();

  const featured = (data?.allProducts ?? [])
    .filter((product) => product.available)
    .slice(0, FEATURED_LIMIT);

  return (
    <section
      data-ocid="home.featured.section"
      className="bg-secondary/60 py-16 md:py-24"
    >
      <div className="container flex flex-col gap-10">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div className="flex flex-col gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-foreground">
              Featured brews
            </span>
            <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
              The cups our regulars keep coming back for
            </h2>
          </div>
          <Button
            asChild
            variant="ghost"
            data-ocid="home.featured.view_menu_link"
            className="rounded-full font-semibold text-primary transition-smooth hover:bg-primary/5"
          >
            <Link to="/menu">
              View full menu
              <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>

        {isLoading && (
          <div
            data-ocid="home.featured.loading_state"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {SKELETON_IDS.map((id) => (
              <div
                key={id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="flex flex-col gap-3 p-5">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="mt-2 h-9 w-28 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div
            data-ocid="home.featured.error_state"
            className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card px-6 py-12 text-center"
          >
            <Coffee
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="font-display text-lg font-bold">
              We couldn't load today's picks
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              The menu is taking a quick break. Browse the full menu to see
              everything we're brewing.
            </p>
            <Button
              asChild
              className="mt-1 rounded-full bg-accent font-semibold text-accent-foreground transition-smooth hover:bg-accent/90"
            >
              <Link to="/menu">Browse the menu</Link>
            </Button>
          </div>
        )}

        {!isLoading && !isError && featured.length === 0 && (
          <div
            data-ocid="home.featured.empty_state"
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center"
          >
            <Coffee
              className="h-8 w-8 text-muted-foreground"
              aria-hidden="true"
            />
            <p className="font-display text-lg font-bold">
              Our featured brews are brewing
            </p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Check the full menu for everything available right now.
            </p>
            <Button
              asChild
              className="mt-1 rounded-full bg-accent font-semibold text-accent-foreground transition-smooth hover:bg-accent/90"
            >
              <Link to="/menu">Browse the menu</Link>
            </Button>
          </div>
        )}

        {!isLoading && !isError && featured.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((product) => (
              <FeaturedCard key={String(product.id)} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
