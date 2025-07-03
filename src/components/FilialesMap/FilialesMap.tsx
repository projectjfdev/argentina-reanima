"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L, { LatLngTuple, Icon } from "leaflet";

// Definimos el tipo para cada filial
interface Branch {
  name: string;
  coords: LatLngTuple;
}

// Lista de filiales
const branches: Branch[] = [
  { name: "Ushuaia", coords: [-54.8019, -68.303] },
  { name: "Río Grande", coords: [-53.7877, -67.7095] },
  { name: "Mar del Plata", coords: [-38.0055, -57.5426] },
  { name: "Puerto Iguazú", coords: [-25.5991, -54.5736] },
  { name: "Río Tercero", coords: [-32.1794, -64.1061] },
  { name: "Lobería", coords: [-38.1671, -58.7898] },
  { name: "La Plata", coords: [-34.9214, -57.9544] },
];

// Ícono personalizado
const logoIcon: Icon = L.icon({
  iconUrl: "/logo/logo.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

export default function FilialesMap() {
  return (
    <MapContainer
      center={[-38.4161, -63.6167]}
      zoom={4}
      scrollWheelZoom={false}
      className="h-[80vh] w-screen md:w-[50vw]"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {branches.map((branch, index) => (
        <Marker key={index} position={branch.coords} icon={logoIcon}>
          <Popup>{branch.name}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
