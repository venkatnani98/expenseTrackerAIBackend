import { z } from "zod";

export const ExpenseItemSchema = z.object({
  amount: z.number(),
  category: z.string(),
  note: z.string().optional(),
  locationLabel: z.string().optional(),
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
  tripIntel: z.record(z.any()).optional(),
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
  role: z.enum(["user", "assistant"]),
  content: z.string(),
});

export const ChatRequestSchema = z.object({
  messages: z.array(ChatMessageSchema),
  budget: z.number(),
  totalSpent: z.number(),
  currency: z.string().optional().default("USD"),
  expenses: z.array(z.any()), // You can use ExpenseItemSchema here if it matches
  settings: z.record(z.any()).optional(),
});

export type ChatRequest = z.infer<typeof ChatRequestSchema>;