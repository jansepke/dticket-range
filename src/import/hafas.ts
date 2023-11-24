/// <reference path="../types/db-hafas.d.ts" />
import { createDbHafas } from "db-hafas";
import { RAlternative, RTrip } from "@/types/hafas-client";

const hafas = createDbHafas("jansepke");

const ignoreProducts = [
  "Bus", // Train Replacement Bus
  "FLX", // FlixTrain
  "PRE", // Pressnitztalbahn
  "IRE", // DB Regio AG Zusatzzug
  "D", // Sylt Shuttle Plus
  "R", // Ceske Drahy
  "Os", // Ceske Drahy
  "EN", // NightTrains to Sweden ???
  "CLR", // Cargo Logistik Rail Service GmbH
  "KD", // Koleje Dolnoslaskie
  "REX", // Österreichische Bundesbahnen
  "IR", // SBB
  "WB", // WESTbahn
  "DBK", // DBK Historische Bahn
];

const validProductName = (productName?: string) => !!productName && !ignoreProducts.includes(productName);
const validForDTicket = (d: RAlternative) => validProductName(d.line.productName);

export const getDepartures = async (stationId: string): Promise<RAlternative[]> => {
  // TODO: search for next 7 dates
  try {
    const departures = await hafas.departures(stationId, {
      when: new Date(new Date().getTime() + 86400000),
      duration: 24 * 60, // 24h
      products: {
        nationalExpress: false,
        national: false,
        regionalExpress: true,
        regional: true,
        suburban: false,
        bus: false,
        ferry: false,
        subway: false,
        tram: false,
        taxi: false,
      },
      remarks: false,
    });

    return (departures.departures as RAlternative[]).filter(validForDTicket);
  } catch (error) {
    if (error instanceof Error && error.toString() !== "Error: LOCATION: location/stop not found") {
      console.error(stationId, error.toString());
    }
    return [];
  }
};

export const getTrip = async (tripId: string): Promise<RTrip> => {
  try {
    const trip = await hafas.trip(tripId, {});

    return trip.trip as RTrip;
  } catch (error) {
    console.error(tripId, error);
    throw error;
  }
};
