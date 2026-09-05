// Adds/replaces just the referralCodes field on the existing jersey_buy_2026
// config document. Safe to re-run.
//
// code: what the buyer types in the Referral Code field.
// referrer: who that code is attributed to.
// playershare/groupshare: commission split (%) — groupshare is pooled and
// divided by the admin panel (not built yet); playershare goes to the
// referrer directly. Not yet used to calculate anything server-side.

db.config.updateOne(
  { document_type: "jersey_buy_2026" },
  {
    $set: {
      "config.referralCodes": [
        {
          code: "EE123456",
          referrer: "NTFG",
          playershare: 6,
          groupshare: 4,
        },
      ],
      updatedAt: new Date(),
    },
  }
);
