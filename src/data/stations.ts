import { Station } from "@/types";
import fs from "node:fs/promises";
import path from "node:path";

const stationsPromise = fs.readFile("data/stations.json", "utf-8").then(async (data) => {
  const files = await fs.readdir("data/destinations");
  const validStationIds = files.filter((f) => f.endsWith(".json")).map((f) => path.basename(f).replace(".json", ""));

  const stations = JSON.parse(data) as Station[];
  return stations.filter((s) => validStationIds.includes(s.id)).sort(sortStations);
});

export const getStations = async () => await stationsPromise;

function sortStations(a: Station, b: Station): number {
  const aName = cleanName(a.name);
  const bName = cleanName(b.name);
  return aName.localeCompare(bName);
}

function cleanName(name: string) {
  return name.replaceAll("-", " ").replaceAll("(", "").replaceAll(")", "");
}

export const getStationIds = async () => {
  const stations = JSON.parse(await fs.readFile("data/stations.json", "utf-8")) as Station[];
  return stations.map((s) => s.id);
};
