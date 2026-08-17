import type { Stage } from "./stage-data";

export const STAGE_MAP_PREVIEW_LIMIT = 6;

export function getStageMapPopupItems<
  T extends { properties: { id: string; startDate: string } },
>(items: T[], expanded: boolean) {
  const sortedItems = [...items].sort(
    (left, right) =>
      left.properties.startDate.localeCompare(right.properties.startDate) ||
      left.properties.id.localeCompare(right.properties.id),
  );

  return {
    visibleItems: expanded
      ? sortedItems
      : sortedItems.slice(0, STAGE_MAP_PREVIEW_LIMIT),
    hiddenCount: expanded
      ? 0
      : Math.max(0, sortedItems.length - STAGE_MAP_PREVIEW_LIMIT),
  };
}

export function stagesToGeoJson(stages: Stage[]) {
  return {
    type: "FeatureCollection" as const,
    features: stages.flatMap((stage) => {
      if (
        !Number.isFinite(stage.latitude) ||
        !Number.isFinite(stage.longitude)
      ) {
        return [];
      }
      return [
        {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [stage.longitude as number, stage.latitude as number],
          },
          properties: {
            id: stage.id,
            title: stage.translatedTitle || stage.title,
            originalTitle: stage.originalTitle || stage.title,
            organizer: stage.organizer,
            location: stage.location,
            country: stage.country,
            startDate: stage.startDate,
            endDate: stage.endDate,
            availability: stage.availability,
            sourceUrl: stage.sourceUrl,
          },
        },
      ];
    }),
  };
}
