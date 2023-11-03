import { Destinations } from "@/types";
import fs from "node:fs/promises";

export default async function Home({ params }: { params: { id: string } }) {
  const rawDestinations = await fs.readFile(`data/${params.id}.json`, "utf-8");
  const destinations = JSON.parse(rawDestinations) as Destinations;

  return (
    <main>
      <ul>
        {Object.entries(destinations).map(([station, data]) => (
          <li key={station}>
            {station}: {data.duration} with {data.line} switching {data.changed}
          </li>
        ))}
      </ul>
    </main>
  );
}
