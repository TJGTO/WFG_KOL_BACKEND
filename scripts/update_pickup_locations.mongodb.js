// Replaces the pickupLocations field on the existing jersey_buy_2026 config
// document. Safe to re-run.
//
// NOTE: "Turf XL" and "Turf Lane" currently share the exact same mapUrl —
// almost certainly a copy-paste mistake since they should be different
// physical spots. Fix the duplicate before running this if so.

db.config.updateOne(
  { document_type: "jersey_buy_2026" },
  {
    $set: {
      "config.pickupLocations": [
        {
          id: "location-1",
          name: "Turf XL",
          mapUrl: "https://maps.app.goo.gl/9BnN9BKzPAhKfaQJ6",
        },
        {
          id: "location-2",
          name: "Turf Lane",
          mapUrl: "https://maps.app.goo.gl/9BnN9BKzPAhKfaQJ6",
        },
        {
          id: "location-3",
          name: "Turf Hopper",
          mapUrl: "https://maps.app.goo.gl/NUmNxSBM7hkqftdP9",
        },
        {
          id: "location-4",
          name: "Lakeside Sector-62",
          mapUrl: "https://maps.app.goo.gl/1d7CuSVYzcVtpmWA7",
        },
      ],
      updatedAt: new Date(),
    },
  }
);
