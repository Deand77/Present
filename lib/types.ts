export type Person = "you" | "partner";

export type Answer = {
  questionId: string;
  value: string;
};

export type Profile = {
  name: string;
  answers: Record<string, string>;
  updatedAt: string;
};

export type Profiles = {
  you?: Profile;
  partner?: Profile;
};

export type Protocol = {
  generatedAt: string;
  model: string;
  content: string;
};

export type DailyEntry = {
  date: string;
  prompt: string;
  reflection?: string;
};

export type AppData = {
  apiKey?: string;
  profiles: Profiles;
  protocol?: Protocol;
  daily: DailyEntry[];
};
