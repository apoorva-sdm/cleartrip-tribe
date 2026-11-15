import type { Place } from "@/domain";

export interface PlaceRepository {
  listPlaces(): Promise<Place[]>;
}
