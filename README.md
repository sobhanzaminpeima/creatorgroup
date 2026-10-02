# Creator Group

International services website in Persian, English and Turkish, with the original AI services website preserved under `/[lang]/services`.

## Hostinger

Use Node.js Web App, not a static public_html upload.

```sh
npm install
npm run build:hostinger
npm run start:hostinger
```

Set `NEXT_PUBLIC_SITE_URL` before building and `CREATOR_DATA_DIR` to a private persistent directory. Full Persian deployment instructions: [HOSTINGER.md](HOSTINGER.md). Page and feature inventory: [IMPLEMENTATION.md](IMPLEMENTATION.md).

## Existing Sites preview

```sh
pnpm install --frozen-lockfile
pnpm run dev
```

`pnpm run build` builds the existing Sites/Cloudflare target. Hostinger must use the dedicated commands above.

## University prices

The supplied 2026–2027 fee schedules cover Fenerbahçe, Beykoz, İstanbul Kent, İstanbul Medipol, İstanbul Atlas and İstanbul Topkapı. Both Medipol versions are preserved because their discounts differ. Atlas offer validity needs confirmation. The site provides original documents and source references; it does not promise current scholarship eligibility.

Contacts and legal details must be supplied before public operations. Inquiries are persisted; the site does not execute payments, hotel bookings or admissions.
