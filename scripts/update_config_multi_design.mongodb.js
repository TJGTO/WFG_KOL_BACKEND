// Replaces the whole jersey_buy_2026 config with a multi-design structure:
// fabrics (with pricing) and the image path template now live PER DESIGN,
// since price and artwork both depend on which design is picked, not just
// color/fabric. `colors` and everything else stay shared across designs.
//
// Also fixes a typo in the existing data: the FIRSTDAY10 referral code had
// "refferer" instead of "referrer" — the app reads the "referrer" field, so
// that entry's attribution was silently broken (would show as undefined).
//
// Safe to re-run.

db.config.updateOne(
  { document_type: "jersey_buy_2026" },
  {
    $set: {
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
        // Order matters — the frontend defaults to designs[0] on first
        // load, so Durga Puja Edition (the featured/seasonal one) goes first.
        designs: [
          {
            id: "design-2",
            label: "WFG Durga Puja Edition",
            imagePathTemplate: "/assets/jersey/design-2/{color}.jpg",
            fabrics: [
              {
                id: "premium",
                label: "Premium",
                price: 549,
                description: "Lightweight, sweat-wicking performance fabric",
              },
              {
                id: "standard",
                label: "Standard",
                price: 399,
                description: "Durable, breathable everyday matchday fabric",
              },
            ],
          },
          {
            id: "design-1",
            label: "WFG Annual Jersey",
            imagePathTemplate: "/assets/jersey/design-1/{color}.png",
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
          },
        ],
        colors: [
          { id: "black", label: "Black", swatch: "#111111" },
          { id: "white", label: "White", swatch: "#FFFFFF" },
        ],
        pickupLocations: [
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
        ],
        homeDeliveryFee: 99,
        upiId: "7047241849@ybl",
        orderTimeline: [
          { label: "Order Collection", range: "6 Sep – 25 Sep" },
          { label: "At Factory", range: "26 Sep – 4 Oct" },
          { label: "Delivery Started", range: "5 Oct" },
        ],
        referralCodes: [
          { code: "EE123456", referrer: "NTFG", playershare: 10, groupshare: 0 },
          { code: "WFGCORE30", referrer: "WFGCORE", playershare: 30, groupshare: 0 },
          { code: "MORNING2026", referrer: "Morning Legends", playershare: 10, groupshare: 0 },
          { code: "NFF2026", referrer: "NFF", playershare: 10, groupshare: 0 },
          // fixed: "refferer" -> "referrer" (was a typo in the previous document)
          { code: "FIRSTDAY10", referrer: "Firstday", playershare: 10, groupshare: 0 },
        ],
      },
      updatedAt: new Date(),
    },
  }
);
