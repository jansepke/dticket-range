import { WithRequired } from "@/types/util";
import { Alternative, Trip } from "hafas-client";

type RTrip = WithRequired<WithRequired<Trip, "line">, "stopovers">;
type RAlternative = WithRequired<Alternative, "line">;
