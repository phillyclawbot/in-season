"use client";

import { useState, useEffect, useCallback } from "react";
import { getRegionFromState, DEFAULT_REGION, DEFAULT_LOCATION } from "@/data/regions";

const STORAGE_KEY_REGION = "inseason-region";
const STORAGE_KEY_LOCATION = "inseason-location";

const STATE_NAME_TO_CODE: Record<string, string> = {
  "Alabama": "AL", "Alaska": "AK", "Arizona": "AZ", "Arkansas": "AR",
  "California": "CA", "Colorado": "CO", "Connecticut": "CT", "Delaware": "DE",
  "Florida": "FL", "Georgia": "GA", "Hawaii": "HI", "Idaho": "ID",
  "Illinois": "IL", "Indiana": "IN", "Iowa": "IA", "Kansas": "KS",
  "Kentucky": "KY", "Louisiana": "LA", "Maine": "ME", "Maryland": "MD",
  "Massachusetts": "MA", "Michigan": "MI", "Minnesota": "MN", "Mississippi": "MS",
  "Missouri": "MO", "Montana": "MT", "Nebraska": "NE", "Nevada": "NV",
  "New Hampshire": "NH", "New Jersey": "NJ", "New Mexico": "NM", "New York": "NY",
  "North Carolina": "NC", "North Dakota": "ND", "Ohio": "OH", "Oklahoma": "OK",
  "Oregon": "OR", "Pennsylvania": "PA", "Rhode Island": "RI", "South Carolina": "SC",
  "South Dakota": "SD", "Tennessee": "TN", "Texas": "TX", "Utah": "UT",
  "Vermont": "VT", "Virginia": "VA", "Washington": "WA", "West Virginia": "WV",
  "Wisconsin": "WI", "Wyoming": "WY", "District of Columbia": "DC",
};

export interface LocationState {
  region: string;
  location: string;
  loading: boolean;
  showPicker: boolean;
  setRegion: (region: string, location?: string) => void;
  openPicker: () => void;
  closePicker: () => void;
}

export function useLocation(): LocationState {
  const [region, setRegionState] = useState(DEFAULT_REGION);
  const [location, setLocationState] = useState(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);
  const [showPicker, setShowPicker] = useState(false);

  const setRegion = useCallback((newRegion: string, newLocation?: string) => {
    const loc = newLocation || newRegion;
    setRegionState(newRegion);
    setLocationState(loc);
    setShowPicker(false);
    try {
      localStorage.setItem(STORAGE_KEY_REGION, newRegion);
      localStorage.setItem(STORAGE_KEY_LOCATION, loc);
    } catch {}
  }, []);

  const openPicker = useCallback(() => setShowPicker(true), []);
  const closePicker = useCallback(() => setShowPicker(false), []);

  useEffect(() => {
    // Check localStorage first
    try {
      const savedRegion = localStorage.getItem(STORAGE_KEY_REGION);
      if (savedRegion) {
        setRegionState(savedRegion);
        setLocationState(localStorage.getItem(STORAGE_KEY_LOCATION) || savedRegion);
        setLoading(false);
        return;
      }
    } catch {}

    // Try geolocation
    if (!("geolocation" in navigator)) {
      setShowPicker(true);
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
            { headers: { "Accept-Language": "en-US" } }
          );
          const data = await res.json();
          const stateName: string = data?.address?.state ?? "";
          const city: string =
            data?.address?.city ||
            data?.address?.town ||
            data?.address?.village ||
            data?.address?.county ||
            "";
          const stateCode = STATE_NAME_TO_CODE[stateName] ?? "";
          const detectedRegion = stateCode
            ? getRegionFromState(stateCode)
            : DEFAULT_REGION;
          const displayLocation = city
            ? stateCode
              ? `${city}, ${stateCode}`
              : city
            : (stateName || detectedRegion);
          setRegion(detectedRegion, displayLocation);
        } catch {
          setShowPicker(true);
        }
        setLoading(false);
      },
      () => {
        setShowPicker(true);
        setLoading(false);
      },
      { timeout: 8000, maximumAge: 3600000 }
    );
  }, [setRegion]);

  return { region, location, loading, showPicker, setRegion, openPicker, closePicker };
}
