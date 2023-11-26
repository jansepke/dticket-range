"use client";
import { Destination } from "@/types";
import { Wrapper } from "@googlemaps/react-wrapper";
import Box from "@mui/material/Box";
import React, { useEffect, useRef } from "react";

interface DestinationForMap extends Destination {
  station: string;
  lat: number;
  lng: number;
}

interface MapProps {
  start?: { station: string; lat: number; lng: number };
  destinations: DestinationForMap[];
}

export const Map: React.FC<MapProps> = (props) => {
  return (
    <Wrapper apiKey="AIzaSyBfGWxAFqcdu_sRuu3nHeRcqIuotkjLaFU">
      <InnerMap {...props} />
    </Wrapper>
  );
};

const InnerMap: React.FC<MapProps> = ({ start, destinations }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const map = new window.google.maps.Map(ref.current, {
        center: new google.maps.LatLng({ lat: 51, lng: 10 }),
        zoom: 6.5,
        mapTypeControl: false,
        streetViewControl: false,
      });

      var bounds = new google.maps.LatLngBounds();

      const infowindow = new google.maps.InfoWindow();

      if (start) {
        new google.maps.Marker({
          map,
          position: { lat: start.lat, lng: start.lng },
          title: start.station,
          icon: "https://maps.gstatic.com/mapfiles/ms2/micons/rangerstation.png",
        });
        bounds.extend(start);
      }

      for (const destination of destinations) {
        const marker = new google.maps.Marker({
          map,
          position: { lat: destination.lat, lng: destination.lng },
          title: destination.station,
        });

        const description = `${destination.station} in ${formatDuration(destination.duration)}<br />
        by ${destination.line} ${destination.changed.length > 0 ? `<br /> via ${destination.changed.join(", ")}` : ""}`;

        marker.addListener("click", () => {
          infowindow.setContent(description);
          infowindow.open({ anchor: marker, map });
        });

        bounds.extend(destination);
      }

      if (destinations.length > 0) {
        map.fitBounds(bounds);
      }
    }
  }, [ref, destinations, start]);

  return <Box sx={{ flexGrow: 1 }} ref={ref} />;
};

function formatDuration(duration: number) {
  return Math.round(duration / 60) + "min";
}
