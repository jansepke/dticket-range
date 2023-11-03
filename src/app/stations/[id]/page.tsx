import { getStations } from "@/data/stations";
import { Destinations } from "@/types";
import fs from "node:fs/promises";

export default async function Home({ params }: { params: { id: string } }) {
  const stations = await getStations();
  const rawDestinations = await fs.readFile(`data/${params.id}.json`, "utf-8");
  const destinations = JSON.parse(rawDestinations) as Destinations;
  console.log(stations[0]);

  return (
    <main>
      <ul>
        {Object.entries(destinations).map(([station, data]) => (
          <li key={station}>
            {stations.find((s) => s.id === station)!.name}: {formatDuration(data.duration)} switching {data.changed}
          </li>
        ))}
      </ul>
    </main>
  );
}

function formatDuration(duration: number) {
  return Math.round(duration / 60) + "min";
}
