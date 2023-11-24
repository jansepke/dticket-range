declare module "db-hafas" {
  import { WithRequired } from "@/types/util";
  import { HafasClient } from "hafas-client";

  export function createDbHafas(userAgent: string): WithRequired<HafasClient, "trip">;
}
