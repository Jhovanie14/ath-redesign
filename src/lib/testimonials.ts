import type { ShowcaseQuote } from "@/components/auth/login-showcase";

// Real excerpts from verified student reviews in src/data/trainers.json —
// shown on the login screens as social proof. Kept in sync by hand since
// there are only a handful; if this grows, pull from the review data
// directly instead.
export const LOGIN_SHOWCASE_QUOTES: [ShowcaseQuote, ...ShowcaseQuote[]] = [
  {
    quote: "I stopped selling syringes and started planning faces.",
    attribution: "J.N. · Dr Amara Okafor",
    context: "Masterclass: Full-Face Assessment",
  },
  {
    quote: "I finished understanding the why, not just the where.",
    attribution: "P.M. · Dr Callum Frost",
    context: "Foundation: Anti-Wrinkle & Dermal Filler",
  },
  {
    quote: "She knew all our names and weak spots by the end.",
    attribution: "M.D. · Dr Priya Raman",
    context: "Foundation Programme: Tox & Filler",
  },
];
