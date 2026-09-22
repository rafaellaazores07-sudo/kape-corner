import { CategoryFilter } from "@/components/menu/CategoryFilter";
import { ProductCard } from "@/components/menu/ProductCard";
import { ProductCustomizer } from "@/components/menu/ProductCustomizer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useMenuView } from "@/hooks/use-menu";
import { cn } from "@/lib/utils";
import type { MenuCategory, Product } from "@/types";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Coffee, Search, SlidersHorizontal, X } from "lucide-react";
import { useMemo, useState } from "react";

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
] as const;

type SortValue = (typeof SORT_OPTIONS)[number]["value"];

/** Category artwork, matched by category name with a warm fallback. */
const CATEGORY_IMAGES: Record<string, string> = {
  "hot coffee": "/assets/generated/menu-hot-coffee.dim_800x600.jpg",
  "iced coffee": "/assets/generated/menu-iced-coffee.dim_800x600.jpg",
  "non-coffee": "/assets/generated/menu-non-coffee.dim_800x600.jpg",
  "pastries & snacks": "/assets/generated/menu-pastries.dim_800x600.jpg",
};
const FALLBACK_IMAGE = "/assets/generated/menu-hot-coffee.dim_800x600.jpg";

function imageForCategory(name: string): string {
  return CATEGORY_IMAGES[name.trim().toLowerCase()] ?? FALLBACK_IMAGE;
}

function sortProducts(products: Product[], sort: SortValue): Product[] {
  const sorted = [...products];
  switch (sort) {
    case "price-asc":
      return sorted.sort((a, b) => Number(a.price - b.price));
    case "price-desc":
      return sorted.sort((a, b) => Number(b.price - a.price));
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    default:
      return sorted;
  }
}

