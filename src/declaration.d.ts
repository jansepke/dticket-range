declare module "db-stations" {
  interface Station {
    id: string;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
  }

  function readStations(): Iterable<Station>;
}
