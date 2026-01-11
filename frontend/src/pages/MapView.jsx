import React, { useState, useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import { useAuthContext } from "../context/useAuthContext";
import ReportForm from "../components/ReportForm";
import {
  FiMapPin,
  FiSearch,
  FiX,
  FiActivity,
  FiThumbsUp,
  FiCheckCircle,
  FiClock,
  FiFilter,
} from "react-icons/fi";

// LEAFLET CONFIG
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// COLORS & ICONS
const CATEGORY_COLORS = {
  road: "#ef4444",
  water: "#3b82f6",
  electricity: "#eab308",
  sanitation: "#22c55e",
  other: "#6b7280",
};
const STATUS_COLORS = {
  open: "#ef4444",
  "in-progress": "#f59e0b",
  resolved: "#10b981",
  closed: "#6b7280",
};

const createIcon = (colorUrl) =>
  new L.Icon({
    iconUrl: colorUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    shadowSize: [41, 41],
  });

const ICONS = {
  road: createIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png"
  ),
  water: createIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png"
  ),
  electricity: createIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png"
  ),
  sanitation: createIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
  ),
  other: createIcon(
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png"
  ),
};

// COMPONENTS

const MapLogic = ({ onLocationSelected, user, initialCenter }) => {
  const map = useMap();
  useEffect(() => {
    if (initialCenter)
      map.flyTo(initialCenter, 18, { animate: true, duration: 2.0 });
  }, [initialCenter, map]);

  useMapEvents({
    click(e) {
      if (!user) {
        L.popup()
          .setLatLng(e.latlng)
          .setContent(
            '<div class="text-center font-bold">Login required to report.</div>'
          )
          .openOn(map);
        return;
      }
      onLocationSelected(e.latlng);
    },
    zoomend: () => map.invalidateSize(),
    moveend: () => map.invalidateSize(),
  });
  return null;
};

