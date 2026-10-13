/* ============================================================
   TEMPLATE 4 PREMIUM — CLIENT CONFIG (Rafi weds Tahmina)
   ------------------------------------------------------------
   ONE object holds every value the page's script needs: the
   couple, both events, the venue, photos, ambient audio and the
   RSVP. Display copy (invitation wording, order-of-the-day items,
   Bangla text, footer verse) is hand-set in index.html — each
   section there is marked with a <!-- ===== --> comment.
   Edit this file first when reusing the template.
   ============================================================ */

const INVITE_CONFIG = {

  /* ---------- Events ----------
     ISO datetimes with the Dhaka timezone (UTC+6).
     `weddingDateTime` is the FIRST event — it drives the live
     countdown (which retargets to the Walima after the Nikah)
     and the Add-to-Calendar file.                             */
  weddingDateTime: "2026-11-20T11:00:00+06:00",   // Nikah — Friday, 20 November 2026, 11:00 AM

  events: {
    nikah: {
      label: "Nikah (Aqd)",
      dateTime: "2026-11-20T11:00:00+06:00",
      durationHours: 3,                   // ceremony and lunch end around 2 PM
    },
    walima: {
      label: "Walima",
      dateTime: "2026-11-21T19:00:00+06:00",   // Saturday, 21 November 2026, 7:00 PM
      durationHours: 3,                   // ends around 10 PM
    },
  },

  /* ---------- RSVP deadline ----------
     Displayed on the RSVP card. Guests can still reply after it
     passes — treat it as a courtesy date, not a lock.          */
  rsvpDeadline: "2026-11-01T23:59:00+06:00",

  /* ---------- Venue ----------
     `mapsQuery` feeds the "Get directions" button (a Google Maps
     search link, opened in a new tab).                        */
  venue: {
    name: "Sample Community Hall",
    address: "Sample Community Hall, Road 12, Dhanmondi, Dhaka 1209, Bangladesh",
    mapsQuery: "Sample Community Hall, Road 12, Dhanmondi, Dhaka",
  },

  /* ---------- The Couple — optional photo slot ----------
     The Couple section is faceless by design: calligraphic
     monogram medallions drawn inline in the page. To show real
     portraits instead, set `enabled: true` and drop photos into
     assets/photos/ (portrait ~900×1200, jpg/webp) — or keep the
     shipped placeholder artwork and just flip the flag. If a
     photo file is missing or fails to load, the monogram
     returns automatically.                                    */
  photos: {
    enabled: false,
    groom: "assets/photos/groom.svg",
    bride: "assets/photos/bride.svg",
  },

  /* ---------- Ambient audio ----------
     mode: "silent"  — no audio at all; the layer stays fully inert
                       (no button, no toggle)
           "single"  — one looping ambient bed
           "layered" — the bed + a soft layer underneath
     volume: master level, kept low (0 – 1). Audio never
     autoplays: it starts only if the guest turns on "Enable
     ambient sound" on the opening screen, or presses the floating
     sound button afterwards. The choice is kept in memory only —
     never in localStorage — so a reload starts silent again.
     The shipped bed is the royalty-free "BARAKAH" background
     nasheed (assets/audio/barakah.mp3). The optional layer path is
     a placeholder — drop a looping mp3 at assets/audio/ to make it
     audible. Missing files are handled silently.              */
  audio: {
    mode: "single",                       // "silent" | "single" | "layered"
    volume: 0.3,                          // low by default
    tracks: {
      bed:   "assets/audio/barakah.mp3",
      layer: "assets/audio/hum-soft.mp3",
    },
  },

  /* ---------- Add-to-Calendar (.ics) ----------
     One button generates a single .ics holding BOTH events.
     Commas in titles, locations and descriptions are escaped
     automatically.                                            */
  calendar: {
    location: "Sample Community Hall, Road 12, Dhanmondi, Dhaka, Bangladesh",
    filename: "rafi-weds-tahmina.ics",
    prodid: "Rafi weds Tahmina",
  },

  /* ---------- RSVP ----------
     Replies are remembered in the guest's own browser
     (localStorage) so a returning guest can update their reply.
     They are NOT sent anywhere — see the README if you need
     delivery to the couple (WhatsApp / Formspree).
     maxParty caps the guests stepper.
     songRequest adds the optional song-request field when true;
     it ships false — there is no song field by default.        */
  rsvp: {
    storageKey: "rt_rsvp_v1",
    maxParty: 8,
    songRequest: false,
  },
};

/* Export for reuse; safe to ignore in the browser. */
if (typeof module !== "undefined") {
  module.exports = INVITE_CONFIG;
}
