import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CheckCircle2, Send } from "lucide-react";
import { type FormEvent, useState } from "react";

interface ContactDraft {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

type ContactErrors = Partial<Record<keyof ContactDraft, string>>;

const EMPTY_DRAFT: ContactDraft = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(draft: ContactDraft): ContactErrors {
  const errors: ContactErrors = {};

  if (!draft.name.trim()) {
    errors.name = "Please tell us your name.";
  }

  if (!draft.email.trim()) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_PATTERN.test(draft.email.trim())) {
    errors.email = "Please enter a valid email address.";
  }

  if (!draft.subject.trim()) {
    errors.subject = "Please choose a subject for your message.";
  }

  if (!draft.message.trim()) {
    errors.message = "Please write a short message.";
  } else if (draft.message.trim().length < 10) {
    errors.message = "Your message should be at least 10 characters.";
  }

  return errors;
}

export function ContactForm() {
  const [draft, setDraft] = useState<ContactDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<ContactErrors>({});
  const [submitted, setSubmitted] = useState(false);

  function updateField<K extends keyof ContactDraft>(
    field: K,
    value: ContactDraft[K],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate(draft);

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setSubmitted(false);
      return;
    }

    setErrors({});
    setDraft(EMPTY_DRAFT);
    setSubmitted(true);
  }

  function handleReset() {
    setDraft(EMPTY_DRAFT);
    setErrors({});
    setSubmitted(false);
  }

  const fieldClass = (field: keyof ContactDraft) =>
    cn(
      "h-11 rounded-xl border-input bg-card text-base transition-smooth focus-visible:border-ring",
      errors[field] && "border-destructive focus-visible:border-destructive",
    );

  return (
    <div
      data-ocid="contact.form.panel"
      className="rounded-3xl border border-border bg-card p-6 shadow-subtle sm:p-8"
    >
      <div className="mb-6 space-y-2">
        <h2 className="font-display text-2xl font-bold tracking-tight">
          Send us a message
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Questions about catering, bulk orders, or a lost umbrella? Drop us a
          note and we&rsquo;ll get back to you within one business day.
        </p>
      </div>

      {submitted && (
        <output
          data-ocid="contact.form.success_state"
          className="mb-6 flex items-start gap-3 rounded-2xl border border-success/40 bg-success/10 p-4"
        >
          <CheckCircle2
            className="mt-0.5 size-5 shrink-0 text-success"
            aria-hidden="true"
          />
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Salamat! Your message is on its way.
            </p>
            <p className="text-sm text-muted-foreground">
              We&rsquo;ve received your note and will reply to your email
              shortly.
            </p>
          </div>
        </output>
      )}

      <form
        noValidate
        onSubmit={handleSubmit}
        data-ocid="contact.form"
        className="space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-name">
              Full name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-name"
              name="name"
              data-ocid="contact.form.name_input"
              autoComplete="name"
              placeholder="Juan Dela Cruz"
              value={draft.name}
              onChange={(event) => updateField("name", event.target.value)}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              className={fieldClass("name")}
            />
            {errors.name && (
              <p
                id="contact-name-error"
                data-ocid="contact.form.name_error"
                className="text-sm font-medium text-destructive"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">
              Email address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-email"
              name="email"
              type="email"
              data-ocid="contact.form.email_input"
              autoComplete="email"
              placeholder="juan@email.com"
              value={draft.email}
              onChange={(event) => updateField("email", event.target.value)}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={
                errors.email ? "contact-email-error" : undefined
              }
              className={fieldClass("email")}
            />
            {errors.email && (
              <p
                id="contact-email-error"
                data-ocid="contact.form.email_error"
                className="text-sm font-medium text-destructive"
              >
                {errors.email}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="contact-phone">Mobile number</Label>
            <Input
              id="contact-phone"
              name="phone"
              type="tel"
              data-ocid="contact.form.phone_input"
              autoComplete="tel"
              placeholder="+63 917 000 0000"
              value={draft.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              className={fieldClass("phone")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-subject">
              Subject <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contact-subject"
              name="subject"
              data-ocid="contact.form.subject_input"
              placeholder="Catering inquiry"
              value={draft.subject}
              onChange={(event) => updateField("subject", event.target.value)}
              aria-invalid={Boolean(errors.subject)}
              aria-describedby={
                errors.subject ? "contact-subject-error" : undefined
              }
              className={fieldClass("subject")}
            />
            {errors.subject && (
              <p
                id="contact-subject-error"
                data-ocid="contact.form.subject_error"
                className="text-sm font-medium text-destructive"
              >
                {errors.subject}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact-message">
            Message <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="contact-message"
            name="message"
            data-ocid="contact.form.message_textarea"
            rows={5}
            placeholder="Tell us how we can help…"
            value={draft.message}
            onChange={(event) => updateField("message", event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message ? "contact-message-error" : undefined
            }
            className={cn(
              "min-h-32 rounded-xl border-input bg-card text-base transition-smooth focus-visible:border-ring",
              errors.message &&
                "border-destructive focus-visible:border-destructive",
            )}
          />
          {errors.message && (
            <p
              id="contact-message-error"
              data-ocid="contact.form.message_error"
              className="text-sm font-medium text-destructive"
            >
              {errors.message}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button
            type="submit"
            size="lg"
            data-ocid="contact.form.submit_button"
            className="h-12 rounded-full bg-accent px-7 text-base font-semibold text-accent-foreground shadow-subtle transition-smooth hover:bg-accent/90 hover:shadow-elevated"
          >
            <Send className="size-4" aria-hidden="true" />
            Send message
          </Button>
          <Button
            type="button"
            size="lg"
            variant="outline"
            data-ocid="contact.form.reset_button"
            onClick={handleReset}
            className="h-12 rounded-full border-border px-7 text-base font-semibold transition-smooth hover:bg-secondary"
          >
            Clear form
          </Button>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          Fields marked with <span className="text-destructive">*</span> are
          required. We only use your details to reply to your message.
        </p>
      </form>
    </div>
  );
}
