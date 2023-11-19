import StationPage from "@/app/stations/[id]/page";

export default async function Home() {
  return await StationPage({ params: {} });
}
