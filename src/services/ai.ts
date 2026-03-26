import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { SuggestionSchema, AiSuggestion, InsightsRequest, ChatRequest } from "../types/index.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateTripInsights(
  params: InsightsRequest
): Promise<AiSuggestion[]> {
  const expenseSummary = params.expenses.slice(0, 20).map((e) => ({
    amount: e.amount,
    category: e.category,
    note: e.note,
    location: e.locationLabel,
  }));

  const prompt = `
You are an expert travel financial advisor.

Analyze this traveler's situation carefully.

TRIP CONTEXT
${JSON.stringify(
  {
    country: params.country,
    location: params.locationLabel,
    purpose: params.visitPurpose,
    spendingMode: params.spendingMode,
    budget: params.budget,
    spent: params.totalSpent,
    tripDays: params.tripDays,
    startDate: params.tripStartDate,
    tripIntelligence: params.tripIntel,
    expenses: expenseSummary,
  },
  null,
  2
)}

INTERPRETATION RULES

• If riskLevel = "danger"
  → give strong money-saving advice.

• If spendingMode = "save"
  → prioritize survival budgeting.

• If spendingMode = "enjoy"
  → allow moderate experiences but avoid overspending.

• If purpose includes "job"
  → focus on survival budgeting, cheap meals, transport, job-search strategy.

• If purpose includes "tour"
  → suggest affordable attractions.

YOUR JOB

1. Identify spending mistakes
2. Recommend a realistic daily budget strategy
3. Suggest cheaper food, transport, or activity options
4. Give location-specific ideas
5. Help the traveler finish the trip without running out of money

Return exactly 3 short suggestions.
`.trim();

  const completion = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: zodResponseFormat(SuggestionSchema, "suggestions"),
  });

  const parsed = completion.choices[0].message.parsed;

  if (!parsed) {
    console.error("[AI] Parsed response was null — returning fallback");
    return getFallbackSuggestions();
  }

  return parsed.suggestions.map((item, index) => ({
    id: `${Date.now()}-${index}`,
    title: item.title,
    description: item.description,
    priority: item.priority,
  }));
}

function getFallbackSuggestions(): AiSuggestion[] {
  return [
    {
      id: "fallback-1",
      title: "Reduce food spending",
      description:
        "Try local cafeterias or supermarkets for cheaper meals instead of restaurants.",
      priority: "save_now",
    },
    {
      id: "fallback-2",
      title: "Use public transport",
      description:
        "Metro or bus passes are usually much cheaper than taxis or ride-sharing.",
      priority: "good_option",
    },
    {
      id: "fallback-3",
      title: "Balance paid and free activities",
      description:
        "Mix free attractions with occasional paid experiences to stay within budget.",
      priority: "watch",
    },
  ];
}


export async function generateChatReply(params: ChatRequest): Promise<string> {
  // 1. Format context data
  const remaining = params.budget - params.totalSpent;
  const pct = params.budget > 0 ? Math.round((params.totalSpent / params.budget) * 100) : 0;
  
  // Format the last 5 expenses
  const recentExpenses = params.expenses
    .slice(-5)
    .map((e) => `- ${e.category}: ${e.amount} — ${e.note || 'no note'}`)
    .join('\n');

  // 2. Build the System Prompt safely on the server
  const systemPrompt = `You are a smart travel budget advisor inside the ExpenseTracker AI app.
Keep responses concise (2–4 sentences max). Be helpful, practical, and friendly.

TRIP CONTEXT:
- Total Budget: ${params.budget} ${params.currency}
- Total Spent: ${params.totalSpent} ${params.currency} (${pct}%)
- Remaining: ${remaining} ${params.currency}
- Trip Days: ${params.settings?.tripDays ?? 'unknown'}
- Location: ${params.settings?.travelLocation || 'not set'}

RECENT EXPENSES (last 5):
${recentExpenses || 'No recent expenses.'}

Answer the user's question about their trip spending based on the above context.`;

  // 3. Call OpenAI (standard text completion, no Zod parsing needed here)
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: systemPrompt },
      ...params.messages, // Append the conversation history sent from frontend
    ],
  });

  return completion.choices[0]?.message?.content || "Sorry, I could not generate a response.";
}