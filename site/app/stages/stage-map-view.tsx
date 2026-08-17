"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  Map as MapLibreMap,
  Marker,
  NavigationControl,
  Popup,
} from "maplibre-gl";
import { stagesToGeoJson } from "@/lib/stage-map";
import type { Stage } from "@/lib/stages";

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function dateRange(startDate: string, endDate: string) {
  const start = dateFormatter.format(new Date(`${startDate}T12:00:00Z`));
  const end = dateFormatter.format(new Date(`${endDate}T12:00:00Z`));
  return startDate === endDate ? start : `${start} → ${end}`;
}

export function StageMapView({ stages }: { stages: Stage[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const data = useMemo(() => stagesToGeoJson(stages), [stages]);
  const mappedCount = data.features.length;

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    const map = new MapLibreMap({
      container: containerRef.current,
      center: [7.5, 45.3],
      zoom: 4.2,
      maxZoom: 15,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm", type: "raster", source: "osm" }],
      },
    });
    mapRef.current = map;
    map.addControl(new NavigationControl(), "top-right");

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    const groups = new Map<string, typeof data.features>();
    for (const feature of data.features) {
      const [longitude, latitude] = feature.geometry.coordinates;
      const key = `${longitude.toFixed(3)}:${latitude.toFixed(3)}`;
      const group = groups.get(key) ?? [];
      group.push(feature);
      groups.set(key, group);
    }

    markersRef.current = Array.from(groups.values()).map((features) => {
      const [longitude, latitude] = features[0].geometry.coordinates;
      const button = document.createElement("button");
      const allFull = features.every((feature) => feature.properties.availability === "full");
      button.type = "button";
      button.className = `stage-map-marker${allFull ? " stage-map-marker--full" : ""}`;
      button.textContent = features.length > 1 ? String(features.length) : "";
      button.setAttribute(
        "aria-label",
        `${features.length} stage${features.length > 1 ? "s" : ""} à ${features[0].properties.location}`,
      );

      const wrapper = document.createElement("div");
      wrapper.className = "stage-map-popup";
      const place = document.createElement("strong");
      place.textContent = `${features[0].properties.location} · ${features[0].properties.country}`;
      wrapper.append(place);
      for (const feature of features.slice(0, 6)) {
        const item = document.createElement("div");
        item.className = "stage-map-popup__item";
        const link = document.createElement("a");
        link.href = feature.properties.sourceUrl;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = feature.properties.title;
        const dates = document.createElement("span");
        dates.textContent = dateRange(
          feature.properties.startDate,
          feature.properties.endDate,
        );
        item.append(link, dates);
        wrapper.append(item);
      }
      if (features.length > 6) {
        const more = document.createElement("span");
        more.textContent = `+ ${features.length - 6} autres dates à ce lieu`;
        wrapper.append(more);
      }
      const popup = new Popup({ offset: 18, maxWidth: "22rem" }).setDOMContent(wrapper);

      return new Marker({ element: button, anchor: "center" })
        .setLngLat([longitude, latitude])
        .setPopup(popup)
        .addTo(map);
    });
  }, [data]);

  return (
    <div className="border-t border-stone-300 py-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-stone-600">
        <p>
          <span className="font-medium text-stone-900">{mappedCount}</span> stage{mappedCount > 1 ? "s" : ""} placé{mappedCount > 1 ? "s" : ""} sur la carte
        </p>
        {mappedCount < stages.length && (
          <p>{stages.length - mappedCount} lieu{stages.length - mappedCount > 1 ? "x" : ""} encore trop imprécis</p>
        )}
      </div>
      <div
        ref={containerRef}
        className="h-[68vh] min-h-[32rem] w-full overflow-hidden rounded-sm border border-stone-300 bg-stone-200"
        aria-label="Carte des stages de parapente"
      />
    </div>
  );
}
