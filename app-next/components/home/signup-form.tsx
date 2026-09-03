"use client";

import { useState } from "react";
import { Button } from "@usva-ui/react/primitives/button";
import { Input } from "@usva-ui/react/primitives/input";
import { Textarea } from "@usva-ui/react/primitives/textarea";
import { Callout } from "@usva-ui/react/primitives/callout";
import {
  FieldControl,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@usva-ui/react/patterns/field-group";

/* Same contract as the old page: the endpoint is external and unset until
   someone creates the form. Unset is an explicit error, never a silent
   success — a request that looks sent but is not is worse than a visible one. */
const ENDPOINT = process.env.NEXT_PUBLIC_FORM_ENDPOINT;

const SIZES = ["1–2 providers", "3–5 providers", "5+ providers"];

export function SignupForm() {
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!ENDPOINT) {
      setStatus("error");
      setError(
        "This form is not connected yet. Email team@pagemd.ai and we will pick it up from there.",
      );
      return;
    }

    setStatus("loading");
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: new FormData(event.currentTarget),
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("success");
    } catch {
      setStatus("error");
      setError(
        "Something went wrong. Please try again, or email team@pagemd.ai directly.",
      );
    }
  }

  if (status === "success") {
    return (
      <Callout tone="success" title="Request received">
        We will be in touch shortly at the address you gave us.
      </Callout>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate={false}>
      <div className="grid gap-5 sm:grid-cols-2">
        <FieldGroup id="name">
          <FieldLabel>Your name</FieldLabel>
          <FieldControl>
            <Input name="name" autoComplete="name" required />
          </FieldControl>
        </FieldGroup>

        <FieldGroup id="email">
          <FieldLabel>Email</FieldLabel>
          <FieldControl>
            <Input name="email" type="email" autoComplete="email" required />
          </FieldControl>
        </FieldGroup>

        <FieldGroup id="clinic">
          <FieldLabel>Clinic name</FieldLabel>
          <FieldControl>
            <Input name="clinic" autoComplete="organization" required />
          </FieldControl>
        </FieldGroup>

        <FieldGroup id="size">
          <FieldLabel>Clinic size</FieldLabel>
          <FieldControl>
            {/* A native select: three options, no search, and it is the control
                every phone already knows how to render. */}
            <select
              name="size"
              required
              defaultValue=""
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-ink transition-tint focus:outline-none focus-visible:shadow-[var(--usva-focus)]"
            >
              <option value="" disabled>
                Select…
              </option>
              {SIZES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </FieldControl>
        </FieldGroup>
      </div>

      <FieldGroup id="notes">
        <FieldLabel>Anything we should know?</FieldLabel>
        <FieldControl>
          <Textarea name="notes" autoGrow minRows={3} maxRows={8} />
        </FieldControl>
        <FieldDescription>Optional.</FieldDescription>
      </FieldGroup>

      {/* Form-level, so it sits with the submit button. Hanging it off the
          notes FieldGroup put a red invalid border on the one optional field
          in the form, which is the only field the failure is never about. */}
      {error && (
        <Callout tone="danger" title="Not sent" role="alert">
          {error}
        </Callout>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          variant="solid"
          size="lg"
          status={status === "loading" ? "loading" : "idle"}
          loadingText="Sending…"
          className="active:translate-y-px"
        >
          Request access
        </Button>
        <p className="text-muted text-xs">
          We&rsquo;ll only use your info to follow up about PageMD. No spam,
          ever.
        </p>
      </div>
    </form>
  );
}
