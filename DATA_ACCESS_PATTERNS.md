# Data Access Patterns in Taleem ka Safar

## Summary
This project follows **best-practice PostgreSQL query patterns** with:
- ✅ **Explicit column selection** (no `SELECT *` in production code)
- ✅ **Indexed lookups** (by slug, by ID, by foreign keys)
- ✅ **Filtered queries** with `.eq()`, `.in()`, `.is()` predicates
- ✅ **RLS-enforced security** (owner-scoped data via cookie client)
- ✅ **Cached catalog layer** for reference data
- ✅ **Server-side RPC functions** for complex operations (grading, mock generation)

---

## Query Patterns by Category

### 1. **Catalog Queries** (Public Reference Data)
**Files:** `lib/queries/catalog.ts`

**Pattern:** Explicit column selection via **database views** + cached with anon client

```typescript
// Subjects overview (with question counts)
supabase
  .from("subject_overview")  // View, not raw table
  .select("*")               // View has controlled columns
  .eq("entry_test_slug", testSlug)
  .order("display_order", { ascending: true })

// Chapters overview
supabase
  .from("chapter_overview")  // View
  .select("*")
  .eq("entry_test_slug", testSlug)
  .eq("subject_slug", subjectSlug)
  .order("display_order", { ascending: true })
```

**Key Points:**
- Uses **views** (`subject_overview`, `chapter_overview`, `entry_test_public`) that expose only specific columns
- `SELECT *` is safe here because views define the column contract
- Cached via `"use cache"` + `cacheTag()` (Next.js Cache Components)
- Uses **anon client** (no cookies) for cache compatibility

---

### 2. **Practice/Past-Paper Queries** (User-Specific Question Content)
**Files:** `lib/queries/practice.ts`

**Pattern:** Explicit columns + multi-step assembly + RLS filtering

```typescript
// 1. Resolve subject by slug
supabase
  .from("subjects")
  .select("id, slug, name")
  .eq("slug", subjectSlug)
  .maybeSingle()

// 2. Resolve chapter by slug
supabase
  .from("topics")
  .select("id, slug, title")
  .eq("subject_id", subject.id)
  .eq("slug", chapterSlug)
  .is("parent_topic_id", null)
  .is("deleted_at", null)
  .maybeSingle()

// 3. Get questions for chapter + test + usage
supabase
  .from("question_tests")
  .select("question_id, questions!inner(topic_id, deleted_at, moderation_status)")
  .eq("entry_test_id", entryTest.id)
  .eq("usage_type", usage)
  .in("questions.topic_id", topicIds)
  .is("questions.deleted_at", null)
  .eq("questions.moderation_status", "approved")

// 4. Get question content (NO correct_answer / is_correct!)
supabase
  .from("questions")
  .select("id, statement")
  .in("topic_id", topicIds)
  .is("deleted_at", null)
  .eq("moderation_status", "approved")
  .order("external_id", { ascending: true })

// 5. Get options (answer-free)
supabase
  .from("question_options")
  .select("id, question_id, option_label, content")
  .in("question_id", questionIds)
  .order("display_order", { ascending: true })
```

**Key Points:**
- **Explicit column lists** in every `.select()`
- **No `SELECT *`** on raw tables
- **No `correct_answer` or `is_correct`** in the question fetch (grading is server-side only)
- Uses **`.in()`** for batch fetches (questions → options)
- **Slug-based lookups** (indexed) for navigation
- **RLS enforced** via cookie client

---

### 3. **Mock Test Queries** (Frozen Question Sets)
**Files:** `lib/queries/mock.ts`

**Pattern:** Frozen attempts + display_order for stability

```typescript
// Mock blueprint
supabase
  .from("mock_test_blueprints")
  .select("id, name, description, duration_seconds, total_questions")
  .eq("entry_test_id", entryTest.id)
  .eq("is_active", true)
  .order("display_order", { ascending: true })
  .limit(1)
  .maybeSingle()

// Mock results (with join to attempts for owner check)
supabase
  .from("mock_results")
  .select(
    "attempt_id, score_percent, correct_count, total_questions, attempts!inner(submitted_at, user_id)"
  )
  .eq("attempts.user_id", userId)
  .order("created_at", { ascending: false })
  .limit(limit)

// Mock attempt (frozen question order)
supabase
  .from("attempt_answers")
  .select("question_id, selected_option_id, marked_for_review, display_order")
  .eq("attempt_id", attemptId)
  .order("display_order", { ascending: true })
```

**Key Points:**
- **Explicit columns** with **inner joins** for RLS checks (`attempts!inner(...)`)
- **Frozen order** via `attempt_answers.display_order`
- **No correct answers** in the fetch (graded server-side at submit)
- **Owner-scoped** via `.eq("attempts.user_id", userId)`

---

### 4. **Dashboard Queries** (Mixed Dynamic + Cached)
**Files:** `lib/queries/dashboard.ts`, `lib/queries/entry-test.ts`

**Pattern:** User profile (dynamic) + catalog (cached)

```typescript
// User profile
supabase
  .from("profiles")
  .select("display_name")
  .eq("id", userId)
  .maybeSingle()

// Active entry test (user's selection)
supabase
  .from("profiles")
  .select("selected_test_id")
  .eq("id", userId)
  .maybeSingle()

// Entry test by ID
supabase
  .from("entry_tests")
  .select("id, slug, name")
  .eq("id", profile.selected_test_id)
  .maybeSingle()

// Activity check (has attempts?)
supabase
  .from("attempts")
  .select("id", { count: "exact", head: true })
  .eq("user_id", userId)
```