export function MenuPage() {
  const navigate = useNavigate();
  const search = useSearch({ from: "/menu" });
  const { data, isLoading, isError, refetch } = useMenuView();
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);

  const query = search.q ?? "";
  const category = search.category ?? "all";
  const sort = (search.sort ?? "featured") as SortValue;

  function updateSearch(patch: {
    q?: string;
    category?: string;
    sort?: SortValue;
  }) {
    void navigate({
      to: "/menu",
      search: (prev) => ({ ...prev, ...patch }),
      replace: true,
    });
  }

  const categories: MenuCategory[] = data?.categories ?? [];
  const sizes = data?.sizes ?? [];
  const addOns = data?.addOns ?? [];
  const minSurcharge = useMemo(
    () =>
      sizes.length > 0
        ? sizes.reduce(
            (min, size) => (size.surcharge < min ? size.surcharge : min),
            sizes[0].surcharge,
          )
        : 0n,
    [sizes],
  );

  const counts = useMemo(() => {
    const result: Record<string, number> = {};
    for (const item of categories) {
      result[String(item.id)] = item.products.length;
    }
    return result;
  }, [categories]);

  const visibleCategories = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return categories
      .filter((item) => category === "all" || String(item.id) === category)
      .map((item) => ({
        ...item,
        products: sortProducts(
          item.products.filter(
            (product) =>
              needle === "" ||
              product.name.toLowerCase().includes(needle) ||
              product.description.toLowerCase().includes(needle),
          ),
          sort,
        ),
      }))
      .filter((item) => item.products.length > 0);
  }, [categories, category, query, sort]);

  const totalMatches = visibleCategories.reduce(
    (sum, item) => sum + item.products.length,
    0,
  );
  const hasFilters = query.trim() !== "" || category !== "all";

  return (
    <div data-ocid="menu.page" className="bg-background">
      <section className="border-b border-border bg-gradient-warm">
        <div className="container py-12 md:py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            Kape Corner · Menu
          </p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl font-bold tracking-tight text-balance md:text-5xl">
            Brewed fresh, made your way
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground md:text-lg">
            Pick a category, customize your cup, and we&apos;ll have it ready at
            the counter. Every price is in Philippine Peso.
          </p>
        </div>
      </section>

      <section className="border-b border-border bg-card/60">
        <div className="container space-y-5 py-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                data-ocid="menu.search_input"
                value={query}
                onChange={(event) => updateSearch({ q: event.target.value })}
                placeholder="Search drinks and pastries…"
                aria-label="Search the menu"
                className="h-11 rounded-full border-border bg-background pl-10 pr-10"
              />
              {query !== "" && (
                <button
                  type="button"
                  data-ocid="menu.search_clear_button"
                  aria-label="Clear search"
                  onClick={() => updateSearch({ q: "" })}
                  className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-smooth hover:bg-secondary hover:text-foreground"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 sm:w-64">
              <SlidersHorizontal
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <Select
                value={sort}
                onValueChange={(value) =>
                  updateSearch({ sort: value as SortValue })
                }
              >
                <SelectTrigger
                  data-ocid="menu.sort_select"
                  aria-label="Sort menu items"
                  className="h-11 rounded-full border-border bg-background"
                >
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      data-ocid={`menu.sort.option.${option.value}`}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              value={category}
              onChange={(value) => updateSearch({ category: value })}
              counts={counts}
              totalCount={data?.allProducts.length ?? 0}
            />
          )}
        </div>
      </section>

      <section className="container py-10 md:py-14">
        {isLoading && <MenuSkeleton />}

        {isError && (
          <div
            data-ocid="menu.error_state"
            className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center shadow-subtle"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <Coffee className="size-6" aria-hidden="true" />
            </span>
            <h2 className="font-display text-xl font-bold">
              We couldn&apos;t load the menu
            </h2>
            <p className="text-sm text-muted-foreground">
              Something went wrong while fetching today&apos;s offerings. Please
              try again.
            </p>
            <Button
              type="button"
              data-ocid="menu.retry_button"
              onClick={() => void refetch()}
              className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Try again
            </Button>
          </div>
        )}

        {!isLoading && !isError && totalMatches === 0 && (
          <div
            data-ocid="menu.empty_state"
            className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-border bg-card p-10 text-center shadow-subtle"
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
              <Search className="size-6" aria-hidden="true" />
            </span>
            <h2 className="font-display text-xl font-bold">
              No items match your search
            </h2>
            <p className="text-sm text-muted-foreground">
              Try a different keyword or browse another category to find your
              next cup.
            </p>
            {hasFilters && (
              <Button
                type="button"
                data-ocid="menu.clear_filters_button"
                onClick={() =>
                  updateSearch({ q: "", category: "all", sort: "featured" })
                }
                className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Clear filters
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && totalMatches > 0 && (
          <div className="space-y-14">
            {visibleCategories.map((item) => (
              <div
                key={String(item.id)}
                data-ocid={`menu.category.section.${String(item.id)}`}
                className="space-y-6"
              >
                <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border pb-4">
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                      {item.name}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {item.products.length}{" "}
                      {item.products.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {item.products.map((product, index) => (
                    <ProductCard
                      key={String(product.id)}
                      product={product}
                      imageSrc={imageForCategory(item.name)}
                      minSurcharge={minSurcharge}
                      onSelect={setActiveProduct}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ProductCustomizer
        product={activeProduct}
        sizes={sizes}
        addOns={addOns}
        imageSrc={
          activeProduct
            ? imageForCategory(
                categories.find((item) => item.id === activeProduct.categoryId)
                  ?.name ?? "",
              )
            : FALLBACK_IMAGE
        }
        open={activeProduct !== null}
        onOpenChange={(open) => {
          if (!open) setActiveProduct(null);
        }}
      />
    </div>
  );
}

function MenuSkeleton() {
  const ids = Array.from({ length: 8 }, (_, i) => `menu-skeleton-${i}`);
  return (
    <div
      data-ocid="menu.loading_state"
      className={cn("space-y-14")}
      aria-busy="true"
    >
      {[0, 1].map((section) => (
        <div key={`section-${section}`} className="space-y-6">
          <Skeleton className="h-8 w-48 rounded-lg" />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {ids.slice(0, 4).map((id) => (
              <div
                key={id}
                className="overflow-hidden rounded-2xl border border-border bg-card"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="space-y-3 p-5">
                  <Skeleton className="h-5 w-3/4 rounded-md" />
                  <Skeleton className="h-4 w-full rounded-md" />
                  <Skeleton className="h-4 w-2/3 rounded-md" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
