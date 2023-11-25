export interface Destination {
  duration: number;
  line: string;
  changed: number;
}

export interface Destinations {
  [station: string]: Destination;
}

export interface Station {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  city: String;
}

export interface Connection {
  line: string;
  from: string;
  to: string;
  duration: number;
  pause: number;
}
