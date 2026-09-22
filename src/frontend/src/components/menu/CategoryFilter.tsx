import { cn } from "@/lib/utils";
import type { MenuCategory } from "@/types";

interface CategoryFilterProps {
  categories: MenuCategory[];
  /** Currently selected category id, or "all". */
  value: string;
  onChange: (value: string) => void;
  /** Product counts keyed by category id, for the pill badges. */
  counts: Record<string, number>;
  totalCount: number;
}

export function CategoryFilter({
  categories,
  value,
  onChange,
  counts,
  totalCount,
}: CategoryFilterProps) {
  const options = [
    { id: "all", name: "All items", count: totalCount },
    ...categories.map((category) => ({
      id: String(category.id),
      name: category.name,
      count: counts[String(category.id)] ?? 0,
    })),
  ];

  return (
    <fieldset
      data-ocid="menu.category_filter"
      aria-label="Filter menu by category"
      className="-mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0"
    >
      {options.map((option) => {
        const active = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            data-ocid={`menu.category.tab.${option.id}`}
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className={cn(
              "flex shrink-0 snap-start items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              active
                ? "border-primary bg-primary text-primary-foreground shadow-subtle"
                : "border-border bg-card text-muted-foreground hover:border-accent/60 hover:text-foreground",
            )}
          >
            <span>{option.name}</span>
            <span
              className={cn(
                "rounded-full px-1.5 text-[0.6875rem] font-bold leading-5",
                active
                  ? "bg-primary-foreground/20 text-primary-foreground"
                  : "bg-secondary text-secondary-foreground",
              )}
            >
              {option.count}
            </span>
          </button>
        );
      })}
    </fieldset>
  );
}
