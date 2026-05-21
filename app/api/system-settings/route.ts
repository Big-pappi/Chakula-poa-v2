import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

// GET all system settings
export async function GET() {
  try {
    const settings = await sql`SELECT key, value FROM system_settings`;
    
    // Convert array to object for easier access
    const settingsObj: Record<string, unknown> = {};
    for (const row of settings) {
      settingsObj[row.key] = row.value;
    }
    
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error("[v0] Error fetching system settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch system settings" },
      { status: 500 }
    );
  }
}

// POST to update a single setting
export async function POST(request: Request) {
  try {
    const { key, value } = await request.json();
    
    if (!key) {
      return NextResponse.json(
        { error: "Setting key is required" },
        { status: 400 }
      );
    }
    
    await sql`
      UPDATE system_settings 
      SET value = ${JSON.stringify(value)}, updated_at = NOW()
      WHERE key = ${key}
    `;
    
    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error("[v0] Error updating system setting:", error);
    return NextResponse.json(
      { error: "Failed to update system setting" },
      { status: 500 }
    );
  }
}
