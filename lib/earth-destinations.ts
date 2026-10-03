import type { Language } from '@/app/content';

export type EarthLocalizedText = Record<Language, string>;

/** Globe summaries are supplied by the verified university catalogue, never estimated. */
export interface EarthDestination {
  code: string;
  slug?: string;
  name: EarthLocalizedText;
  lat: number;
  lng: number;
  universityCount?: number;
  popularFields?: EarthLocalizedText[];
  tuition?: {
    label: EarthLocalizedText;
    sourceTitle: string;
    sourceUrl: string;
    verifiedAt: string;
  } | null;
}

export type {EarthDestination as default};

export const earthDestinations: EarthDestination[] = [
  { code: 'TR', slug: 'turkiye', name: { en: 'Türkiye', tr: 'Türkiye', fa: 'ترکیه' }, lat: 39, lng: 35 },
  { code: 'DE', slug: 'germany', name: { en: 'Germany', tr: 'Almanya', fa: 'آلمان' }, lat: 51, lng: 10 },
  { code: 'NL', slug: 'netherlands', name: { en: 'Netherlands', tr: 'Hollanda', fa: 'هلند' }, lat: 52.1, lng: 5.3 },
  { code: 'CY', slug: 'cyprus', name: { en: 'Cyprus', tr: 'Kıbrıs', fa: 'قبرس' }, lat: 35, lng: 33.4 },
  { code: 'CN', slug: 'china', name: { en: 'China', tr: 'Çin', fa: 'چین' }, lat: 35, lng: 104 },
  { code: 'RU', slug: 'russia', name: { en: 'Russia', tr: 'Rusya', fa: 'روسیه' }, lat: 58, lng: 65 },
  { code: 'ES', slug: 'spain', name: { en: 'Spain', tr: 'İspanya', fa: 'اسپانیا' }, lat: 40, lng: -4 },
];

export type EarthCountryGeometry = {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
};

/** Longitude wrapping matters for Russia's polygons at the antimeridian. */
export function pointInCountry(lng: number, lat: number, geometry: EarthCountryGeometry): boolean {
  const polygons = geometry.type === 'Polygon'
    ? [geometry.coordinates as number[][][]]
    : geometry.coordinates as number[][][][];
  const insideRing = (ring: number[][]) => {
    let inside = false;
    const near = (longitude: number) => {
      let delta = longitude - lng;
      while (delta > 180) delta -= 360;
      while (delta < -180) delta += 360;
      return lng + delta;
    };
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const xi = near(ring[i][0]), yi = ring[i][1];
      const xj = near(ring[j][0]), yj = ring[j][1];
      if (((yi > lat) !== (yj > lat)) && lng < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  };
  return polygons.some(polygon => insideRing(polygon[0]) && !polygon.slice(1).some(insideRing));
}
