import { cn } from "@/lib/utils";
import { PaymentMethod } from "@/types";
import { Banknote, type LucideIcon, Smartphone, Wallet } from "lucide-react";

interface MethodOption {
  value: PaymentMethod;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
}

const METHOD_OPTIONS: MethodOption[] = [
  {
    value: PaymentMethod.gcash,
    label: "GCash",
    tagline: "Send via GCash",
    description:
      "Scan the shop QR code or send to our GCash number, then enter your reference number.",
    icon: Smartphone,
  },
  {
    value: PaymentMethod.maya,
    label: "Maya",
    tagline: "Send via Maya",
    description:
      "Scan the shop QR code or send to our Maya number, then enter your reference number.",
    icon: Wallet,
  },
  {
    value: PaymentMethod.cash,
    label: "Cash",
    tagline: "Pay at the counter",
    description:
      "Pay in cash when you pick up your order. No reference number needed.",
    icon: Banknote,
  },
];

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export function PaymentMethodSelector({
  value,
  onChange,
}: PaymentMethodSelectorProps) {
  return (
    <fieldset
      data-ocid="payment.method.section"
      className="flex flex-col gap-4"
    >
      <legend className="flex flex-col gap-1">
        <span className="font-display text-xl font-bold tracking-tight">
          How would you like to pay?
        </span>
        <span className="text-sm text-muted-foreground">
          Choose one method. GCash and Maya need a reference number so we can
          match your payment.
        </span>
      </legend>

      <div className="grid gap-3 sm:grid-cols-3">
        {METHOD_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = value === option.value;
          return (
            <label
              key={option.value}
              data-ocid={`payment.method.${option.value}`}
              className={cn(
                "group relative flex cursor-pointer flex-col gap-3 rounded-2xl border bg-card p-4 shadow-subtle transition-smooth",
                "has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background",
                selected
                  ? "border-accent bg-accent/5 shadow-elevated"
                  : "border-border hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-elevated",
              )}
            >
              <input
                type="radio"
                name="payment-method"
                value={option.value}
                checked={selected}
                onChange={() => onChange(option.value)}
                data-ocid={`payment.method.${option.value}.radio`}
                className="sr-only"
              />
              <span className="flex items-center justify-between gap-2">
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-xl transition-smooth",
                    selected
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-primary",
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span
                  aria-hidden="true"
                  className={cn(
                    "flex size-5 items-center justify-center rounded-full border-2 transition-smooth",
                    selected
                      ? "border-accent bg-accent"
                      : "border-border bg-transparent",
                  )}
                >
                  {selected && (
                    <span className="size-2 rounded-full bg-accent-foreground" />
                  )}
                </span>
              </span>
              <span className="flex flex-col gap-1">
                <span className="font-display text-base font-bold leading-none">
                  {option.label}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-accent-foreground">
                  {option.tagline}
                </span>
              </span>
              <span className="text-xs leading-relaxed text-muted-foreground">
                {option.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
