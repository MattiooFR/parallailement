import type { Stage } from "./stage-data";

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
