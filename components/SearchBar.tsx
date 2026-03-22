"use client"

import { useState, useRef, useEffect, useCallback } from "react"

interface Prediction {
  place_id: string
  description: string
  main_text: string
}

interface LocationData {
  address: string
  lat: number
  lng: number
  placeId: string
}

interface SearchBarProps {
  placeholder: string
  value: string
  onChange: (value: string) => void
  onSelect: (location: LocationData) => void
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder,
  value,
  onChange,
  onSelect,
}) => {
  const [input, setInput] = useState(value)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const debounceTimerRef = useRef<NodeJS.Timeout>()

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(async (searchInput: string) => {
    if (searchInput.length < 3) {
      setPredictions([])
      setShowDropdown(false)
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch(
        `/api/autocomplete?input=${encodeURIComponent(searchInput)}`
      )
      const data = await response.json()

      if (data.predictions) {
        setPredictions(data.predictions)
        setShowDropdown(true)
        setSelectedIndex(-1)
      } else {
        setPredictions([])
        setShowDropdown(false)
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error)
      setPredictions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInput(newValue)
    onChange(newValue)

    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(newValue)
    }, 300)
  }

  // Handle prediction selection
  const handleSelectPrediction = async (prediction: Prediction) => {
    setInput(prediction.description)
    setShowDropdown(false)
    setPredictions([])

    try {
      // Get place details to get coordinates
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&fields=geometry`
      )
      const data = await response.json()

      if (data.result?.geometry?.location) {
        const locationData: LocationData = {
          address: prediction.description,
          lat: data.result.geometry.location.lat,
          lng: data.result.geometry.location.lng,
          placeId: prediction.place_id,
        }
        onSelect(locationData)
      }
    } catch (error) {
      console.error("Error fetching place details:", error)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || predictions.length === 0) return

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault()
        setSelectedIndex((prev) =>
          prev < predictions.length - 1 ? prev + 1 : prev
        )
        break
      case "ArrowUp":
        e.preventDefault()
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
        break
      case "Enter":
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleSelectPrediction(predictions[selectedIndex])
        }
        break
      case "Escape":
        e.preventDefault()
        setShowDropdown(false)
        break
    }
  }

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (predictions.length > 0) {
            setShowDropdown(true)
          }
        }}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute right-3 top-3">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {/* Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="autocomplete-dropdown">
          {predictions.map((prediction, index) => (
            <div
              key={prediction.place_id}
              onClick={() => handleSelectPrediction(prediction)}
              className={`autocomplete-item ${
                index === selectedIndex ? "bg-blue-50" : ""
              }`}
            >
              <p className="font-semibold text-gray-800">
                {prediction.main_text}
              </p>
              <p className="text-sm text-gray-600">{prediction.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* No results message */}
      {showDropdown && !isLoading && predictions.length === 0 && input.length >= 3 && (
        <div className="autocomplete-dropdown">
          <div className="autocomplete-item text-gray-500 text-center">
            No locations found
          </div>
        </div>
      )}
    </div>
  )
}

export default SearchBar
