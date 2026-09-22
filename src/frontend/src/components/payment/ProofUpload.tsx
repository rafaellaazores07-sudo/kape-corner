import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalBlob } from "@caffeineai/object-storage";
import { CheckCircle2, ImageUp, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = "image/png,image/jpeg,image/webp,image/gif";

interface ProofUploadProps {
  /** Called with the uploaded blob, or null when the proof is removed. */
  onChange: (blob: ExternalBlob | null) => void;
  /** Called with the original filename, or null when the proof is removed. */
  onFilenameChange: (filename: string | null) => void;
}

export function ProofUpload({ onChange, onFilenameChange }: ProofUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setFilename(null);
    setProgress(0);
    setUploading(false);
    setError(null);
    onChange(null);
    onFilenameChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (file: File) => {
    setError(null);

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file (PNG, JPG, WEBP, or GIF).");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("That image is larger than 5 MB. Please choose a smaller file.");
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setFilename(file.name);
    setUploading(true);
    setProgress(0);

    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const blob = ExternalBlob.fromBytes(
        bytes,
        file.type,
        file.name,
      ).withUploadProgress((pct) => setProgress(Math.round(pct)));
      onChange(blob);
      onFilenameChange(file.name);
    } catch {
      setError("We couldn't prepare that image. Please try another file.");
      reset();
    } finally {
      setUploading(false);
    }
  };

  return (
    <div data-ocid="payment.proof.section" className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <span className="text-sm font-semibold text-foreground">
          Proof of payment{" "}
          <span className="font-normal text-muted-foreground">(optional)</span>
        </span>
        <span className="text-xs text-muted-foreground">
          Upload a screenshot of your GCash or Maya receipt to speed up
          verification.
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        data-ocid="payment.proof.input"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />

      {!filename ? (
        <button
          type="button"
          data-ocid="payment.proof.upload_button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border bg-secondary/40 px-6 py-8 text-center transition-smooth",
            "hover:border-accent/60 hover:bg-accent/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          )}
        >
          <span className="flex size-11 items-center justify-center rounded-full bg-card text-primary shadow-subtle">
            <ImageUp className="size-5" aria-hidden="true" />
          </span>
          <span className="text-sm font-semibold text-foreground">
            Upload receipt
          </span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG, WEBP, or GIF · up to 5 MB
          </span>
        </button>
      ) : (
        <div
          data-ocid="payment.proof.preview"
          className="flex items-center gap-4 rounded-2xl border border-border bg-card p-3 shadow-subtle"
        >
          {previewUrl && (
            <img
              src={previewUrl}
              alt={`Preview of ${filename}`}
              className="size-16 shrink-0 rounded-xl border border-border object-cover"
            />
          )}
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="truncate text-sm font-semibold text-foreground">
              {filename}
            </span>
            {uploading ? (
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
                Preparing upload… {progress}%
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                <CheckCircle2 className="size-3.5" aria-hidden="true" />
                Ready to attach
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            data-ocid="payment.proof.remove_button"
            aria-label="Remove proof of payment"
            onClick={reset}
            className="shrink-0 rounded-full text-muted-foreground transition-smooth hover:bg-destructive/10 hover:text-destructive"
          >
            <X className="size-4" aria-hidden="true" />
          </Button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          data-ocid="payment.proof.error_state"
          className="text-xs font-medium text-destructive"
        >
          {error}
        </p>
      )}
    </div>
  );
}
