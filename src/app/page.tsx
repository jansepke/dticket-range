// @ts-ignore
import { readStations } from "db-stations";
import { collect } from "../../scripts/util.mjs";
import Link from "next/link";

export default async function Home() {
  // TODO: remove stations without file
  const stations = await collect(readStations());

  return (
    <main>
      <ul>
        {stations.map((station) => (
          <li key={station.id}>
            <Link href={`/stations/${station.id}`}>{station.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
