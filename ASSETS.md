# Visual assets

User-supplied main logo: `public/brand/creator-logo.png` (original PNG preserved).

Service-specific editorial photographs: `public/images/services/*.jpg`. Source URLs are recorded in `public/images/services/sources.json`; Unsplash licence https://unsplash.com/license. These represent service categories, not claimed partner premises or staff.

Two original editorial assets were generated using the built-in image generation tool, one image per request, then encoded to WebP for delivery:

- `public/images/international-hero.webp` from `/Users/mehrad/Downloads/creator-group/generated-assets/international-airport-hero.png`: premium editorial photography, international airport architecture and traveller, cinematic composition, no logos, no text, no invented institutional association.
- `public/images/international-journal.webp` from `/Users/mehrad/Downloads/creator-group/generated-assets/travel-study-flatlay.png`: premium editorial flat lay of travel/study planning, notebook and generic documents, no readable personal data, no text or logos.

The globe and orbital network are code-native canvas visuals in `app/international-network.tsx`, with reduced-motion support and offscreen animation suspension.

Campus images: six verified real campuses in `public/images/universities/`; exact URLs and source pages in `sources.json`. University/source owners retain image rights; no partnership or blanket reuse licence is claimed. Flags: locally hosted SVGs from https://flagcdn.com/. Separate dentistry and treatment stock photos use Unsplash; sources and licence are in `public/images/services/medical-sources.json`.
