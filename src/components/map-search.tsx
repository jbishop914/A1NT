"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, User, Building2, X, Navigation } from "lucide-react";

// ─── Client data for internal search ─────────────────────────────

interface ClientLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  status: "Active" | "Lead" | "Inactive";
  tags: string[];
  lat?: number;
  lng?: number;
}

// Sample clients with geocoded locations (Cheshire, CT area)
const clientLocations: ClientLocation[] = [
  {
    id: "1",
    name: "Riverside Property Management",
    address: "45 Main St",
    city: "Cheshire",
    state: "CT",
    status: "Active",
    tags: ["Commercial", "Maintenance Plan"],
    lat: 41.499,
    lng: -72.897,
  },
  {
    id: "2",
    name: "Oak Street Apartments",
    address: "120 Oak Ave",
    city: "Cheshire",
    state: "CT",
    status: "Active",
    tags: ["Residential", "Priority"],
    lat: 41.505,
    lng: -72.865,
  },
  {
    id: "3",
    name: "Martinez Residence",
    address: "88 Elm Dr",
    city: "Wallingford",
    state: "CT",
    status: "Active",
    tags: ["Residential"],
    lat: 41.457,
    lng: -72.823,
  },
  {
    id: "4",
    name: "Downtown Dental Office",
    address: "300 S Main St",
    city: "Cheshire",
    state: "CT",
    status: "Active",
    tags: ["Commercial"],
    lat: 41.497,
    lng: -72.901,
  },
  {
    id: "5",
    name: "Greenfield Schools",
    address: "525 Highland Ave",
    city: "Cheshire",
    state: "CT",
    status: "Lead",
    tags: ["Institutional", "New Lead"],
    lat: 41.511,
    lng: -72.872,
  },
  {
    id: "6",
    name: "Harbor View Restaurant",
    address: "12 Harbor Rd",
    city: "Meriden",
    state: "CT",
    status: "Active",
    tags: ["Commercial", "Kitchen"],
    lat: 41.538,
    lng: -72.807,
  },
  {
    id: "7",
    name: "Sunset Senior Living",
    address: "200 Academy Rd",
    city: "Cheshire",
    state: "CT",
    status: "Active",
    tags: ["Institutional", "Maintenance Plan"],
    lat: 41.492,
    lng: -72.882,
  },
  {
    id: "8",
    name: "Thompson Construction",
    address: "75 Industrial Pkwy",
    city: "Wallingford",
    state: "CT",
    status: "Inactive",
    tags: ["Commercial"],
    lat: 41.462,
    lng: -72.818,
  },
];

// ─── Geocoder result from Mapbox ─────────────────────────────────

interface GeocoderResult {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
}

// ─── Component ───────────────────────────────────────────────────

interface MapSearchProps {
  map: mapboxgl.Map | null;
}

