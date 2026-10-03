> Current configuration: automatic lead notifications use email (see EMAIL.md). WhatsApp sending is disabled unless LEAD_NOTIFICATION_CHANNEL=whatsapp is explicitly set; the website forms currently call the email notifier.

# WhatsApp lead notifications

Recipient: +90 531 362 69 88. International and Creator services forms save the lead first, then enqueue a notification. Without API configuration, only the prepared-message button is active: the visitor opens WhatsApp and presses Send. A phone number alone does not enable automatic messaging.

## Activate automatic sending on Hostinger

Create/connect a WhatsApp Business Platform sender, authorize the recipient to receive notifications, and obtain a server-side permanent access token with the appropriate messaging permissions. The sender phone-number ID is a Meta ID, not the recipient phone number. Have Meta approve a utility template for lead notifications, with five positional body parameters in this exact order:

1. Tracking/reference code
2. Name
3. Phone
4. Email
5. Service category

Example template body: `New Creator Group inquiry. Reference: {{1}}. Name: {{2}}. Phone: {{3}}. Email: {{4}}. Service: {{5}}.`

Set private environment variables in Hostinger and redeploy; never put tokens in NEXT_PUBLIC variables, commits or chat messages:

- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_TEMPLATE_NAME`
- `WHATSAPP_TEMPLATE_LANGUAGE` (exact approved template locale; defaults to `en`)
- `WHATSAPP_GRAPH_VERSION` (supported Meta version; defaults to `v25.0`)
- `WHATSAPP_RETRY_SECRET` (random secret for the scheduled retry endpoint)

Hostinger applies `drizzle/0002_whatsapp_notifications.sql` on first database access. For Sites/D1, apply the migration through the normal D1 migration workflow.

Configure a scheduled HTTPS POST every five minutes to `https://creatorgroup.io/api/notifications/retry`, with `Authorization: Bearer <WHATSAPP_RETRY_SECRET>` in a header. Do not place the secret in the URL. The job attempts at most five queued messages per run and at most three tries per message. Interrupted attempts recover after ten minutes. Inspect failed queue rows privately before manual retry. If an upstream timeout occurred after acceptance, a retry can duplicate a notification; the reference code identifies the same lead.

The success UI says "accepted" only when Meta returns a message ID; this does not prove delivery. Delivery receipts require a separately configured Meta webhook. Medical attachments, private tracking keys and free-text details are never included in the notification or prepared link.

No automatic live message has been tested or sent without configured credentials. Verify with an authorized test lead after setup.

References: [Meta Cloud API collection](https://www.postman.com/meta/whatsapp-business-platform/collection/wlk6lh4/whatsapp-cloud-api), [Meta message templates](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/send-message-templates).

# Currency sources

The embedded [TradingView Forex Table](https://www.tradingview.com/widget-docs/widgets/heatmaps/forex-cross-rates/) shows latest market quotes according to feed availability, including closed-market periods. The separate converter uses [ExchangeRate-API open access](https://www.exchangerate-api.com/docs/free), which updates daily. Attribution stays visible. Server cache revalidates hourly, browser refreshes every five minutes, and the provider timestamp is displayed. No paid subscription was created. IRR is rial, not toman, and the API's reference rate is not Iran's open-market rate.
