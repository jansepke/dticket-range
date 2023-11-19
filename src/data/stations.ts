import { Station } from "@/types";
import fs from "node:fs/promises";

const stationsPromise = fs.readFile("data/stations.json", "utf-8").then((data) => JSON.parse(data) as Station[]);
export const getStations = async () => await stationsPromise;
