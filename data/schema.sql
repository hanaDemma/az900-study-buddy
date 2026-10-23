alter table concept_notes enable row level security;
alter table glossary enable row level security;
create policy "public read" on concept_notes for select using (true);
create policy "public read" on glossary for select using (true);