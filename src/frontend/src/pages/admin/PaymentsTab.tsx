import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { usePaymentSettings } from "@/hooks/use-menu";
import { useOrders, useUpdatePaymentSettings } from "@/hooks/use-orders";
import { storedFileBlob, storedFileFromFile } from "@/lib/backend";
import { formatDateTime, formatPeso, humanize } from "@/lib/format";
import { cn } from "@/lib/utils";
import { PaymentMethod, type PaymentSettingsInput } from "@/types";
import { ImagePlus, Loader2, QrCode, Save, Wallet, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface QrDraft {
  file: File | null;
  preview: string | null;
}

const EMPTY_QR: QrDraft = { file: null, preview: null };

function QrUploader({
  label,
  ocidPrefix,
  draft,
  existingUrl,
  onPick,
  onClear,
}: {
  label: string;
  ocidPrefix: string;
  draft: QrDraft;
  existingUrl?: string;
  onPick: (file: File) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const preview = draft.preview ?? existingUrl ?? null;

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex size-28 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {preview ? (
            <img
              src={preview}
              alt={`${label} preview`}
              className="size-full object-contain"
            />
          ) : (
            <QrCode
              className="size-7 text-muted-foreground"
              aria-hidden="true"
            />
          )}
        </div>
        <div className="flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPick(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            data-ocid={`${ocidPrefix}.upload_button`}
            onClick={() => inputRef.current?.click()}
            className="rounded-full border-border transition-smooth hover:bg-secondary"
          >
            <ImagePlus className="size-4" aria-hidden="true" />
            {preview ? "Replace QR" : "Upload QR"}
          </Button>
          {preview && (
            <Button
              type="button"
              variant="ghost"
              data-ocid={`${ocidPrefix}.remove_button`}
              onClick={() => {
                onClear();
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="rounded-full text-muted-foreground hover:text-destructive"
            >
              <X className="size-4" aria-hidden="true" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export function PaymentsTab() {
  const settingsQuery = usePaymentSettings();
  const updateSettings = useUpdatePaymentSettings();
  const ordersQuery = useOrders({});

  const [gcashNumber, setGcashNumber] = useState("");
  const [mayaNumber, setMayaNumber] = useState("");
  const [gcashQr, setGcashQr] = useState<QrDraft>(EMPTY_QR);
  const [mayaQr, setMayaQr] = useState<QrDraft>(EMPTY_QR);
  const [saved, setSaved] = useState(false);

  const settings = settingsQuery.data;

  // Seed the draft once the settings arrive; the user owns it afterwards.
  useEffect(() => {
    if (!settings) return;
    setGcashNumber(settings.gcashNumber);
    setMayaNumber(settings.mayaNumber);
  }, [settings]);

  const handleSave = async () => {
    const buildQr = async (
      draft: QrDraft,
      existing: PaymentSettingsInput["gcashQr"],
    ) => {
      if (draft.file) {
        return storedFileFromFile(draft.file);
      }
      return existing;
    };

    const input: PaymentSettingsInput = {
      gcashNumber: gcashNumber.trim(),
      mayaNumber: mayaNumber.trim(),
      gcashQr: await buildQr(gcashQr, settings?.gcashQr),
      mayaQr: await buildQr(mayaQr, settings?.mayaQr),
    };

    updateSettings.mutate(input, {
      onSuccess: () => {
        setGcashQr(EMPTY_QR);
        setMayaQr(EMPTY_QR);
        setSaved(true);
      },
    });
  };

  const digitalOrders = (ordersQuery.data ?? []).filter(
    (order) =>
      order.paymentMethod === PaymentMethod.gcash ||
      order.paymentMethod === PaymentMethod.maya,
  );

  if (settingsQuery.isLoading) {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-96 rounded-2xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card className="rounded-2xl border-border bg-card shadow-subtle">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <Wallet className="size-5 text-accent" aria-hidden="true" />
            Payment settings
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            These details are shown to customers at checkout. Update them
            whenever your wallet numbers change.
          </p>
        </CardHeader>
        <CardContent className="space-y-6 p-5">
          <div className="grid gap-2">
            <Label htmlFor="gcash-number">GCash number</Label>
            <Input
              id="gcash-number"
              data-ocid="admin.payments.gcash_input"
              value={gcashNumber}
              onChange={(event) => {
                setGcashNumber(event.target.value);
                setSaved(false);
              }}
              placeholder="0917 555 0142"
              inputMode="tel"
              className="rounded-xl border-input bg-background"
            />
          </div>

          <QrUploader
            label="GCash QR code"
            ocidPrefix="admin.payments.gcash_qr"
            draft={gcashQr}
            existingUrl={
              settings?.gcashQr
                ? storedFileBlob(settings.gcashQr).getDirectURL()
                : undefined
            }
            onPick={(file) => {
              setGcashQr({ file, preview: URL.createObjectURL(file) });
              setSaved(false);
            }}
            onClear={() => {
              setGcashQr(EMPTY_QR);
              setSaved(false);
            }}
          />

          <div className="grid gap-2">
            <Label htmlFor="maya-number">Maya number</Label>
            <Input
              id="maya-number"
              data-ocid="admin.payments.maya_input"
              value={mayaNumber}
              onChange={(event) => {
                setMayaNumber(event.target.value);
                setSaved(false);
              }}
              placeholder="0917 555 0142"
              inputMode="tel"
              className="rounded-xl border-input bg-background"
            />
          </div>

          <QrUploader
            label="Maya QR code"
            ocidPrefix="admin.payments.maya_qr"
            draft={mayaQr}
            existingUrl={
              settings?.mayaQr
                ? storedFileBlob(settings.mayaQr).getDirectURL()
                : undefined
            }
            onPick={(file) => {
              setMayaQr({ file, preview: URL.createObjectURL(file) });
              setSaved(false);
            }}
            onClear={() => {
              setMayaQr(EMPTY_QR);
              setSaved(false);
            }}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              data-ocid="admin.payments.save_button"
              disabled={updateSettings.isPending}
              onClick={() => void handleSave()}
              className="rounded-full bg-accent text-accent-foreground transition-smooth hover:bg-accent/90"
            >
              {updateSettings.isPending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              Save payment settings
            </Button>
            {saved && (
              <p
                data-ocid="admin.payments.success_state"
                className="text-sm text-success"
              >
                Payment settings saved.
              </p>
            )}
            {updateSettings.isError && (
              <p
                data-ocid="admin.payments.error_state"
                className="text-sm text-destructive"
              >
                We couldn't save your settings. Try again.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-card shadow-subtle">
        <CardHeader className="border-b border-border">
          <CardTitle className="font-display text-lg font-bold tracking-tight">
            Digital payment references
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Reference numbers and proofs uploaded by customers paying via GCash
            or Maya.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {ordersQuery.isLoading ? (
            <div className="space-y-3 p-5">
              {Array.from(
                { length: 4 },
                (_, i) => `payments-skeleton-${i}`,
              ).map((id) => (
                <Skeleton key={id} className="h-14 rounded-xl" />
              ))}
            </div>
          ) : digitalOrders.length === 0 ? (
            <p
              data-ocid="admin.payments.empty_state"
              className="p-6 text-sm text-muted-foreground"
            >
              No GCash or Maya orders yet. References will appear here once
              customers pay online.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {digitalOrders.map((order, index) => (
                <li
                  key={order.orderNumber}
                  data-ocid={`admin.payments.reference.item.${index + 1}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-mono text-sm font-semibold text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {order.customerName} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "rounded-full text-[0.6875rem] font-semibold uppercase tracking-wider",
                        order.paymentMethod === PaymentMethod.gcash
                          ? "border-transparent bg-primary/10 text-primary"
                          : "border-transparent bg-accent/15 text-accent",
                      )}
                    >
                      {order.paymentMethod === PaymentMethod.gcash
                        ? "GCash"
                        : "Maya"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {humanize(order.status)}
                    </span>
                    <span className="font-display text-base font-bold text-accent">
                      {formatPeso(order.total)}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
