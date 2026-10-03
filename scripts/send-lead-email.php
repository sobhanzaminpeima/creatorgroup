<?php
// CLI helper only. Nothing under public/, no web endpoint and no arbitrary recipients.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit(1); }
function creatorSendLeadEmail(array $p): bool {
    if (!is_string($p['subject'] ?? null) || !is_string($p['body'] ?? null) || preg_match('/[\r\n]/', $p['subject']) || strlen($p['subject']) > 250) { return false; }
    $headers = ['From' => 'Creator Group <notifications@creatorgroup.io>', 'MIME-Version' => '1.0', 'Content-Type' => 'text/plain; charset=UTF-8', 'Content-Transfer-Encoding' => 'base64'];
    if (!empty($p['replyTo']) && filter_var($p['replyTo'], FILTER_VALIDATE_EMAIL) && !preg_match('/[\r\n]/', $p['replyTo'])) { $headers['Reply-To'] = $p['replyTo']; }
    $subject = preg_match('/[^\x20-\x7E]/', $p['subject']) ? mb_encode_mimeheader($p['subject'], 'UTF-8', 'B', "\r\n") : $p['subject'];
    return mail('MEHRADMOHARRAMZADEH1@GMAIL.COM', $subject, chunk_split(base64_encode($p['body']), 76, "\r\n"), $headers, '-fnotifications@creatorgroup.io');
}
if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    $raw = stream_get_contents(STDIN, 262145); $p = json_decode($raw, true);
    if (strlen($raw) > 262144 || !is_array($p)) { exit(2); }
    $ok = creatorSendLeadEmail($p); echo $ok ? "MAIL_ACCEPTED\n" : "MAIL_FAILED\n"; exit($ok ? 0 : 1);
}
