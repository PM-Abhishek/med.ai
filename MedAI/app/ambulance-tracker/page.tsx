'use client'

import { useEffect, useState, useCallback } from 'react'
import Map, { Marker, Source, Layer } from 'react-map-gl'
import type { LineLayer } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

// Hardcoded coordinates (Bangalore)
const PATIENT_LOCATION = [77.5946, 12.9716]
const AMBULANCE_START = [77.5696, 12.9516]
const AMBULANCE_END = [77.5946, 12.9716]

const lineLayer: LineLayer = {
  id: 'route',
  type: 'line',
  layout: {
    'line-join': 'round',
    'line-cap': 'round'
  },
  paint: {
    'line-color': '#888',
    'line-width': 8
  }
}

export default function AmbulanceTracker() {
  const [ambulancePosition, setAmbulancePosition] = useState(AMBULANCE_START)

  const route = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: [AMBULANCE_START, AMBULANCE_END]
    }
  }

  const interpolatePoint = useCallback((start: number[], end: number[], fraction: number) => {
    return [
      start[0] + (end[0] - start[0]) * fraction,
      start[1] + (end[1] - start[1]) * fraction
    ]
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setAmbulancePosition(currentPos => {
        const [lng, lat] = currentPos
        const [endLng, endLat] = AMBULANCE_END
        const newLng = lng + (endLng - lng) * 0.1
        const newLat = lat + (endLat - lat) * 0.1
        return interpolatePoint(AMBULANCE_START, AMBULANCE_END, Math.min((newLng - AMBULANCE_START[0]) / (endLng - AMBULANCE_START[0]), 1))
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [interpolatePoint])

  return (
    <div className="w-full h-screen">
      <Map
        mapboxAccessToken="<token>"
        initialViewState={{
          longitude: (AMBULANCE_START[0] + PATIENT_LOCATION[0]) / 2,
          latitude: (AMBULANCE_START[1] + PATIENT_LOCATION[1]) / 2,
          zoom: 12
        }}
        style={{width: '100%', height: '100%'}}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        <Source id="route" type="geojson" data={route}>
          <Layer {...lineLayer} />
        </Source>
        <Marker longitude={PATIENT_LOCATION[0]} latitude={PATIENT_LOCATION[1]} color="red" />
        <Marker longitude={ambulancePosition[0]} latitude={ambulancePosition[1]} color="blue" />
      </Map>
    </div>
  )
}

