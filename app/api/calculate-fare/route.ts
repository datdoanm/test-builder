import { NextRequest, NextResponse } from "next/server"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

interface FareCalculationRequest {
  pickupLat: number
  pickupLng: number
  dropoffLat: number
  dropoffLng: number
}

// Mock driver data
const MOCK_DRIVERS = [
  { id: 1, phone: "+84 123 456 7890", name: "Minh" },
  { id: 2, phone: "+84 987 654 3210", name: "Linh" },
  { id: 3, phone: "+84 555 666 7777", name: "Hùng" },
]

export async function POST(request: NextRequest) {
  try {
    const body: FareCalculationRequest = await request.json()
    const { pickupLat, pickupLng, dropoffLat, dropoffLng } = body

    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return NextResponse.json(
        { error: "Missing location data" },
        { status: 400 }
      )
    }

    if (!GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: "Google Maps API key is not configured" },
        { status: 500 }
      )
    }

    // Get distance from Google Maps Distance Matrix API
    const distanceResponse = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${pickupLat},${pickupLng}&destinations=${dropoffLat},${dropoffLng}&key=${GOOGLE_MAPS_API_KEY}&mode=driving`
    )

    const distanceData = await distanceResponse.json()

    if (
      distanceData.status !== "OK" ||
      !distanceData.rows[0].elements[0].distance
    ) {
      return NextResponse.json(
        { error: "Failed to calculate distance" },
        { status: 500 }
      )
    }

    const distanceMeters = distanceData.rows[0].elements[0].distance.value
    const distanceKm = distanceMeters / 1000

    // Simple fare calculation:
    // Base fare: 30,000 VND
    // Per km: 15,000 VND
    const baseFare = 30000
    const perKmRate = 15000
    const totalFare = Math.round(baseFare + distanceKm * perKmRate)

    // Select a random driver
    const driver =
      MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)]

    return NextResponse.json({
      distance: `${distanceKm.toFixed(2)} km`,
      fare: `${totalFare.toLocaleString("vi-VN")} VND`,
      fareAmount: totalFare,
      driverPhone: driver.phone,
      driverName: driver.name,
    })
  } catch (error) {
    console.error("Fare calculation error:", error)
    return NextResponse.json(
      { error: "Failed to calculate fare" },
      { status: 500 }
    )
  }
}
