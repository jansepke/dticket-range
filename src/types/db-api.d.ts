export interface DBAPIEvaNumbers {
  isMain: boolean;
  number?: number;
  geographicCoordinates?: {
    coordinates?: [number, number];
  };
}

export interface DBAPIStation {
  name: string;
  evaNumbers: DBAPIEvaNumbers[];
  mailingAddress: { city: string };
}

export interface DBAPIStationResponse {
  result: DBAPIStation[];
}
