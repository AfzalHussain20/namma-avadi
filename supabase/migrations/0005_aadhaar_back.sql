-- 0005: Allow the Aadhaar back-side document type.
-- The original inline check on member_documents.document_type (0001) only
-- allowed AADHAAR / VOTER_ID / TVK_ID / PHOTO. Postgres auto-named it
-- member_documents_document_type_check.

alter table public.member_documents
  drop constraint if exists member_documents_document_type_check;

alter table public.member_documents
  add constraint member_documents_document_type_check
    check (document_type in ('AADHAAR', 'AADHAAR_BACK', 'VOTER_ID', 'TVK_ID', 'PHOTO'));
