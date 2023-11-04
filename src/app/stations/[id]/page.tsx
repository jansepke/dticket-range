import { Map } from "@/app/stations/[id]/Map";
import { getStations } from "@/data/stations";
import { Destinations } from "@/types";
import fs from "node:fs/promises";
import path from "node:path";

export default async function Home({ params }: { params: { id: string } }) {
  const stations = await getStations();
  const rawDestinations = await fs.readFile(`data/${params.id}.json`, "utf-8");
  const destinations = JSON.parse(rawDestinations) as Destinations;

  return (
    <main>
      <Map
        destinations={Object.entries(destinations).flatMap(([id, data]) => {
          const station = stations.find((s) => s.id === id);
          // TODO: why are some stations missing?
          if (!station) {
            return [];
          }

          return { station: station.name, lat: station.location.latitude, lng: station.location.longitude, ...data };
        })}
      />
    </main>
  );
}

export async function generateStaticParams() {
  const files = await fs.readdir("data");

  return files.map((f) => ({ id: path.basename(f).replace(".json", "") }));
}
