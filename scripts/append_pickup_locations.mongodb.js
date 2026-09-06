// Appends these 3 pickup locations to the EXISTING config.pickupLocations
// array (does not touch/remove what's already there).
// Uses $addToSet so re-running this exact script won't duplicate entries.

db.config.updateOne(
  { document_type: "jersey_buy_2026" },
  {
    $addToSet: {
      "config.pickupLocations": {
        $each: [
          {
            id: "location-5",
            name: "Chatakal, DUMDUM",
            mapUrl: "https://maps.app.goo.gl/S8HvjeUD2kk7Gbkf9",
          },
          {
            id: "location-6",
            name: "Akankha Futsal",
            mapUrl: "https://maps.app.goo.gl/vjtxTtrWvwvyJDbQ7",
          },
          {
            id: "location-7",
            name: "Gurgaon",
            mapUrl: "https://maps.google.com/?q=Kolkata",
          },
        ],
      },
    },
    $set: { updatedAt: new Date() },
  }
);
