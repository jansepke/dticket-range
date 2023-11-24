import { createDbHafas } from "db-hafas";

export const hafas = createDbHafas("jansepke");

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

const validProductName = (productName) => !!productName && !ignoreProducts.includes(productName);
const validForDTicket = (d) => validProductName(d.line.productName);

export const getDepartures = async (stationId) => {
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

    // for (const departure of departures.departures) {
    //   if (departure.line.id === "rex-1") {
    //     console.log(departure);
    //   }
    // }

    return departures.departures.filter(validForDTicket);
  } catch (error) {
    if (error.toString() !== "Error: LOCATION: location/stop not found") {
      console.error(stationId, error.toString());
    }
    return [];
  }
};

export const getTrip = async (tripId) => {
  try {
    const trip = await hafas.trip(tripId);

    return trip.trip;
  } catch (error) {
    console.error(tripId, error.toString());
  }
};
