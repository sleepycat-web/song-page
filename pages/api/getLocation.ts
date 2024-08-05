import type { NextApiRequest, NextApiResponse } from "next";

type Location = {
  name: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  radius: number; // in meters
};

const locations: Location[] = [
  {
    name: "Dagapur",
    coordinates: { latitude: 26.749527184470193, longitude: 88.3937724490724 }, // Approximate coordinates
    radius: 1000, // 1km radius
  },
  {
    name: "Sevoke Road",
    coordinates: { latitude: 26.747152888772344, longitude: 88.43802366441821 }, // Approximate coordinates original ,


    radius: 1000, // 1km radius
  },
];

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ location: string | null }>
) {
  if (req.method === "POST") {
    const { latitude, longitude } = req.body;

    for (const location of locations) {
      const distance = calculateDistance(
        latitude,
        longitude,
        location.coordinates.latitude,
        location.coordinates.longitude
      );

      if (distance <= location.radius) {
        return res.status(200).json({ location: location.name });
      }
    }

    res.status(200).json({ location: null });
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
