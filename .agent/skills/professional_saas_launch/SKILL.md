---
description: Comprehensive guide and checklist for launching a professional SaaS, covering domain, performance, security, and compliance.
---

# Professional SaaS Launch Skill

This skill provides a comprehensive checklist and guidelines to ensure your SaaS is perceived as a professional tool.

## 1. Domain and URL Specifications
Your URL is your introduction. It must be clean and generate instant trust.

- **Primary Domain**: Avoid free subdomains. Use a professional domain like `legalaid.es`, `asistentelegal.ai`, etc.
- **URL Structure (SEO Friendly)**:
    - `tuweb.com/dashboard`: User private area.
    - `tuweb.com/documentos`: For uploading and managing files.
    - `tuweb.com/blog/how-to-renew-nie`: For organic traffic.
- **Canonical Tags**: Configure Next.js to ensure all pages have canonical tags to avoid duplicate content penalties.

## 2. Performance and Core Web Vitals (Vercel)
Performance is vital for user retention.

- **Image Optimization**: Use the `<Image />` component from Next.js to serve images in WebP format.
- **Edge Runtime**: Configure Gemini API functions as Edge Runtime in Vercel to reduce latency.
- **Caching**: Ensure static content on the landing page is cached for < 1 second load times.

## 3. Production-Level Security
Handling sensitive legal documents requires strict security.

- **RLS (Row Level Security) in Supabase**: CRITICAL. Configure policies so User A can NEVER access User B's data (`chat_logs`, `documents`).
- **Encryption at Rest**: Ensure the storage bucket (for PDFs) is private.
- **Forced SSL**: All communication must be over HTTPS (automatic on Vercel).

## 4. Telegram Bot Specifications
For production, the bot must be robust.

- **Session Persistence**: seamless transition between Web and Telegram (link via email or code).
- **Menu Commands**: Configure `/start`, `/help`, `/status` for easy navigation.

## 5. Analytics and Monitoring
Measurement is key to improvement.

- **Posthog or Umami**: Preferred over Google Analytics for privacy. Track user drop-off points.
- **Sentry**: For error tracking in API and Next.js code.

## 6. Legal and Compliance (EU/Spain)
Mandatory for legal protection.

- **Cookie Banner**: Clean design complying with GDPR.
- **Terms and Conditions**: Explicitly state AI is for "informational aid" and does not replace a collegiated lawyer.
- **Privacy Checkbox**: Users must accept data processing before interacting with the chat.

## Launch Checklist

| Specification | Status | Tool |
| :--- | :--- | :--- |
| SSL/HTTPS | ✅ Automatic | Vercel |
| Protected Database | 🛠️ Configure RLS | Supabase |
| SEO Meta Tags | 🛠️ Implement | Next.js Metadata |
| Analytics | 🛠️ Install | Umami / Posthog |
| Stripe Payment | 🛠️ Webhook | Stripe Dashboard |
