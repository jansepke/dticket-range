"use client";
import { Destination, Destinations } from "@/types";
import { Wrapper } from "@googlemaps/react-wrapper";
import React, { useEffect, useRef, useState } from "react";

interface DestinationForMap extends Destination {
  station: string;
  lat: number;
  lng: number;
}

interface MapProps {
  destinations: DestinationForMap[];
}

export const Map: React.FC<MapProps> = ({ destinations }) => {
  return (
    <Wrapper apiKey="AIzaSyBfGWxAFqcdu_sRuu3nHeRcqIuotkjLaFU">
      <InnerMap destinations={destinations} />
    </Wrapper>
  );
};

const InnerMap: React.FC<MapProps> = ({ destinations }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const map = new window.google.maps.Map(ref.current, {
        center: new google.maps.LatLng({ lat: 53.5506201, lng: 9.9545555 }),
        zoom: 7,
      });

      for (const destination of destinations) {
        new google.maps.Marker({
          map,
          position: { lat: destination.lat, lng: destination.lng },
          title: `${destination.station} in ${formatDuration(destination.duration)} by ${destination.line} (${
            destination.changed
          } changes)`,
        });
      }
    }
  }, [ref, destinations]);

  return <div style={{ height: 400, width: 500 }} ref={ref} />;
};

function formatDuration(duration: number) {
  return Math.round(duration / 60) + "min";
}
