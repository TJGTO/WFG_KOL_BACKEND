// Run this in mongosh (or MongoDB Compass' shell), connected to the app's DB.
// Safe to re-run: it upserts by document_type instead of duplicating.

db.config.updateOne(
  { document_type: "jersey_buy_2026" },
  {
    $set: {
      document_type: "jersey_buy_2026",
      config: {
        sizes: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
        sizeChart: {
          XS: { chest: '34"', length: '25"' },
          S: { chest: '36"', length: '26"' },
          M: { chest: '38"', length: '27"' },
          L: { chest: '40"', length: '28"' },
          XL: { chest: '42"', length: '29"' },
          XXL: { chest: '44"', length: '30"' },
          XXXL: { chest: '46"', length: '31"' },
        },
        fabrics: [
          {
            id: "premium",
            label: "Premium",
            price: 499,
            description: "Lightweight, sweat-wicking performance fabric",
          },
          {
            id: "standard",
            label: "Standard",
            price: 349,
            description: "Durable, breathable everyday matchday fabric",
          },
        ],
        colors: [
          { id: "black", label: "Black", swatch: "#111111" },
          { id: "white", label: "White", swatch: "#FFFFFF" },
        ],
        imagePathTemplate: "/assets/jersey/{color}.png",
        pickupLocations: [
          {
            id: "location-1",
            name: "Chatakal, DUMDUM",
            mapUrl: "https://maps.app.goo.gl/S8HvjeUD2kk7Gbkf9",
          },
          {
            id: "location-2",
            name: "Akankha Futsal",
            mapUrl: "https://maps.app.goo.gl/vjtxTtrWvwvyJDbQ7",
          },
          {
            id: "location-3",
            name: "Gurgaon",
            mapUrl: "https://maps.google.com/?q=Kolkata",
          },
        ],
        homeDeliveryFee: 99,
        upiId: "7047241849@ybl",
        orderTimeline: [
          { label: "Order Collection", range: "6 Sep – 25 Sep" },
          { label: "At Factory", range: "26 Sep – 4 Oct" },
          { label: "Delivery Started", range: "5 Oct" },
        ],
        // code: what the buyer types in the Referral Code field.
        // referrer: who that code is attributed to.
        // playershare/groupshare: commission split (%) — groupshare is pooled
        // and divided by the admin panel (not built yet); playershare goes to
        // the referrer directly. Not yet used to calculate anything server-side.
        referralCodes: [
          {
            code: "EE123456",
            referrer: "NTFG",
            playershare: 6,
            groupshare: 4,
          },
        ],
      },
      updatedAt: new Date(),
    },
    $setOnInsert: { createdAt: new Date() },
  },
  { upsert: true }
);
