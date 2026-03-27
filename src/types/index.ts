import { z } from "zod";

export const ExpenseItemSchema = z.object({
  amount: z.number(),
  category: z.string(),
  note: z.string().optional(),
  locationLabel: z.string().optional(),
});

// 1. Define the specific shape of TripIntelligence
export const TripIntelSchema = z.object({
  daysPassed: z.number(),
  daysRemaining: z.number(),
  totalDays: z.number(),
  spent: z.number(),
  remaining: z.number(),
  idealDailyBudget: z.number(),
  actualDailySpend: z.number(),
  burnRate: z.number(),
  riskLevel: z.enum(["safe", "warning", "danger"]),
});

export const InsightsRequestSchema = z.object({
  budget: z.number(),
  totalSpent: z.number(),
  locationLabel: z.string(),
  country: z.string(),
  visitPurpose: z.string(),
  tripDays: z.number(),
  tripStartDate: z.string(),
  spendingMode: z.enum(["save", "balanced", "enjoy"]),
  tripIntel: TripIntelSchema.optional(), // Now strongly typed
  expenses: z.array(ExpenseItemSchema),
});

export type InsightsRequest = z.infer<typeof InsightsRequestSchema>;

export const SuggestionSchema = z.object({
  suggestions: z.array(
    z.object({
      title: z.string(),
      description: z.string(),
      priority: z.enum(["save_now", "good_option", "watch"]),
    })
  ),
});

export interface AiSuggestion {
  id: string;
  title: string;
  description: string;
  priority: "save_now" | "good_option" | "watch";
}

export const ChatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]), // Added 'system' just in case you ever pass it directly
  content: z.string(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  budget: z.number(),
  totalSpent: z.number(),
  currency: z.string().optional().default("USD"),
  expenses: z.array(ExpenseItemSchema), // Upgraded from z.any() for better safety
  settings: z.record(z.any()).optional(),
  tripIntel: TripIntelSchema, // 2. ADDED HERE so the backend accepts the new payload
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;