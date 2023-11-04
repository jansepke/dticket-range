import { readStations } from "db-stations";

export const collect = async <T>(iterator: Iterable<T>) => {
  const items = [];
  for await (const item of iterator) {
    items.push(item);
  }
  return items;
};

const stations = collect(readStations());
export const getStations = () => stations;
