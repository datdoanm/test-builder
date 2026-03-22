"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function ResultsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(false)
  }, [])

  const distance = searchParams.get("distance")
  const fare = searchParams.get("fare")
  const driverPhone = searchParams.get("driverPhone")
  const driverName = searchParams.get("driverName")
  const pickup = searchParams.get("pickup")
  const dropoff = searchParams.get("dropoff")

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    )
  }

  if (
    !distance ||
    !fare ||
    !driverPhone ||
    !pickup ||
    !dropoff
  ) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Request
          </h1>
          <p className="text-gray-600 mb-6">
            Please provide valid pickup and drop-off locations.
          </p>
          <Link
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-200"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your Fare
            </h1>
            <p className="text-gray-600">Ride details and driver information</p>
          </div>

          {/* Trip Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 space-y-4">
            {/* Pickup */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Pickup Location
              </p>
              <p className="text-gray-900 font-medium break-words">{pickup}</p>
            </div>

            {/* Dropoff */}
            <div>
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Drop-off Location
              </p>
              <p className="text-gray-900 font-medium break-words">{dropoff}</p>
            </div>

            {/* Distance */}
            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-600 mb-1">
                Distance
              </p>
              <p className="text-gray-900 font-medium">{distance}</p>
            </div>
          </div>

          {/* Fare Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg p-6 text-white mb-8">
            <p className="text-sm font-semibold opacity-90 mb-2">Estimated Fare</p>
            <p className="text-4xl font-bold mb-4">{fare}</p>
            <p className="text-sm opacity-80">
              This is an estimated fare. Final amount may vary.
            </p>
          </div>

          {/* Driver Information */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Driver Information
            </h2>
            <div className="space-y-4">
              {/* Driver Name */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Driver Name
                </p>
                <p className="text-gray-900 font-medium">
                  {driverName || "Available Driver"}
                </p>
              </div>

              {/* Driver Phone */}
              <div>
                <p className="text-sm font-semibold text-gray-600 mb-1">
                  Contact Number
                </p>
                <a
                  href={`tel:${driverPhone}`}
                  className="text-blue-600 hover:text-blue-700 font-medium text-lg"
                >
                  {driverPhone}
                </a>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition duration-200">
              Confirm Booking
            </button>
            <Link
              href="/"
              className="block w-full text-center bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition duration-200"
            >
              Search Again
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
