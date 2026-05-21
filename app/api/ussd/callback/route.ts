/**
 * USSD Callback API Route
 * Handles USSD callbacks from Beem USSD Hub
 * 
 * This route can be used as:
 * 1. A proxy to the Django backend (production)
 * 2. A standalone handler for testing
 * 
 * Beem USSD Hub Documentation:
 * - POST requests with command, msisdn, session_id, operator, payload
 * - Response format: { msisdn, operator, session_id, command, payload: { request_id, request } }
 */

import { NextResponse } from "next/server";

// Session storage (in-memory for demo, use Redis in production)
const sessions = new Map<string, { step: string; data: Record<string, string> }>();

interface USSDPayload {
  command: "initiate" | "continue" | "terminate";
  msisdn: string;
  session_id: string;
  operator: string;
  payload: {
    request_id: number;
    response: string;
  };
}

interface USSDResponse {
  msisdn: string;
  operator: string;
  session_id: string;
  command: "continue" | "terminate";
  payload: {
    request_id: number;
    request: string;
  };
}

// Normalize phone number to match database format
function normalizePhone(msisdn: string): string {
  let phone = msisdn.replace(/\+/g, "").replace(/ /g, "");
  if (phone.startsWith("255")) {
    phone = "0" + phone.slice(3);
  }
  return phone;
}

// Main menu
function mainMenu(data: USSDPayload): USSDResponse {
  return {
    msisdn: data.msisdn,
    operator: data.operator,
    session_id: data.session_id,
    command: "continue",
    payload: {
      request_id: 1,
      request: [
        "Karibu Chakula Poa!",
        "1. Angalia Akaunti",
        "2. Angalia Usajili",
        "3. Nambari ya Leo",
        "4. Milo ya Leo",
      ].join("\n"),
    },
  };
}

// Check account (stub - in production, query the database)
async function checkAccount(data: USSDPayload): Promise<USSDResponse> {
  const phone = normalizePhone(data.msisdn);
  
  // In production, fetch from API
  // const user = await fetch(`${API_URL}/api/users/by-phone/${phone}/`);
  
  // Demo response
  return {
    msisdn: data.msisdn,
    operator: data.operator,
    session_id: data.session_id,
    command: "continue",
    payload: {
      request_id: 2,
      request: [
        "Akaunti yako:",
        `Simu: ${phone}`,
        "",
        "Jiandikishe kwenye chakulapoa.co.tz",
        "kupata huduma kamili.",
        "",
        "00. Rudi",
      ].join("\n"),
    },
  };
}

// Check subscription (stub)
async function checkSubscription(data: USSDPayload): Promise<USSDResponse> {
  return {
    msisdn: data.msisdn,
    operator: data.operator,
    session_id: data.session_id,
    command: "continue",
    payload: {
      request_id: 2,
      request: [
        "Hakuna usajili hai.",
        "",
        "Jiandikishe kwenye:",
        "chakulapoa.co.tz",
        "",
        "00. Rudi",
      ].join("\n"),
    },
  };
}

// Check daily code (stub)
async function checkDailyCode(data: USSDPayload): Promise<USSDResponse> {
  return {
    msisdn: data.msisdn,
    operator: data.operator,
    session_id: data.session_id,
    command: "continue",
    payload: {
      request_id: 3,
      request: [
        "Unahitaji usajili hai",
        "kupata nambari ya leo.",
        "",
        "Jiandikishe kwenye:",
        "chakulapoa.co.tz",
        "",
        "00. Rudi",
      ].join("\n"),
    },
  };
}

// Check meals today (stub)
async function checkMealsToday(data: USSDPayload): Promise<USSDResponse> {
  return {
    msisdn: data.msisdn,
    operator: data.operator,
    session_id: data.session_id,
    command: "continue",
    payload: {
      request_id: 4,
      request: [
        "Huna milo ya leo.",
        "",
        "Chagua milo kwenye",
        "app au website.",
        "",
        "00. Rudi",
      ].join("\n"),
    },
  };
}

// Invalid option
function invalidOption(data: USSDPayload): USSDResponse {
  return {
    msisdn: data.msisdn,
    operator: data.operator,
    session_id: data.session_id,
    command: "continue",
    payload: {
      request_id: 0,
      request: "Chaguo halipo.\n\n00. Rudi",
    },
  };
}

export async function POST(request: Request) {
  try {
    const data: USSDPayload = await request.json();
    
    const { command, session_id, payload } = data;
    const userResponse = String(payload?.response || "0");
    
    console.log("[v0] USSD Request:", { command, session_id, response: userResponse });
    
    // Get or create session
    let session = sessions.get(session_id);
    if (!session) {
      session = { step: "main", data: {} };
      sessions.set(session_id, session);
    }
    
    let response: USSDResponse;
    
    // Handle based on command and user response
    if (command === "initiate" || userResponse === "0") {
      // Main menu
      session.step = "main";
      response = mainMenu(data);
    } else if (userResponse === "1") {
      // Check Account
      session.step = "account";
      response = await checkAccount(data);
    } else if (userResponse === "2") {
      // Check Subscription
      session.step = "subscription";
      response = await checkSubscription(data);
    } else if (userResponse === "3") {
      // Check Daily Code
      session.step = "daily_code";
      response = await checkDailyCode(data);
    } else if (userResponse === "4") {
      // Check Meals Today
      session.step = "meals";
      response = await checkMealsToday(data);
    } else if (userResponse === "00") {
      // Back to main menu
      session.step = "main";
      response = mainMenu(data);
    } else {
      // Invalid option
      response = invalidOption(data);
    }
    
    // Clean up terminated sessions
    if (command === "terminate") {
      sessions.delete(session_id);
    }
    
    console.log("[v0] USSD Response:", response.payload.request.substring(0, 50));
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("[v0] USSD Error:", error);
    return NextResponse.json(
      {
        msisdn: "",
        operator: "",
        session_id: "",
        command: "terminate",
        payload: {
          request_id: 0,
          request: "Samahani, tatizo limetokea. Jaribu tena.",
        },
      },
      { status: 200 } // Always return 200 for USSD
    );
  }
}

// GET for testing/documentation
export async function GET() {
  return NextResponse.json({
    service: "Chakula Poa USSD API",
    version: "1.0.0",
    endpoints: {
      callback: {
        method: "POST",
        description: "USSD callback endpoint for Beem USSD Hub",
        payload: {
          command: "initiate | continue | terminate",
          msisdn: "255XXXXXXXXX",
          session_id: "unique_session_id",
          operator: "vodacom | tigo | airtel | halotel | ttcl",
          payload: {
            request_id: 0,
            response: "user_input",
          },
        },
      },
    },
    menu_options: {
      "1": "Check Account Details",
      "2": "Check Subscription Status",
      "3": "Get Daily CPS Code",
      "4": "Check Today's Meals",
      "00": "Back to Main Menu",
    },
  });
}
