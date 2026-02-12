---
description: Detailed user journey and technical implementation for a Freemium SaaS model, covering attraction, onboarding, monetization, and retention.
---

# Freemium Conversion Flow Skill

This skill defines the complete user journey from visitor to paid subscriber, optimizing for conversion and trust.

## Phase 1: Attraction & Capture (Landing Page)
**Goal**: Hook the user without immediate friction.

- **Entry**: User lands on `legalaid.es` (Trust & Clarity aesthetic).
- **Value Proof**: "Smart Search Bar" in Hero. User types a query (e.g., "How to renew NIE?").
- **The Hook (Partial Response)**:
    - Gemini processes the query.
    - **Display**: Show structured answer but ONLY 40% (Teaser).
    - **Blur/Lock**: The rest is hidden.
- **CTA**: Modal appears: "Register for free to see the full answer, deadlines, and forms."

## Phase 2: Onboarding & Registration (Supabase Auth)
**Goal**: Seamless transition to registered user.

- **Fast Sign-up**: Social Auth (Google) or Email via Supabase.
- **Profile Initialization**:
    - Trigger on creation: Create row in `profiles`.
    - Set `query_count: 1`.
    - Set `plan_type: 'free'`.
- **Immediate Reward**: User is redirected back and sees the *full* answer to their initial question. Trust established.

## Phase 3: Freemium Usage (The Hook)
**Goal**: Demonstrate consistent value before asking for money.

- **Queries 2 & 3**: User asks more questions or uploads a document.
    - **RAG Engine**: Processes info using `knowledge_base` (context-aware).
- **The Wall (Paywall)**:
    - Logic: Check `query_count`.
    - **Trigger**: If `query_count >= 3` AND `plan_type == 'free'`.
    - **Action**: Block request. Show Pricing Modal.
- **Value Proposition (Pricing Modal)**:
    - Design: Elegant (Gold & Emerald Green).
    - **Pro Plan (€9/mo)**: Unlimited queries, PDF analysis, Telegram Bot access.

## Phase 4: Checkout & Payment (Stripe)
**Goal**: Secure and professional payment processing.

- **Action**: User clicks "Subscribe".
- **Redirect**: To Stripe Checkout (Hosted Page).
- **Process**:
    - Payment confirmed.
    - **Webhook**: Stripe sends event to Supabase Edge Function.
    - **Update**: DB updates user to `plan_type: 'premium'`.

## Phase 5: Premium Service & Retention
**Goal**: High-touch service to prevent churn.

- **Telegram Activation**:
    - Web generates a unique 6-digit code.
    - User sends code to `@LegalHalal_bot`.
    - **Linking**: System maps Telegram ID to Supabase User ID.
- **Cross-Platform**: User sends photos of fines/docs via Telegram -> AI answers immediately.
- **Web Dashboard**: New section "My Documents".
    - History of all chats/uploads organized by folder.

## Technical Summary

| Step | Technology | Action |
| :--- | :--- | :--- |
| **Initial Query** | Next.js + Gemini | `process_query` (Demo Mode/Teaser) |
| **Registration** | Supabase Auth | Auto-create `profiles` row |
| **Usage Control** | Middleware / Edge | Block if `query_count > 3` & Free |
| **Payment** | Stripe Checkout | Secure handling |
| **Confirmation** | Edge Function | Webhook updates to `premium` |
| **Daily Use** | Telegram API | Skill `telegram_gateway` |
