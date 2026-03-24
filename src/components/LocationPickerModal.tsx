import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, Loader2, LocateFixed } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (lat: number, lon: number, name?: string) => void;
}

export function LocationPickerModal({
  isOpen,
  onClose,
  onSelectLocation,
}: LocationPickerModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedPos, setSelectedPos] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState<string>("");

  // Initialize map when modal opens
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    // Small delay to ensure container is rendered
    const timer = setTimeout(() => {
      if (!mapContainerRef.current || mapRef.current) return;

      const map = L.map(mapContainerRef.current, {
        center: [10.82, 106.63], // Default: HCMC
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      // Add zoom control to bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Use Google Maps satellite tiles
      L.tileLayer("https://mt1.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}", {
        attribution: "© Google Maps",
        maxZoom: 20,
      }).addTo(map);

      // Custom marker icon
      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `<div style="
          width: 32px; height: 32px; 
          background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
          border-radius: 50% 50% 50% 4px; 
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        "><div style="
          width: 8px; height: 8px; 
          background: white; 
          border-radius: 50%; 
          transform: rotate(45deg);
        "></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      // Click handler
      map.on("click", async (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        setSelectedPos({ lat, lng });

        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], {
            icon: customIcon,
          }).addTo(map);
        }

        // Try reverse geocoding for a nice name
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&accept-language=vi`
          );
          const data = await res.json();
          const name =
            data.address?.city ||
            data.address?.town ||
            data.address?.county ||
            data.address?.state ||
            data.display_name?.split(",").slice(0, 2).join(",") ||
            "";
          setLocationLabel(name);
        } catch {
          setLocationLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
        }
      });

      mapRef.current = map;
    }, 100);

    return () => {
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markerRef.current = null;
      }
      setSelectedPos(null);
      setLocationLabel("");
    };
  }, [isOpen]);

  const handleLocateMe = () => {
    if (!mapRef.current) return;
    setIsLocating(true);

    mapRef.current.locate({ setView: true, maxZoom: 14 });

    mapRef.current.once("locationfound", (e: L.LocationEvent) => {
      setIsLocating(false);
      const { lat, lng } = e.latlng;
      setSelectedPos({ lat, lng });

      const customIcon = L.divIcon({
        className: "custom-map-marker",
        html: `<div style="
          width: 32px; height: 32px; 
          background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
          border-radius: 50% 50% 50% 4px; 
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
        "><div style="
          width: 8px; height: 8px; 
          background: white; 
          border-radius: 50%; 
          transform: rotate(45deg);
        "></div></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        markerRef.current = L.marker([lat, lng], {
          icon: customIcon,
        }).addTo(mapRef.current!);
      }

      setLocationLabel("Vị trí của bạn");
    });

    mapRef.current.once("locationerror", () => {
      setIsLocating(false);
    });
  };

  const handleConfirm = () => {
    if (selectedPos) {
      onSelectLocation(selectedPos.lat, selectedPos.lng, locationLabel);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-2xl bg-[#1a1f2e]/95 backdrop-blur-2xl rounded-3xl overflow-hidden border border-white/10 shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                  <MapPin size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-medium text-sm">
                    Chọn vị trí dự báo
                  </h3>
                  <p className="text-white/40 text-xs">
                    Nhấn vào bản đồ để chọn vị trí
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X size={16} className="text-white/60" />
              </button>
            </div>

            {/* Map */}
            <div className="relative">
              <div
                ref={mapContainerRef}
                className="w-full h-[400px]"
                style={{ background: "#1a1f2e" }}
              />

              {/* Locate Me Button */}
              <button
                onClick={handleLocateMe}
                disabled={isLocating}
                className="absolute top-4 left-4 z-[1000] bg-[#1a1f2e]/90 backdrop-blur-xl text-white px-3 py-2 rounded-xl border border-white/15 hover:bg-white/10 transition-all flex items-center gap-2 text-xs font-medium shadow-lg"
              >
                {isLocating ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <LocateFixed size={14} />
                )}
                Vị trí của tôi
              </button>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-white/10">
              <div className="text-xs text-white/40 truncate max-w-[200px]">
                {selectedPos
                  ? locationLabel ||
                    `${selectedPos.lat.toFixed(4)}, ${selectedPos.lng.toFixed(4)}`
                  : "Chưa chọn vị trí"}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors rounded-xl hover:bg-white/5"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!selectedPos}
                  className={`
                    px-5 py-2 text-xs font-medium rounded-xl transition-all
                    ${
                      selectedPos
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:opacity-90 shadow-lg shadow-blue-500/20"
                        : "bg-white/5 text-white/30 cursor-not-allowed"
                    }
                  `}
                >
                  Xem dự báo
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
