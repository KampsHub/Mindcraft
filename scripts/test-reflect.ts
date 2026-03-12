// Test script for /api/reflect endpoint
// Run: npx tsx scripts/test-reflect.ts (while dev server is running)

const SAMPLE_ENTRY = `I had a conversation with my manager today about my performance review.
She said I'm "meeting expectations" but I know I'm doing more than that. I stayed late three
times this week to finish the migration project and nobody even mentioned it. I don't want to
be the person who needs praise for everything, but it would be nice to feel seen. I'm starting
to wonder if I should just do the minimum and stop killing myself for a company that doesn't
notice.`;

async function testReflect() {
  console.log("🧪 Testing /api/reflect endpoint...\n");
  console.log("📝 Sample journal entry:");
  console.log(`"${SAMPLE_ENTRY.trim()}"\n`);
  console.log("⏳ Sending to Claude API...\n");

  try {
    const response = await fetch("http://localhost:3000/api/reflect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry: SAMPLE_ENTRY }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Error:", error);
      process.exit(1);
    }

    const data = await response.json();

    console.log("✅ Response received!\n");
    console.log("--- COACHING REFLECTION ---");
    console.log(data.reflection);
    console.log("\n--- THEME TAGS ---");
    console.log(data.theme_tags);
    console.log("\n--- API USAGE ---");
    console.log(`Model: ${data.model}`);
    console.log(
      `Tokens: ${data.usage.input_tokens} input / ${data.usage.output_tokens} output`
    );
  } catch (error) {
    console.error("❌ Failed to connect. Is the dev server running? (npm run dev)");
    console.error(error);
    process.exit(1);
  }
}

testReflect();
