// No priority / urgency field, deliberately: the FAQ states PageMD does not
// assess urgency or judge severity, so a captured Priority would contradict it.
export type Capture = Record<string, string>;

export interface Turn {
  speaker: "ai" | "caller";
  text: string;
  capture?: Capture;
}

export interface Scenario {
  id: ScenarioId;
  label: string;
  turns: Turn[];
}

export type ScenarioId = "nurse" | "physician" | "pharmacist";

const GREETING =
  "PageMD paging for Riverside Family Medicine. This call is handled by an AI assistant and is recorded. Who am I speaking with?";

export const SCENARIOS: Record<ScenarioId, Scenario> = {
  nurse: {
    id: "nurse",
    label: "Nurse callback",
    turns: [
      { speaker: "ai", text: GREETING },
      { speaker: "caller", text: "This is Maria Lopez, I'm a nurse at Deaconess Midtown." },
      { speaker: "ai", text: "Thanks, Maria. Who are you trying to reach?", capture: { Caller: "Maria Lopez  ·  Nurse, Deaconess Midtown" } },
      { speaker: "caller", text: "Dr. Patel." },
      { speaker: "ai", text: "Got it. Which patient is this regarding?", capture: { For: "Dr. Patel" } },
      { speaker: "caller", text: "James Carter." },
      { speaker: "ai", text: "And what would you like me to pass along to Dr. Patel?", capture: { Patient: "James Carter" } },
      { speaker: "caller", text: "Post-op day two, his incision site is draining and he's running a temp of 101.4. Wound care wants direction before the next dressing change." },
      { speaker: "ai", text: "Understood. What's the best callback number?", capture: { Message: "Post-op day 2, incision site draining, temp 101.4. Wound care requesting direction before next dressing change." } },
      { speaker: "caller", text: "Just use the number I'm calling from." },
      { speaker: "ai", text: "Let me read that back: Maria Lopez, nurse at Deaconess Midtown, regarding patient James Carter, for Dr. Patel. Post-op day two, incision site draining, temp 101.4, wound care wants direction before the next dressing change. Is that correct?", capture: { "Call Back": "812-555-0143" } },
      { speaker: "caller", text: "Yes." },
      { speaker: "ai", text: "Sending to Dr. Patel now. You can hang up.", capture: { "Routed to": "Dr. Patel" } },
    ],
  },
  physician: {
    id: "physician",
    label: "Physician-to-physician",
    turns: [
      { speaker: "ai", text: GREETING },
      { speaker: "caller", text: "Dr. Alan Reyes, cardiology at St. Vincent." },
      { speaker: "ai", text: "Thanks, Dr. Reyes. Who are you trying to reach?", capture: { Caller: "Dr. Alan Reyes  ·  Physician, Cardiology, St. Vincent" } },
      { speaker: "caller", text: "Dr. Nguyen." },
      { speaker: "ai", text: "Which patient is this regarding?", capture: { For: "Dr. Nguyen" } },
      { speaker: "caller", text: "Susan Whitfield." },
      { speaker: "ai", text: "What would you like me to pass along to Dr. Nguyen?", capture: { Patient: "Susan Whitfield" } },
      { speaker: "caller", text: "I saw her for the consult this morning. Echo shows reduced EF, I'm starting her on a beta blocker and want to coordinate before her follow-up next week. Full note is in the chart." },
      { speaker: "ai", text: "Understood. What's the best callback number?", capture: { Message: "Consult completed this AM. Echo shows reduced EF. Starting beta blocker. Wants to coordinate before follow-up next week. Full note in chart." } },
      { speaker: "caller", text: "My direct line, same one I'm on now." },
      { speaker: "ai", text: "Reading back: Dr. Alan Reyes, cardiology at St. Vincent, regarding patient Susan Whitfield, for Dr. Nguyen. Saw her for consult this morning, echo shows reduced EF, starting a beta blocker, wants to coordinate before follow-up next week, full note in the chart. Correct?", capture: { "Call Back": "812-555-0288" } },
      { speaker: "caller", text: "That's it." },
      { speaker: "ai", text: "Sending to Dr. Nguyen now. You can hang up.", capture: { "Routed to": "Dr. Nguyen" } },
    ],
  },
  pharmacist: {
    id: "pharmacist",
    label: "Pharmacist verification",
    turns: [
      { speaker: "ai", text: GREETING },
      { speaker: "caller", text: "Hi, this is Dana Kim, pharmacist at Walgreens on Green River Road." },
      { speaker: "ai", text: "Thanks, Dana. Who are you trying to reach?", capture: { Caller: "Dana Kim  ·  Pharmacist, Walgreens Green River Rd" } },
      { speaker: "caller", text: "Whoever's covering for Dr. Ellis." },
      { speaker: "ai", text: "Got it, I'll route that to the covering provider. Which patient is this regarding?", capture: { For: "Covering for Dr. Ellis" } },
      { speaker: "caller", text: "Robert Hayes." },
      { speaker: "ai", text: "What would you like me to pass along?", capture: { Patient: "Robert Hayes" } },
      { speaker: "caller", text: "The metformin script came through at 1000 milligrams twice daily, but his chart lists an eGFR that doesn't match that dose. I need confirmation or a revised script before I fill it." },
      { speaker: "ai", text: "Understood. What's the best callback number?", capture: { Message: "Metformin script received at 1000mg BID. Chart eGFR does not match dose. Requesting confirmation or revised script before filling." } },
      { speaker: "caller", text: "The pharmacy line, we're open until nine." },
      { speaker: "ai", text: "Reading back: Dana Kim, pharmacist at Walgreens on Green River Road, regarding patient Robert Hayes, for the provider covering Dr. Ellis. Metformin script came through at 1000mg twice daily, chart eGFR doesn't match that dose, needs confirmation or a revised script before filling, pharmacy open until nine. Correct?", capture: { "Call Back": "812-555-0371  ·  Pharmacy, open until 9pm" } },
      { speaker: "caller", text: "Yep." },
      { speaker: "ai", text: "Sending now. You can hang up.", capture: { "Routed to": "Covering provider" } },
    ],
  },
};

export const SCENARIO_ORDER: ScenarioId[] = ["nurse", "physician", "pharmacist"];

export const audioPath = (id: ScenarioId, index: number, speaker: Turn["speaker"]) =>
  `/audio/${id}/${String(index).padStart(2, "0")}_${speaker}.mp3`;
