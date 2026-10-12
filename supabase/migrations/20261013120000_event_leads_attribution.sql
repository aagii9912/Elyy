-- ELYSIUM — хүсэлтийн суваг (attribution)
-- Линкийн UTM, Meta campaign/adset/ad ID, fbclid, referrer-ийн домэйн болон
-- хуудасны зориулалт (pagePurpose), хуудасны хаяг (pageUrl). Vertmonhub-ийн
-- тулгалтын татан авалт энэ баганыг уншиж, лидийн сувгийг тогтооно.
-- Дахин ажиллуулахад аюулгүй (idempotent).

alter table public.event_leads add column if not exists attribution jsonb;

alter table public.event_leads drop constraint if exists event_leads_attribution_object;
alter table public.event_leads add constraint event_leads_attribution_object
  check (attribution is null or jsonb_typeof(attribution) = 'object');
