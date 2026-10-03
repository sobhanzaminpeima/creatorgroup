# Lead email notifications

Destination: MEHRADMOHARRAMZADEH1@GMAIL.COM. This is the private lead notification destination; it is not added as a public contact address.

Both international request forms and Creator services inquiries save the lead first, then enqueue and attempt an email from `notifications@creatorgroup.io` using Hostinger's existing PHP mail service. Reply-To is the lead's validated email address. Non-medical messages and form details are included; medical details/documents, attachments and private access keys are excluded. Queue payloads contain only the prepared email, not private access keys or medical records.

The server accepted the setup test email and the user confirmed it reached Gmail Inbox. `accepted` in the queue means handed to the host's mail service, not confirmed delivery of every later message.

No Gmail password, new paid account, SMTP password or external API key is needed for the current Hostinger transport. `LEAD_EMAIL_DISABLED=1` disables sending; `LEAD_EMAIL_PHP_BIN` can override the PHP executable path if required. `next.config.ts` includes the CLI helper in API deployment tracing. The helper is outside public/ and cannot send to arbitrary recipients.

Hostinger applies migration `drizzle/0003_email_notifications.sql` on first database access. Keep the database under the existing private `CREATOR_DATA_DIR`. The Node server starts its retry worker through `instrumentation.ts`, so no manual cron or API credential is required. It checks every five minutes while the application is running and on startup, processes up to five pending notifications, recovers interrupted attempts after ten minutes and retries failed submissions after fifteen minutes. Repeated form requests reuse the same queue ID and do not resend accepted emails. A timeout after upstream acceptance can still cause a duplicate; reference codes identify the original lead.

Hostinger's built-in mail service has [limits of 10 messages/minute and 100/day](https://www.hostinger.com/support/11393648-php-mail-limitation-explained-how-to-improve-email-delivery-with-smtp/). For higher volumes, switch to authenticated SMTP or a transactional provider rather than assuming unlimited delivery. SMTP also offers more control over deliverability. No DNS records or mailbox credentials were changed for this setup.

Automatic WhatsApp sending is disabled by default; its separate retry endpoint now requires `LEAD_NOTIFICATION_CHANNEL=whatsapp` as well as WhatsApp credentials. The visitor's optional prepared-message WhatsApp link remains available.
