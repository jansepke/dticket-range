export interface Destinations {
  [station: string]: {
    duration: number;
    line: string;
    changed: number;
  };
}
