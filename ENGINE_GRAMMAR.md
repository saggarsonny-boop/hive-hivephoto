---
engine: HivePhoto
id: hivephoto
domain: hivephoto.hive.baby
status: building
tier: 2
schema: photo-intelligence
safety: standard
stack: [nextjs, typescript, tailwind, clerk, neon, r2, anthropic]
---

# HivePhoto — Engine Grammar

## Purpose
AI-powered personal photo library. Upload photos, get automatic AI analysis (description, tags, scene, faces), semantic search, duplicate detection, and people identification — all private to your account.

## Core Capabilities
- Secure photo upload via presigned R2 PUT URLs
- AI analysis: description, tags, scene classification, GPS-aware location labeling
- Perceptual hash duplicate detection (Hamming distance ≤ 3)
- Face detection and grouping into People
- Natural language search via Claude
- GPS map view
- Duplicate management (keep-new / keep-original / keep-both)

## Data Model
- photos: core photo record with EXIF, AI analysis, processing status
- people: named face clusters
- photo_faces: individual face detections with bounding boxes
- albums: manual collections

## Pipeline
1. Client computes SHA-256 → presign request
2. Exact duplicate check (SHA-256 per user)
3. Provisional photo row created
4. Client PUT directly to R2
5. Complete request: verify, extract metadata, pHash, near-dupe check, thumbnail
6. Cron picks up pending photos → AI analysis (Claude claude-sonnet-4-5)
7. Results written, faces inserted, status = done

## Safety
- All routes auth-gated via Clerk
- User isolation: every DB query scoped to authenticated userId
- R2 keys scoped per user in path: originals/{userId}/{photoId}.{ext}
- No public access to originals; thumbnails served via public R2 URL
- "This is not a diagnostic tool. HivePhoto is for personal organization only."

## Governance
GrapplerHook: photo-intelligence / standard / tier-2
No ads. No investors. No agenda.
