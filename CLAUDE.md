# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint
npm run preview    # Preview production build locally
```

No automated test runner is configured. Testing is manual.

To deploy a Supabase edge function:
```bash
supabase functions deploy <function-name>
```

## Architecture Overview

Multi-tenant legal assistance SaaS with AI-powered contract analysis, Halal compliance verification, PDF smart forms, and e-signatures.

### Tech Stack

- **Frontend:** React 18 + TypeScript 5 (strict mode), Vite, Tailwind CSS, shadcn/ui
- **Backend:** Supabase (Auth, PostgreSQL with pgvector, Storage, Deno Edge Functions)
- **AI:** Google Gemini 2.0-flash (chat/vision), embedding-001 for vectors (3072 dimensions), always using `v1beta` API version
- **Routing:** React Router DOM 7 + custom `useAppRouting` hook for view-state navigation
- **i18n:** i18next, 11 languages (es default), locale files in `src/locales/`

### Environment Variables

| Variable | Used in |
|---|---|
| `VITE_SUPABASE_URL` | Client |
| `VITE_SUPABASE_ANON_KEY` | Client |
| `GOOGLE_API_KEY_CHAT` | Edge Functions |
| `SUPABASE_SERVICE_ROLE_KEY` | Edge Functions |

### Context Providers (wrapping order matters)

```
AppSettingsProvider → TenantProvider → ChatProvider → App
```

- **TenantContext** (`src/lib/TenantContext.tsx`): Global auth + tenant + user state. Resolves tenant from: profile → URL slug → invitation token. Superadmin is `lsergiom76@gmail.com`.
- **AppSettingsContext**: Runtime config (plan names, affiliate rates, branding).
- **ChatContext**: Chat drawer open/close state.

### Multi-Tenancy Rules

All DB queries must filter by `tenant_id` **and** `user_id`. Exception: global documents where `user_id IS NULL`. RLS policies enforce this at the DB level. Tenant configurations live in `tenants.config` (JSONB).

### Subscription Tiers

| UI Label | DB value | Queries/mo | Documents | API Access |
|---|---|---|---|---|
| Starter | `free` | 5 | 1 | No |
| Business | `pro` | 100 | 20 | No |
| Enterprise | `business` | unlimited | unlimited | Yes |

Usage enforcement is via RPC: `can_perform_action()` (check) and `increment_usage()` (track).

### Key Database Tables

- `tenants` — organizations (slug, plan, config JSONB)
- `profiles` — users (tenant_id, subscription_tier)
- `knowledge_base` — embeddings (content, `embedding vector(3072)`, metadata)
- `documents` — uploaded files (storage_path, tenant_id, user_id)
- `document_signature_requests` — e-signature workflow state
- `pdf_templates` / `form_fields_mapping` — smart form templates
- `pdf_bundles` — document packages for batch signing
- `affiliates` / `affiliate_referrals` / `affiliate_commissions` — referral system
- `usage_tracking` — monthly consumption per user
- `tenant_invitations` — invite tokens with expiration

### Chat RAG Pipeline (`supabase/functions/chat/index.ts`)

1. Embed query with Gemini embedding-001 (3072-dim vector)
2. Semantic search against `knowledge_base` table
3. Pass top results + last 8 messages as context to Gemini 2.0-flash
4. Stream response with source citations and similarity scores

### PDF Processing (`supabase/functions/process-pdf/index.ts`)

Documents are chunked at 400-word intervals with 50-word overlap, then embedded and stored in `knowledge_base`. Documents uploaded before April 16, 2026 have single-chunk vectors and should be re-processed if RAG quality matters.

To verify vector dimensions before DB changes:
```sql
SELECT vector_dims(embedding) FROM knowledge_base LIMIT 1;
```

### Edge Functions

| Function | JWT Required | Purpose |
|---|---|---|
| `chat` | No | RAG chat endpoint |
| `process-pdf` | No | Ingest & chunk PDFs |
| `analyze-contract` | — | Legal doc analysis |
| `analyze-compliance` | — | Halal verification |
| `create-organization` | No | Multi-tenant org setup |
| `accept-invite` | Yes | Invitation token flow |

Deno imports (`esm.sh`, `deno.land`) generate IDE lint errors on Windows — this is expected; they resolve correctly at runtime.

### Custom Hooks Structure

```
src/hooks/
├── affiliate/         useAffiliateActions, useAffiliateStats
├── organization/      useOrganizationInvites, useOrganizationMembers, useUserBundles
├── signature/         useSignatureFlow, useSignaturePersistence
├── system/            useHealthCheck
├── useAppRouting.ts   Navigation & view-state management
├── useAdminAuth.ts    Admin-only access guard
└── useAssetUpload.ts  File upload orchestration
```

### Path Alias

`@/*` maps to `src/*` (configured in both `tsconfig.json` and `vite.config.ts`).

### Tailwind Custom Tokens

- `primary` → `#064E3B` (dark teal)
- `muted-dark` → `#1f1f1f`
- Custom animations: `fade-in`, `slide-in-right`
