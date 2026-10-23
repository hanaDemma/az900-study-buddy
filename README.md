# AZ-900 Study Buddy (Unofficial)

An AI study buddy that explains Microsoft Azure Fundamentals (AZ-900) concepts
in simple **English or Amharic**, using everyday African analogies.

**Live demo:** [YOUR VERCEL LINK]
**Track:** AI Study Buddy | #1MillionDevs Vibe Coding Hackathon (AZ-900 Edition)

> Unofficial study aid. Not affiliated with Microsoft. Verify on Microsoft Learn.

## The problem
AZ-900 preparation material is mostly English-only and uses examples that feel
distant to many African learners. Learners who think in Amharic have to translate
technical ideas in their head before they can study them.

## The solution
Ask about an Azure concept (or pick one from the topic list) and get:
1. A one-sentence definition
2. A familiar analogy (compound gates, minibuses, prepaid airtime)
3. Why it matters for the AZ-900 exam
4. Related topics to explore next

Switch between English and Amharic at any time.

![English answer](docs/english.png)
![Amharic answer](docs/amharic.png)

## How it works
![Architecture](docs/architecture.png)

1. The learner picks a language and asks a question or selects a topic.
2. **Retrieval:** keyword matching finds the relevant concept notes in Supabase.
3. **Prompt assembly:** notes + language + style rules (+ a term glossary for Amharic).
4. **LLM call:** a Gemini model writes the explanation.
5. **Response:** answer card with related-topic chips; the unofficial label is
   appended in code, so it can never be dropped by the model.

## Prompt engineering
- **Grounding:** the model answers only from the retrieved concept notes. If a
  topic is not covered, it says so instead of guessing (tested with
  out-of-scope and not-yet-written topics).
- **Amharic quality:** Azure terms stay in English script, followed by a short
  Amharic explanation from a curated glossary, which keeps wording consistent
  with what learners meet in the exam.
- **Style contract:** definition, analogy, exam relevance, next topic, under 150 words.
- **Guardrails:** no real exam questions, no guessing what will be on the exam.
- **Reliability:** low temperature; fixed footer added in code; the glossary is
  only sent for Amharic answers.

## Rules compliance
- All content is written in our own words from the public AZ-900 skills outline.
- No real exam questions are used or reproduced.
- No Microsoft logos are used.
- Clearly labelled as unofficial.

## Tech stack
Next.js, TypeScript, Tailwind CSS, Supabase (Postgres), Gemini API, Vercel.

## Known limitations
- Currently 19 concept notes, covering part of the three AZ-900 domains.
- Retrieval is keyword-based, so questions typed entirely in Amharic work best
  through the topic list.
- Amharic output should receive native-speaker review as the content grows.

## Roadmap
- Cover the full skills outline
- Afaan Oromo and Tigrigna
- "Quiz me" mode and progress tracking
- Other Microsoft fundamentals certifications

## Run locally
```bash
npm install
cp .env.example .env.local   # fill in your own keys
npm run dev
```
Required variables: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GEMINI_API_KEY`, `GEMINI_MODEL`.
SQL for the tables and seed data is in `data/`.