**Key Points:**
- **Explicit columns** everywhere
- **By-ID lookups** (primary key) for entry test resolution
- **Count-only queries** with `{ count: "exact", head: true }` (no row data)
- **React `cache()`** wrapper for request-level memoization

---

### 5. **Performance Queries** (User Analytics)
**Files:** `lib/queries/performance.ts`

**Pattern:** Aggregation from user's attempts

```typescript
// Practice attempts for user
supabase
  .from("attempts")
  .select("id")
  .eq("user_id", userId)
  .eq("mode", "practice")

// Practice answers (for accuracy)
supabase
  .from("attempt_answers")
  .select("is_correct")
  .in("attempt_id", attemptIds)
  .not("selected_option_id", "is", null)
```

**Key Points:**
- **Explicit columns** (`id` only, `is_correct` only)
- **Bulk filtering** via `.in("attempt_id", attemptIds)`
- **Client-side aggregation** (sum/avg) from the fetched rows

---

### 6. **Server Actions** (Writes + Updates)
**Files:** `app/(dashboard)/actions.ts`, `app/(dashboard)/quiz-actions.ts`

**Pattern:** Targeted updates + server-side RPCs for complex logic

```typescript
// Set selected test
supabase
  .from("profiles")
  .update({ selected_test_id: entryTestId })
  .eq("id", userId)

// Save mock answer
supabase
  .from("attempt_answers")
  .update({
    selected_option_id: optionId,
    time_taken_ms: timeTakenMs,
    answered_at: new Date().toISOString(),
  })
  .eq("attempt_id", attemptId)
  .eq("question_id", questionId)

// Toggle bookmark
supabase
  .from("bookmarks")
  .select("id")
  .eq("user_id", userId)
  .eq("question_id", questionId)
  .maybeSingle()
// Then insert or delete

// RPC calls (complex operations)
supabase.rpc("start_attempt", { ... })
supabase.rpc("submit_practice_answer", { ... })
supabase.rpc("generate_mock_attempt", { ... })
supabase.rpc("submit_mock", { ... })
```

**Key Points:**
- **Explicit `.update()` fields** (only what changes)
- **By-ID predicates** (`.eq("id", ...)`)
- **Check-before-write** for toggles (bookmark)
- **Server-side RPCs** for grading, mock generation, and scoring (business logic hidden from client)

---

## Direct ID Usage

The project **does** use direct IDs, but appropriately:

### When IDs are used:
1. **Primary key lookups** (`entry_test_id`, `user_id`, `attempt_id`, `question_id`)
   - These are indexed and efficient
   - Example: `.eq("id", entryTestId)`, `.eq("user_id", userId)`

2. **Foreign key joins**
   - Example: `.eq("entry_test_id", entryTest.id)`
   - Example: `.in("question_id", questionIds)`

3. **RLS owner checks**
   - Example: `.eq("user_id", userId)` (scopes data to owner)
   - Example: `.eq("attempts.user_id", userId)` (inner join for ownership)

### What is NOT done:
❌ **No `SELECT *`** on raw tables in production queries
❌ **No unfiltered scans** (every query has a predicate)
❌ **No N+1 queries** (uses `.in()` for batch fetches)
❌ **No correct answers in client fetches** (graded server-side)

---

## Security Model

### Two-Client Pattern:
1. **Cookie client** (`lib/supabase/server.ts`) → user-specific data, RLS enforced
2. **Anon client** (`lib/supabase/anon.ts`) → public catalog via views, cacheable

### RLS Enforcement:
- All user data (`attempts`, `bookmarks`, `profiles`) is **owner-scoped** via RLS
- Question **content** is readable (via RLS), but **answers** are hidden
- Grading happens **server-side only** via RPC functions that return correctness

### View Layer:
- `subject_overview`, `chapter_overview`, `entry_test_public` = controlled column sets
- `security_invoker` views respect RLS
- Anon role granted **read-only** access to approved, live reference data only

---

## Recommendations

✅ **Already following best practices:**
- Explicit column selection
- Indexed lookups (slug, ID, FK)
- Filtered queries with predicates
- RLS-enforced security
- Cached catalog layer
- Server-side business logic

🔹 **Potential optimizations (for scale):**
- Add **database indexes** on:
  - `topics(subject_id, slug, parent_topic_id, deleted_at)`
  - `questions(topic_id, moderation_status, deleted_at)`
  - `question_tests(entry_test_id, usage_type, question_id)`
  - `attempt_answers(attempt_id, display_order)`
- Consider **materialized views** for `subject_overview`/`chapter_overview` if counts get expensive (refresh on import)
- Add **query result limits** to practice/mock fetches (current code fetches all questions for a chapter; cap at e.g. 100 per page for large chapters)

---

## Conclusion

This project **does NOT use `SELECT *` anti-patterns** and **does NOT do unfiltered table scans**. It uses **modern Supabase/PostgREST patterns** with:

- Explicit column selection
- View-based catalog layer
- RLS-scoped data access
- Server-side grading RPCs
- Efficient by-ID and by-slug lookups
- Batch fetches with `.in()`

The data access layer is **production-ready** and follows **PostgreSQL best practices**.
