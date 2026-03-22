import { NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const input = searchParams.get("input")

  if (!input || input.length < 3) {
    return NextResponse.json({ predictions: [] })
  }

  if (!GOOGLE_MAPS_API_KEY) {
    return NextResponse.json(
      { error: "Google Maps API key is not configured" },
      { status: 500 }
    )
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input
      )}&key=${GOOGLE_MAPS_API_KEY}&language=vi&components=country:vn`
    )

    const data = await response.json()

    if (data.error_message) {
      console.error("Google Maps API error:", data.error_message)
      return NextResponse.json(
        { error: "Failed to fetch suggestions" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      predictions: data.predictions || [],
    })
  } catch (error) {
    console.error("Autocomplete error:", error)
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    )
  }
}
