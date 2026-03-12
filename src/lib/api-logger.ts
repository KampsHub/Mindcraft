import { createClient } from "@supabase/supabase-js";

// Use service-level client for logging (bypasses RLS)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function logApiCall({
  clientId,
  endpoint,
  model,
  inputPrompt,
  output,
  inputTokens,
  outputTokens,
  latencyMs,
  error,
}: {
  clientId?: string;
  endpoint: string;
  model?: string;
  inputPrompt?: string;
  output?: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  error?: string;
}) {
  try {
    await supabaseAdmin.from("api_logs").insert({
      client_id: clientId,
      endpoint,
      model,
      input_prompt: inputPrompt?.substring(0, 10000), // Truncate if huge
      output: output?.substring(0, 10000),
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      latency_ms: latencyMs,
      error,
    });
  } catch (err) {
    console.error("Failed to log API call:", err);
  }
}
