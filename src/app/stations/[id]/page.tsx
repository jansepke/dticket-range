import { Map } from "@/app/stations/[id]/Map";
import { getStations } from "@/data/stations";
import { Destinations } from "@/types";
import Stack from "@mui/material/Stack";
import fs from "node:fs/promises";
import { ConfigurationForm } from "./ConfigurationForm";

interface StationPageParams {
  id?: string;
}

export default async function StationPage({ params }: { params: StationPageParams }) {
  const stations = await getStations();

  const start = stations
    .map((s) => ({ id: s.id, station: s.name, lat: s.location.lat, lng: s.location.lng }))
    .find((s) => s.id === params.id);
  const destinations: Destinations = params.id ? await getDestinations(params.id) : {};

  return (
    <Stack sx={{ height: "100vh" }}>
      <ConfigurationForm currentStation={params.id} stations={stations.map((s) => ({ label: s.name, id: s.id }))} />
      <Map
        start={start}
        destinations={Object.entries(destinations).flatMap(([id, data]) => {
          const station = stations.find((s) => s.id === id);
          // TODO: why are some stations missing?
          if (!station) {
            return [];
          }

          return { station: station.name, lat: station.location.lat, lng: station.location.lng, ...data };
        })}
      />
    </Stack>
  );
}

async function getDestinations(id: string) {
  const rawDestinations = await fs.readFile(`data/destinations/${id}.json`, "utf-8");
  return JSON.parse(rawDestinations) as Destinations;
}

export async function generateStaticParams(): Promise<StationPageParams[]> {
  return await getStations();
}
