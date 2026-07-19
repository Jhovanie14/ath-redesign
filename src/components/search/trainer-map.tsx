"use client";

import { useEffect } from "react";
import Link from "next/link";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Trainer } from "@/lib/types";
import { formatGBP } from "@/lib/utils";
import { RatingStars } from "@/components/rating-stars";

export interface TrainerMapProps {
  trainers: Trainer[];
  activeSlug: string | null;
  onHoverChange: (slug: string | null) => void;
}

function markerIcon(premium: boolean, active: boolean) {
  const size = active ? 32 : 24;
  const scale = active ? "transform:scale(1.05);" : "";
  // Premium: a 1px paper gap then a 2px gold ring, so it reads distinctly
  // at rest. Layered on top of the standard drop shadow.
  const shadow = premium
    ? "box-shadow:0 3px 8px rgba(38,37,31,.4), 0 0 0 1px var(--paper), 0 0 0 3px var(--gold);"
    : "box-shadow:0 3px 8px rgba(38,37,31,.4);";
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:9999px;background:var(--ink);border:2px solid var(--paper);${shadow}${scale}"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 2],
  });
}

function FitBounds({ trainers }: { trainers: Trainer[] }) {
  const map = useMap();
  useEffect(() => {
    if (!trainers.length) {
      map.setView([54.5, -3.2], 5);
      return;
    }
    if (trainers.length === 1) {
      map.setView([trainers[0].lat, trainers[0].lng], 11);
      return;
    }
    const bounds = L.latLngBounds(
      trainers.map((t) => [t.lat, t.lng] as [number, number]),
    );
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 11 });
  }, [trainers, map]);
  return null;
}

export default function TrainerMap({
  trainers,
  activeSlug,
  onHoverChange,
}: TrainerMapProps) {
  return (
    <MapContainer
      center={[54.5, -3.2]}
      zoom={5}
      scrollWheelZoom
      className="h-full w-full"
      style={{ background: "var(--linen)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds trainers={trainers} />
      {trainers.map((t) => {
        const active = t.slug === activeSlug;
        return (
          <Marker
            key={`${t.slug}-${active}`}
            position={[t.lat, t.lng]}
            icon={markerIcon(t.tier === "premium", active)}
            zIndexOffset={active ? 1000 : 0}
            eventHandlers={{
              mouseover: () => onHoverChange(t.slug),
              mouseout: () => onHoverChange(null),
            }}
          >
            <Popup>
              <div className="w-48 p-3">
                <p className="font-display text-body leading-tight text-ink">
                  {t.name}
                </p>
                <div className="mt-1.5 flex items-center gap-1.5">
                  <RatingStars rating={t.rating} size={12} />
                  <span className="font-data text-micro text-ink">
                    {t.rating.toFixed(1)}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-data text-small font-medium text-ink">
                    {formatGBP(t.fromPriceGBP)}
                  </span>
                  <Link
                    href={`/trainer/${t.slug}`}
                    className="text-micro font-medium text-ink underline underline-offset-2"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
