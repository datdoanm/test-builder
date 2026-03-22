"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import SearchBar from "@/components/SearchBar"

interface LocationData {
  address: string
  lat: number
  lng: number
  placeId: string
}

export default function Home() {
  const router = useRouter()
  const [pickup, setPickup] = useState<LocationData | null>(null)
  const [dropoff, setDropoff] = useState<LocationData | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{
    pickup?: string
    dropoff?: string
  }>({})

  const handleViewPrice = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate that both locations are selected from dropdown
    const newErrors: typeof errors = {}

    if (!pickup) {
      newErrors.pickup = "Please select a pickup location from the suggestions"
    }
    if (!dropoff) {
      newErrors.dropoff = "Please select a drop-off location from the suggestions"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      // Calculate fare using the API
      const response = await fetch("/api/calculate-fare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pickupLat: pickup.lat,
          pickupLng: pickup.lng,
          dropoffLat: dropoff.lat,
          dropoffLng: dropoff.lng,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setErrors({ pickup: "Failed to calculate fare. Please try again." })
        return
      }

      // Navigate to results page with the calculated fare
      const params = new URLSearchParams({
        distance: data.distance,
        fare: data.fare,
        driverPhone: data.driverPhone,
        driverName: data.driverName,
        pickup: pickup.address,
        dropoff: dropoff.address,
      })

      router.push(`/results?${params.toString()}`)
    } catch (error) {
      console.error("Error calculating fare:", error)
      setErrors({ pickup: "Failed to calculate fare. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Ride Share</h1>
            <p className="text-gray-600">Find your ride in minutes</p>
          </div>

          {/* Search Form */}
          <form onSubmit={handleViewPrice} className="space-y-6">
            {/* Pickup Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Pickup Location
              </label>
              <SearchBar
                placeholder="Enter pickup location"
                value={pickup?.address || ""}
                onChange={(value) => {
                  setPickup(null)
                  setErrors({ ...errors, pickup: undefined })
                }}
                onSelect={setPickup}
              />
              {errors.pickup && (
                <p className="mt-2 text-sm text-red-600">{errors.pickup}</p>
              )}
            </div>

            {/* Drop-off Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Drop-off Location
              </label>
              <SearchBar
                placeholder="Enter drop-off location"
                value={dropoff?.address || ""}
                onChange={(value) => {
                  setDropoff(null)
                  setErrors({ ...errors, dropoff: undefined })
                }}
                onSelect={setDropoff}
              />
              {errors.dropoff && (
                <p className="mt-2 text-sm text-red-600">{errors.dropoff}</p>
              )}
            </div>

            {/* View Price Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3 rounded-lg transition duration-200"
            >
              {isLoading ? "Calculating..." : "View Price"}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
