import { NextRequest } from "next/server";

// Use the Docker service name for the backend
const API_URL = process.env.NODE_ENV === "production" 
  ? "http://backend:8000"
  : "http://backend:8000"; // Use the same URL in both environments since we're in Docker

export async function GET(request: NextRequest) {
  console.log("Received auth header:", request.headers.get("Authorization") ? "Present" : "Missing");
  console.log("Using API URL:", API_URL);

  const authHeader = request.headers.get("Authorization");
  if (!authHeader) {
    console.log("No authorization token provided");
    return new Response(
      JSON.stringify({ error: "No authorization token provided" }),
      { status: 401 }
    );
  }

  const backendUrl = `${API_URL}/api/dashboard/stats`;
  console.log("Forwarding request to:", backendUrl);

  try {
    const res = await fetch(backendUrl, {
      headers: {
        "Authorization": authHeader,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      console.error("Backend error response:", errorData);
      return new Response(
        JSON.stringify({ 
          error: "Backend service error", 
          details: errorData,
          timestamp: new Date().toISOString()
        }),
        { status: res.status }
      );
    }

    const data = await res.json();
    return new Response(JSON.stringify(data));
  } catch (error) {
    console.error("Fetch error:", error);
    return new Response(
      JSON.stringify({ 
        error: "Backend service is unavailable", 
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString()
      }),
      { status: 503 }
    );
  }
} 