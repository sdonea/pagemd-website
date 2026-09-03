// Shared by /faq and the home page's preview section, so the two can never
// drift. Order here is the order /faq renders.
export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is PageMD?",
    a: "PageMD is an AI paging line for outpatient clinics. It answers every inbound call instantly, collects a complete message, and pages the right provider in about sixty seconds. It replaces the operator and the hold queue, not your workflow.",
  },
  {
    q: "What happens when someone calls?",
    a: "PageMD picks up on the first ring and has a natural conversation with the caller. It captures who is calling, who they need to reach, the patient involved, and the reason for the call, then sends that as a structured page to the correct provider. The caller is finished before a person would have picked up.",
  },
  {
    q: "Does PageMD triage calls or make clinical decisions?",
    a: "No. PageMD does not assess urgency, judge severity, or make any clinical decision. It records who is calling, who they need, and why, then delivers that message. Every clinical judgment stays with your providers.",
  },
  {
    q: "Who calls into PageMD?",
    a: "The people who call your clinic all day: pharmacists verifying prescriptions, referring providers, hospitals, and nurses returning calls. PageMD answers them instead of putting them on hold or routing them through an operator.",
  },
  {
    q: "Is PageMD HIPAA compliant?",
    a: "PageMD is built with a HIPAA-conscious architecture. Calls and messages are encrypted in transit and access is limited to authorized staff. We sign a Business Associate Agreement with your clinic before any patient information is handled.",
  },
  {
    q: "How is patient information protected?",
    a: "Data is encrypted in transit, access is restricted to authorized staff, and pages route only to the provider the caller asked for. Nothing is posted, shared, or sent outside your clinic's directory.",
  },
  {
    q: "Will PageMD change how our clinic runs?",
    a: "No. PageMD sits on top of your current setup. Providers receive pages the same way they already get messages, so there is nothing new to learn and no system to replace.",
  },
  {
    q: "Does PageMD replace our staff?",
    a: "No. It takes the repetitive phone intake off your team so they stop relaying calls and get time back for patients. PageMD handles the message. Your team handles the care.",
  },
  {
    q: "What happens if PageMD can't finish a call?",
    a: "If a call falls outside what PageMD handles, it captures what it has and routes to the backup you set during onboarding, so no caller is left stranded.",
  },
  {
    q: "Can PageMD handle more than one call at once?",
    a: "Yes. PageMD runs calls in parallel, so every caller is answered at the same time. No busy signals and no hold queue, even during a rush.",
  },
  {
    q: "How does the provider receive the message?",
    a: "As a structured page with the caller, the patient, the reason for the call, and a callback number in a fixed format. Providers get everything they need to respond at a glance, without replaying a voicemail.",
  },
  {
    q: "How much does PageMD cost?",
    a: "Pricing is scoped to your practice and number of providers, and every plan includes the full feature set with no add-ons. Tell us about your clinic and we will put together pricing that fits.",
  },
  {
    q: "How do we get started?",
    a: "Request access through the site and we will set up a short call to configure PageMD for your providers and complete onboarding, including your BAA. PageMD is currently in pilot with a limited number of clinics.",
  },
];

/** The three a clinic actually stalls on, for the home-page preview. */
export const HOME_FAQ_QUESTIONS = [
  "Does PageMD triage calls or make clinical decisions?",
  "Is PageMD HIPAA compliant?",
  "Will PageMD change how our clinic runs?",
] as const;

export const homeFaqs = () =>
  HOME_FAQ_QUESTIONS.map((q) => {
    const found = FAQS.find((f) => f.q === q);
    if (!found) throw new Error(`Home FAQ preview references a missing question: ${q}`);
    return found;
  });
