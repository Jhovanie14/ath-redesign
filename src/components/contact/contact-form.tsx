"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { VerifiedSeal } from "@/components/verified-seal";

const FIELD =
  "h-11 w-full rounded-xl border border-linen bg-paper px-3.5 text-small text-ink placeholder:text-stone focus:outline-none focus-visible:border-stone";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const TOPICS = [
  "General question",
  "Student support",
  "Trainer / listing support",
  "Partnerships & press",
  "Something else",
];

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [topic, setTopic] = useState(TOPICS[0]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Add your name so we know who's asking.";
    if (!EMAIL_RE.test(email)) next.email = "Enter an email we can reply to.";
    if (!message.trim()) next.message = "Add a short message about what you're after.";
    setErrors(next);
    if (Object.keys(next).length === 0) setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="rounded-card border border-linen bg-paper p-8 text-center sm:p-12">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h2 className="mt-5 font-display text-title text-ink">
          Message sent
        </h2>
        <p className="mx-auto mt-2 max-w-sm text-small leading-relaxed text-ink-soft">
          Thanks, {name.split(" ")[0]}
          {" "}
          — we&rsquo;ve got your message and typically reply within one
          working day.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-card border border-linen bg-paper p-8 sm:p-12"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="eyebrow mb-2 block">
            Your name
          </label>
          <input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD}
            placeholder="Jordan Ellis"
            aria-invalid={Boolean(errors.name)}
          />
          {errors.name && (
            <p className="mt-1.5 text-micro text-error">{errors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="contact-email" className="eyebrow mb-2 block">
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={FIELD}
            placeholder="you@email.com"
            aria-invalid={Boolean(errors.email)}
          />
          {errors.email && (
            <p className="mt-1.5 text-micro text-error">{errors.email}</p>
          )}
        </div>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-topic" className="eyebrow mb-2 block">
          What&rsquo;s this about?
        </label>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger id="contact-topic" className="rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TOPICS.map((t) => (
              <SelectItem key={t} value={t}>
                {t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mt-5">
        <label htmlFor="contact-message" className="eyebrow mb-2 block">
          Message
        </label>
        <textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className={`${FIELD} h-auto resize-none py-2.5`}
          placeholder="Tell us what's on your mind…"
          aria-invalid={Boolean(errors.message)}
        />
        {errors.message && (
          <p className="mt-1.5 text-micro text-error">{errors.message}</p>
        )}
      </div>

      <p className="mt-5 flex items-start gap-2 text-micro leading-relaxed text-stone">
        <span className="mt-0.5">
          <VerifiedSeal size={16} />
        </span>
        Your message goes straight to the Hub team — no automated ticketing,
        just a person reading it.
      </p>

      <Button type="submit" size="lg" className="mt-6 w-full sm:w-auto">
        Send message
      </Button>
    </form>
  );
}
