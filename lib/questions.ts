export type Question = {
  id: string;
  section: string;
  prompt: string;
  type: "text" | "longtext" | "choice";
  choices?: string[];
  hint?: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "name",
    section: "Basics",
    prompt: "What name should we use for this profile?",
    type: "text",
  },
  {
    id: "relationship_context",
    section: "Basics",
    prompt: "How long have you been together, and what does daily life look like (kids, jobs, living situation)?",
    type: "longtext",
  },

  {
    id: "attachment_closeness",
    section: "Attachment",
    prompt: "When things feel uncertain in the relationship, what do you tend to do?",
    type: "choice",
    choices: [
      "Seek closeness, want to talk it through quickly",
      "Pull back, want space to process alone",
      "Try to fix it logically before feeling it",
      "Shut down and hope it passes",
      "Mix — depends on the situation",
    ],
  },
  {
    id: "attachment_reassurance",
    section: "Attachment",
    prompt: "What does reassurance look like to you? What words or actions actually land?",
    type: "longtext",
  },

  {
    id: "love_language_primary",
    section: "Connection",
    prompt: "Which of these makes you feel most loved?",
    type: "choice",
    choices: [
      "Words — being told, specifically and often",
      "Time — undivided attention, doing things together",
      "Touch — physical closeness, hugs, hand-holding",
      "Acts — being helped without having to ask",
      "Gifts — small thoughtful things that show you were thought of",
    ],
  },
  {
    id: "love_language_secondary",
    section: "Connection",
    prompt: "Which of these is your second?",
    type: "choice",
    choices: [
      "Words",
      "Time",
      "Touch",
      "Acts",
      "Gifts",
    ],
  },
  {
    id: "love_language_hollow",
    section: "Connection",
    prompt: "Which of these feels hollow or empty if it isn't paired with the others?",
    type: "choice",
    choices: [
      "Words",
      "Time",
      "Touch",
      "Acts",
      "Gifts",
    ],
  },

  {
    id: "stress_signals",
    section: "Stress",
    prompt: "When you're stressed or overwhelmed, how does it show up on the outside? (snappy, quiet, distracted, busy, etc.)",
    type: "longtext",
  },
  {
    id: "stress_needs",
    section: "Stress",
    prompt: "When you're in that state, what do you actually need from your partner? What helps?",
    type: "longtext",
  },
  {
    id: "stress_hurts",
    section: "Stress",
    prompt: "What does NOT help — what makes it worse, even if your partner means well?",
    type: "longtext",
  },

  {
    id: "support_seen",
    section: "Support",
    prompt: "Describe a recent moment when you felt genuinely seen or supported by your partner. What did they do?",
    type: "longtext",
  },
  {
    id: "support_missed",
    section: "Support",
    prompt: "Describe a recent moment when you needed support and didn't get it. What were you hoping for?",
    type: "longtext",
  },
  {
    id: "support_invisible",
    section: "Support",
    prompt: "What makes you feel invisible or unimportant, even when nothing 'wrong' has happened?",
    type: "longtext",
  },

  {
    id: "triggers",
    section: "Triggers",
    prompt: "What words, tones, or behaviors land especially hard for you — things that hurt more than they probably should?",
    type: "longtext",
  },
  {
    id: "history_baggage",
    section: "Triggers",
    prompt: "What from your past (family, prior relationships) shapes how you react now? (Brief is fine.)",
    type: "longtext",
  },

  {
    id: "values_core",
    section: "Values",
    prompt: "What three things matter most to you in life right now?",
    type: "longtext",
  },
  {
    id: "values_relationship",
    section: "Values",
    prompt: "What do you most want this relationship to be — in five years, in twenty?",
    type: "longtext",
  },

  {
    id: "repair_style",
    section: "Repair",
    prompt: "After a fight or rupture, what helps you reconnect? What do you need first?",
    type: "longtext",
  },
  {
    id: "repair_apologies",
    section: "Repair",
    prompt: "What does a good apology from your partner sound like? What's missing from a bad one?",
    type: "longtext",
  },

  {
    id: "presence_small",
    section: "Daily Presence",
    prompt: "What small daily thing — a text, a question, a gesture — would make you feel cared for if it became routine?",
    type: "longtext",
  },
  {
    id: "presence_wishes",
    section: "Daily Presence",
    prompt: "What's one thing you wish your partner knew about you that you've never quite said out loud?",
    type: "longtext",
  },
];

export const SECTIONS = Array.from(new Set(QUESTIONS.map((q) => q.section)));
