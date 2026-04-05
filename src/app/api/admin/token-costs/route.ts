import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Token pricing (per 1M tokens) — Claude 3.5 Sonnet
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
  "claude-3-5-sonnet-20241022": { input: 3.0, output: 15.0 },
  default: { input: 3.0, output: 15.0 },
};

export async function GET(request: Request) {
  try {
    // Verify admin access via cron secret or admin key
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = request.headers.get("authorization");
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const url = new URL(request.url);
    const days = parseInt(url.searchParams.get("days") || "7");
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

    // Aggregate by endpoint
    const { data: logs, error } = await supabase
      .from("api_logs")
      .select("endpoint, model, input_tokens, output_tokens, latency_ms, client_id, created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Aggregate stats
    const byEndpoint: Record<string, {
      calls: number;
      inputTokens: number;
      outputTokens: number;
      totalCost: number;
      avgLatencyMs: number;
      errors: number;
    }> = {};

    const byUser: Record<string, {
      calls: number;
      inputTokens: number;
      outputTokens: number;
      totalCost: number;
    }> = {};

    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let totalCost = 0;
    let totalCalls = 0;
    const uniqueUsers = new Set<string>();

    for (const log of logs || []) {
      const endpoint = log.endpoint || "unknown";
      const model = log.model || "default";
      const pricing = PRICING[model] || PRICING.default;
      const inputCost = ((log.input_tokens || 0) / 1_000_000) * pricing.input;
      const outputCost = ((log.output_tokens || 0) / 1_000_000) * pricing.output;
      const callCost = inputCost + outputCost;

      // By endpoint
      if (!byEndpoint[endpoint]) {
        byEndpoint[endpoint] = { calls: 0, inputTokens: 0, outputTokens: 0, totalCost: 0, avgLatencyMs: 0, errors: 0 };
      }
      byEndpoint[endpoint].calls++;
      byEndpoint[endpoint].inputTokens += log.input_tokens || 0;
      byEndpoint[endpoint].outputTokens += log.output_tokens || 0;
      byEndpoint[endpoint].totalCost += callCost;
      byEndpoint[endpoint].avgLatencyMs += log.latency_ms || 0;

      // By user
      if (log.client_id) {
        uniqueUsers.add(log.client_id);
        if (!byUser[log.client_id]) {
          byUser[log.client_id] = { calls: 0, inputTokens: 0, outputTokens: 0, totalCost: 0 };
        }
        byUser[log.client_id].calls++;
        byUser[log.client_id].inputTokens += log.input_tokens || 0;
        byUser[log.client_id].outputTokens += log.output_tokens || 0;
        byUser[log.client_id].totalCost += callCost;
      }

      totalInputTokens += log.input_tokens || 0;
      totalOutputTokens += log.output_tokens || 0;
      totalCost += callCost;
      totalCalls++;
    }

    // Calculate averages
    for (const ep of Object.values(byEndpoint)) {
      ep.avgLatencyMs = ep.calls > 0 ? Math.round(ep.avgLatencyMs / ep.calls) : 0;
      ep.totalCost = Math.round(ep.totalCost * 100) / 100;
    }

    // Sort users by cost descending
    const topUsers = Object.entries(byUser)
      .sort(([, a], [, b]) => b.totalCost - a.totalCost)
      .slice(0, 10)
      .map(([userId, stats]) => ({
        userId: userId.substring(0, 8) + "...",
        ...stats,
        totalCost: Math.round(stats.totalCost * 100) / 100,
      }));

    return NextResponse.json({
      period: `Last ${days} days`,
      since,
      summary: {
        totalCalls,
        uniqueUsers: uniqueUsers.size,
        totalInputTokens,
        totalOutputTokens,
        totalCost: Math.round(totalCost * 100) / 100,
        avgCostPerCall: totalCalls > 0 ? Math.round((totalCost / totalCalls) * 1000) / 1000 : 0,
        avgCostPerUser: uniqueUsers.size > 0 ? Math.round((totalCost / uniqueUsers.size) * 100) / 100 : 0,
      },
      byEndpoint,
      topUsers,
    });
  } catch (error) {
    console.error("Token cost error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal error" },
      { status: 500 }
    );
  }
}