export function MapSearch({ map }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const [clientResults, setClientResults] = useState<ClientLocation[]>([]);
  const [geocoderResults, setGeocoderResults] = useState<GeocoderResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Filter clients by query
  useEffect(() => {
    if (!query.trim()) {
      setClientResults([]);
      setGeocoderResults([]);
      return;
    }

    const q = query.toLowerCase();
    const matches = clientLocations.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.city.toLowerCase().includes(q) ||
        c.tags.some((t) => t.toLowerCase().includes(q))
    );
    setClientResults(matches.slice(0, 4));

    // Debounced geocoder search
    if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchGeocoder(query);
    }, 400);

    return () => {
      if (debounceRef.current !== null) clearTimeout(debounceRef.current);
    };
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function searchGeocoder(q: string) {
    if (q.length < 3) {
      setGeocoderResults([]);
      return;
    }

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    setIsSearching(true);
    try {
      const res = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(q)}.json?` +
          `access_token=${token}&country=us&limit=4&proximity=-72.8685,41.4989&types=address,poi,place`
      );
      const data = await res.json();
      const results: GeocoderResult[] = (data.features || []).map(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (f: any) => ({
          id: f.id,
          name: f.text || f.place_name,
          address: f.place_name,
          lat: f.center[1],
          lng: f.center[0],
        })
      );
      setGeocoderResults(results);
    } catch (err) {
      console.error("[MapSearch] Geocoder error:", err);
    } finally {
      setIsSearching(false);
    }
  }

  function flyToLocation(lat: number, lng: number, zoom = 17) {
    if (!map) return;
    map.flyTo({
      center: [lng, lat],
      zoom,
      pitch: 60,
      bearing: -30,
      duration: 2000,
      essential: true,
    });
    setFocused(false);
    setQuery("");
  }

  function selectClient(client: ClientLocation) {
    if (client.lat && client.lng) {
      flyToLocation(client.lat, client.lng, 18);
    }
  }

  function selectGeocoderResult(result: GeocoderResult) {
    flyToLocation(result.lat, result.lng, 16);
  }

  const hasResults = clientResults.length > 0 || geocoderResults.length > 0;
  const showDropdown = focused && query.trim().length > 0;

  return (
    <div ref={containerRef} className="relative w-[360px]" data-testid="map-search">
      {/* Search input */}
      <div
        className={`
          flex items-center gap-2 bg-black/50 backdrop-blur-xl border px-3 py-2 transition-all
          ${showDropdown && hasResults ? "rounded-t-lg border-white/[0.12]" : "rounded-lg border-white/[0.08]"}
          ${focused ? "bg-black/60 border-white/[0.12]" : ""}
        `}
      >
        <Search className="w-3.5 h-3.5 text-white/40 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search clients, addresses, or places..."
          className="flex-1 bg-transparent text-xs text-white/90 placeholder:text-white/30 outline-none"
          data-testid="map-search-input"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="text-white/30 hover:text-white/60 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
        {isSearching && (
          <div className="w-3 h-3 rounded-full border border-white/20 border-t-white/60 animate-spin" />
        )}
      </div>

      {/* Results dropdown */}
      {showDropdown && hasResults && (
        <div className="absolute top-full left-0 right-0 bg-black/70 backdrop-blur-xl border border-t-0 border-white/[0.12] rounded-b-lg overflow-hidden z-50 max-h-[320px] overflow-y-auto scrollbar-none">
          {/* Client results */}
          {clientResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 border-b border-white/[0.06]">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-medium">
                  Clients
                </span>
              </div>
              {clientResults.map((client) => (
                <button
                  key={client.id}
                  onClick={() => selectClient(client)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left"
                  data-testid={`search-client-${client.id}`}
                >
                  <div className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                    {client.tags.includes("Commercial") || client.tags.includes("Institutional") ? (
                      <Building2 className="w-3.5 h-3.5 text-white/40" />
                    ) : (
                      <User className="w-3.5 h-3.5 text-white/40" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-white/80 font-medium truncate">
                        {client.name}
                      </p>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full shrink-0 ${
                          client.status === "Active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : client.status === "Lead"
                              ? "bg-blue-500/20 text-blue-400"
                              : "bg-white/10 text-white/40"
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/40 truncate">
                      {client.address}, {client.city}, {client.state}
                    </p>
                  </div>
                  <Navigation className="w-3 h-3 text-white/20 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}

          {/* Geocoder results */}
          {geocoderResults.length > 0 && (
            <div>
              <div className="px-3 py-1.5 border-b border-white/[0.06] border-t border-white/[0.06]">
                <span className="text-[9px] uppercase tracking-widest text-white/30 font-medium">
                  Addresses
                </span>
              </div>
              {geocoderResults.map((result) => (
                <button
                  key={result.id}
                  onClick={() => selectGeocoderResult(result)}
                  className="w-full flex items-start gap-2.5 px-3 py-2 hover:bg-white/[0.06] transition-colors text-left"
                  data-testid={`search-address-${result.id}`}
                >
                  <div className="w-7 h-7 rounded-md bg-white/[0.06] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-white/40" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/80 truncate">{result.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{result.address}</p>
                  </div>
                  <Navigation className="w-3 h-3 text-white/20 shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {showDropdown && !hasResults && query.length >= 3 && !isSearching && (
        <div className="absolute top-full left-0 right-0 bg-black/70 backdrop-blur-xl border border-t-0 border-white/[0.12] rounded-b-lg px-3 py-4 text-center">
          <p className="text-[10px] text-white/30">No results found</p>
        </div>
      )}
    </div>
  );
}
