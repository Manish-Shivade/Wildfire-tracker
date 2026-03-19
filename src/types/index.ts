export interface Geometry {
  magnitudeValue: number | null;
  magnitudeUnit: string | null;
  date: string;
  type: 'Point' | 'Polygon';
  coordinates: number[] | number[][][];
}

export interface Category {
  id: string;
  title: string;
}

export interface Source {
  id: string;
  url: string;
}

export interface WildfireEvent {
  id: string;
  title: string;
  description: string;
  link: string;
  closed: string | null;
  categories: Category[];
  sources: Source[];
  geometry: Geometry[];
}

export interface EONETResponse {
  title: string;
  description: string;
  link: string;
  events: WildfireEvent[];
}
