import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

const sql = neon(process.env.DATABASE_URL!);

// GET maintenance mode status - lightweight endpoint for frequent checks
export async function GET() {
  try {
    const result = await sql`
      SELECT value FROM system_settings WHERE key = 'maintenance_mode'
    `;
    
    const isMaintenanceMode = result[0]?.value === true || result[0]?.value === "true";
    
    return NextResponse.json({ maintenance_mode: isMaintenanceMode });
  } catch (error) {
    console.error("[v0] Error fetching maintenance mode:", error);
    // Default to false if there's an error (don't block users)
    return NextResponse.json({ maintenance_mode: false });
  }
}
