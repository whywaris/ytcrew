import dotenv from "dotenv";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { toolDefinitions } from "../src/lib/tool-definitions";

// Load environment variables from .env.local, env.local, then .env
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), "env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function migrateTools() {
  console.log("==================================================");
  console.log("🚀 Starting YT Crew Tools Migration to Supabase...");
  console.log("==================================================\n");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (
    !supabaseUrl ||
    !serviceRoleKey ||
    supabaseUrl.includes("your-project-id") ||
    serviceRoleKey.includes("your-supabase-service-role-key")
  ) {
    console.error("❌ ERROR: Supabase credentials are missing or still placeholder values.");
    console.error("Please configure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your .env.local file before running this script.");
    process.exit(1);
  }

  // Initialize administrative Supabase client bypassing RLS
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const toolEntries = Object.values(toolDefinitions);
  console.log(`📦 Found ${toolEntries.length} tool(s) to migrate.\n`);

  let successCount = 0;
  let failureCount = 0;
  const flaggedTools: string[] = [];

  for (const tool of toolEntries) {
    // Determine tool type: 'logic' (Phase A), 'open_api' (Phase B), 'youtube_api' (Phase C)
    let toolType = tool.type;
    if (!toolType || !["logic", "youtube_api", "open_api"].includes(toolType)) {
      toolType = "logic";
      flaggedTools.push(tool.slug);
    }

    const row = {
      slug: tool.slug,
      title: tool.title,
      short_description: tool.description,
      how_to_steps: tool.howToSteps,
      about_content: tool.aboutContent,
      faqs: tool.faqs,
      seo_title: tool.seoTitle || tool.title,
      seo_description: tool.seoDescription || tool.description,
      status: tool.status || "active",
      type: toolType,
      category_id: null,
    };

    console.log(`⏳ Migrating: "${tool.title}" (${tool.slug})...`);

    const { error } = await supabase
      .from("tools")
      .upsert(row, { onConflict: "slug" });

    if (error) {
      console.error(`❌ Failed to insert "${tool.slug}":`, error.message);
      failureCount++;
    } else {
      console.log(`✅ Successfully synced: "${tool.slug}" (type: ${toolType})`);
      successCount++;
    }
  }

  console.log("\n==================================================");
  console.log("📊 Migration Summary:");
  console.log(`- Total Tools:      ${toolEntries.length}`);
  console.log(`- Successfully Synced: ${successCount}`);
  console.log(`- Failed:           ${failureCount}`);

  if (flaggedTools.length > 0) {
    console.log(`- ⚠️ Flagged tools with defaulted 'logic' type: ${flaggedTools.join(", ")}`);
  }
  console.log("==================================================\n");
}

migrateTools().catch((err) => {
  console.error("❌ Unexpected migration failure:", err);
  process.exit(1);
});
