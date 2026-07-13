ITR DESK WEBSITE UPDATE - PAYMENT BACKEND CONNECTED

The public calculator is connected to the verified payment backend through:

  content="https://itrdesk-payment-backend.vercel.app"

The backend health endpoint was verified with ready=true, amount=100000 and
currency=INR. Complete the end-to-end Razorpay test-mode checks below before
switching the Vercel environment variables to live credentials.

To publish this connected update:

1. Upload the EXTRACTED contents of this folder to the ROOT of the itrdesk
   GitHub repository, preserving the assets folder.
2. Do not upload this ZIP as a ZIP file.

Never put the Razorpay Key Secret or DOWNLOAD_TOKEN_SECRET in calculator.html,
GitHub, screenshots, email, WhatsApp, or chat. Only the public backend URL and
Razorpay Key ID may reach the browser; the backend returns the public Key ID.

Required live checks:

- /api/health says ready=true, amount=100000 and currency=INR.
- Razorpay Test Mode payment succeeds.
- A failed/tampered signature releases no document.
- Both PDF and Word download after verification.
- Changing any income or identity input does not reuse the paid entitlement.
- terms.html, refund-policy.html and privacy.html open publicly.

The INR 1,000 fee covers the automated computation copy only. ITR preparation,
review and filing remain a separate professional engagement and fee.

CONTENT-PROTECTION NOTE

The shared assets add print blocking, copying and selection deterrence,
shortcut deterrence, and a privacy curtain when the page loses focus. The
visible repeated watermark was removed for a cleaner reading experience. These
measures apply to every site page that loads assets/script.js. No public
webpage can reliably prevent an operating-system screenshot, screen recording,
browser extension, camera photo, or a technically skilled visitor from copying
content. Without a visible watermark, screenshots that bypass the browser
deterrents will not carry an attribution mark.
