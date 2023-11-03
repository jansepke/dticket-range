export interface Destination {
  duration: number;
  line: string;
  changed: number;
}

export interface Destinations {
  [station: string]: Destination;
}