const MapView = () => {
  const { user } = useAuthContext();
  const location = useLocation();

  // State
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // UI State
  const [selectedLocation, setSelectedLocation] = useState(null); // For new report
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Initial Fetch
  useEffect(() => {
    fetchReports();
  }, []);

  // Filter Logic
  useEffect(() => {
    let res = reports;
    if (selectedCategory)
      res = res.filter((r) => r.category.toLowerCase() === selectedCategory);
    setFilteredReports(res);
  }, [selectedCategory, reports]);

  const fetchReports = async () => {
    try {
      const res = await axios.get("/api/reports?limit=200"); // Fetch more for map context
      setReports(res.data.reports || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Search Logic
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length > 3) {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=5`
          );
          setSuggestions(await res.json());
        } catch {}
      } else setSuggestions([]);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handlers
  const handleLocationSelect = (lat, lon, displayName) => {
    setSearchQuery(displayName);
    setSuggestions([]);
    // We need access to map instance here? No, pass prop or use state if possible,
    // but MapLogic uses useMap. We can't access it here.
    // Workaround: We force a re-render of MapLogic with new "center" prop?
    // Actually MapLogic watches "initialCenter". We can update history state or just re-feed it.
    // Simplest: Just use standard window location or similar hack? No.
    // Better: Reset initialCenter state prop that is passed to MapLogic.
    // Actually, let's keep it simple: We won't flyTo here easily without context.
    // Wait, SearchBar was INSIDE MapContainer before. I moved it OUT to be "Floating".
    // To control map from outside, we need a ref or context.
    // Let's put SearchBar back separate but utilize a Ref to map if possible, or keep SearchBar INSIDE MapContainer for easy access but position it absolutely.
    // Re-embedding SearchBar inside MapContainer is safest for Leaflet control provided we use standard CSS positioning (z-index).
  };

  if (loading)
    return (
      <div className="h-screen w-full bg-slate-900 flex items-center justify-center text-white font-bold">
        Loading Map...
      </div>
    );

  return (
    <div className="relative h-screen w-full bg-slate-900 font-sans overflow-hidden">
      {/* Map */}
      <MapContainer
        center={location.state?.center || [28.6139, 77.209]}
        zoom={location.state?.center ? 18 : 13}
        className="h-full w-full z-0"
        zoomControl={false}
      >
        <TileLayer
          url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
          attribution="Google Maps"
          maxZoom={20}
        />

        {/* Internal Logic that needs useMap */}
        <MapLogic
          onLocationSelected={(latlng) => {
            setSelectedLocation(latlng);
            setShowForm(true);
          }}
          user={user}
          initialCenter={location.state?.center}
        />

        {/* FlyTo Handler for Search */}
        <SearchController selectedLocation={selectedLocation} />

        {/* Markers */}
        {filteredReports.map((r) => {
          // Filter unapproved/private if not admin/owner
          const isOwner =
            user &&
            r.reportedBy &&
            (r.reportedBy._id === user._id || r.reportedBy === user._id);
          if (!r.isApproved && !isOwner && user?.role !== "admin") return null;

          return (
            <Marker
              key={r._id}
              position={[
                r.location.coordinates.lat,
                r.location.coordinates.lng,
              ]}
              icon={ICONS[r.category] || ICONS.other}
            >
              <Popup className="font-sans">
                <div className="p-1 min-w-[200px]">
                  <h3 className="font-bold text-sm mb-1">{r.title}</h3>
                  <div className="flex gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                      {r.category}
                    </span>
                    <span
                      className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded text-white"
                      style={{ backgroundColor: STATUS_COLORS[r.status] }}
                    >
                      {r.status === "open" ? "Pending" : r.status}
                    </span>
                  </div>
                  <Link
                    to="/reports"
                    className="block text-center text-xs font-bold text-blue-600 hover:underline"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Selection Circle */}
        {selectedLocation && (
          <Circle
            center={selectedLocation}
            radius={100}
            pathOptions={{
              color: "white",
              dashArray: "10,10",
              fillOpacity: 0.2,
            }}
          />
        )}
      </MapContainer>

      {/* UI OVERLAY (Top) */}
      <div className="absolute top-4 left-0 w-full z-[1000] px-4 flex flex-col items-center gap-4 pointer-events-none">
        {/* Search Bar - Pointer Events Auto */}
        <div className="relative w-full max-w-md pointer-events-auto">
          <div className="relative bg-white rounded-full shadow-xl flex items-center pr-2">
            <FiSearch className="ml-4 text-gray-400" />
            <input
              type="text"
              placeholder="Find a location..."
              className="w-full bg-transparent border-none focus:ring-0 py-3 px-3 text-sm font-semibold text-gray-800 placeholder-gray-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSuggestions([]);
                }}
                className="p-1 hover:bg-gray-100 rounded-full text-gray-400"
              >
                <FiX />
              </button>
            )}
          </div>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 pointer-events-auto">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setSearchQuery(s.display_name);
                    setSuggestions([]);
                    // "Magic" communication to map via custom event or generic state?
                    // Simplest: update a specific "flyToTarget" state in parent, pass to MapLogic.
                    // Doing hacky window dispatch for simplicity or Ref?
                    // Let's use a hidden DOM trigger or Context.
                    // Better: State lift.
                    const event = new CustomEvent("map-fly-to", {
                      detail: [s.lat, s.lon],
                    });
                    window.dispatchEvent(event);
                  }}
                  className="w-full text-left px-4 py-3 text-sm hover:bg-blue-50 border-b border-gray-50 text-gray-700 truncate flex items-center gap-2"
                >
                  <FiMapPin className="text-blue-500 shrink-0" />{" "}
                  {s.display_name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Chips - Pointer Events Auto */}
        <div className="flex gap-2 overflow-x-auto max-w-full pb-2 pointer-events-auto no-scrollbar">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all ${
              !selectedCategory
                ? "bg-slate-900 text-white scale-105"
                : "bg-white text-gray-600 hover:bg-gray-50"
            }`}
          >
            All
          </button>
          {["road", "water", "electricity", "sanitation"].map((cat) => (
            <button
              key={cat}
              onClick={() =>
                setSelectedCategory(selectedCategory === cat ? null : cat)
              }
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold shadow-lg transition-all capitalize ${
                selectedCategory === cat
                  ? "bg-slate-900 text-white scale-105"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Report Form */}
      {showForm && selectedLocation && (
        <ReportForm
          location={selectedLocation}
          reports={reports}
          onClose={() => {
            setShowForm(false);
            setSelectedLocation(null);
          }}
          onSubmitted={() => {
            setShowForm(false);
            setSelectedLocation(null);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 4000);
            fetchReports();
          }}
        />
      )}

      {/* Success Toast */}
      {showSuccess && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-[2000] bg-slate-800 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 animate-bounce-in">
          <FiCheckCircle className="text-emerald-400 text-xl" />
          <span className="font-bold text-sm">
            Report Submitted Successfully
          </span>
        </div>
      )}
    </div>
  );
};

// Internal component to listen to window events for FlyTo (Simplest decoupling)
const SearchController = () => {
  const map = useMap();
  useEffect(() => {
    const handler = (e) => {
      const [lat, lon] = e.detail;
      map.flyTo([parseFloat(lat), parseFloat(lon)], 18);
    };
    window.addEventListener("map-fly-to", handler);
    return () => window.removeEventListener("map-fly-to", handler);
  }, [map]);
  return null;
};

export default MapView;
