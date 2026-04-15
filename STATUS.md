# PDF Vision Agent — Project Status
`Spec: PDF-001 / PDF-002 | Last updated: April 2026`

---

## Done

### Infrastructure
- [x] Next.js 14 app with TypeScript + Tailwind CSS
- [x] Deployed to Vercel
- [x] AWS DynamoDB connected (`documents` table)
- [x] Anthropic Claude API connected with prompt caching
- [x] Environment variables configured (Vercel + local)

### Upload Page (`/`)
- [x] Drag and drop PDF upload
- [x] Click to browse file picker
- [x] File validation — PDF only, max 50MB, magic byte check
- [x] Page range selector — process pages 1–10, 5–20, etc.
- [x] Claude extracts structured data from any PDF type
- [x] Auto-detects document type (invoice, packing slip, manual, medical record, etc.)
- [x] Results display — fields table, line items table, dates, entities
- [x] Save to DynamoDB button

### Documents Pages
- [x] `/documents` — lists all saved documents (filename, type, date)
- [x] `/documents/[id]` — full detail view of any saved document

### API Routes
- [x] `POST /api/parse` — receives PDF, slices pages if range set, sends to Claude
- [x] `POST /api/save` — saves extracted JSON to DynamoDB

### Python CLI (pdf_parser repo)
- [x] `scripts/pdf_agent.py` — CLI version with `--pages`, `--upload`, `--debug` flags
- [x] Same Claude vision pipeline as the web app
- [x] Koch Cabinet PDFs tested and working

---

## To Do

### Security (required per rules)
- [ ] Add security tests — CAT1 input injection, CAT2 file security, CAT4 auth bypass
- [ ] Upgrade Next.js — current version 14.2.29 has a known security vulnerability

### Features
- [ ] User authentication — no login exists yet, app is open to anyone
- [ ] Search and filter on `/documents` page — by type, date, filename
- [ ] Batch upload — process multiple PDFs at once
- [ ] Export extracted data to Excel or CSV
- [ ] Store original PDF file in AWS S3 alongside the extracted data
- [ ] Progress indicator for large PDFs — show which page is being processed

### Performance
- [ ] Handle full large documents without page range — currently times out on Vercel Hobby (10s limit). Options: Vercel Pro, background job, or chunked processing

### Polish
- [ ] Mobile layout review
- [ ] Empty state on document detail if `raw_json` is missing
- [ ] Confirm dialog before saving duplicate filenames

---

## Known Limitations

| Issue | Workaround |
|---|---|
| Vercel Hobby 10s timeout on large PDFs | Use page range (e.g. 1–10) |
| No auth — anyone with the URL can use it | Add auth before sharing the URL publicly |
| DynamoDB Scan is unordered — sorted client-side | Fine at current scale, add index later if needed |
