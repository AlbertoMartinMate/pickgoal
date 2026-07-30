# PickGoal v2 Updates — Phase 1: Empty States Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the visual style of "sin datos" / empty states across jornada, duelo and tabla-v2, and centralize the hardcoded `#39FF14` neon-green literal into a proper SCSS variable.

**Architecture:** Pure SCSS change, no JS/markup changes. Add `$accent-neon` to the shared variables file, mechanically replace every hardcoded `#39FF14`/`#39ff14` literal with the variable, then restyle the two existing empty-state conventions (`.empty` inline text, and the `*-empty` icon+title+text blocks) to use the shared `card` mixin and the neon accent, matching the rest of the app's dark-card visual language.

**Tech Stack:** SCSS (Vite `sass` pipeline), no test framework in this repo — verification is `npm run build` (catches Sass syntax errors) plus a manual visual check via the Vite dev server.

---

## File Structure

- Modify: `frontend/src/sass/abstracts/_variables.scss` — add `$accent-neon`.
- Modify: 12 files currently hardcoding `#39FF14`/`#39ff14` — replace with `v.$accent-neon`.
- Modify: `frontend/src/sass/base/_reset.scss` — restyle `.empty`.
- Modify: `frontend/src/sass/pages/_jornada.scss` — restyle `.jornada-empty`, add mixins import.
- Modify: `frontend/src/sass/pages/_duelo.scss` — restyle `.duelo-empty`.

No JS files change in this phase — `tabla-v2.js`'s empty state already uses the generic `.empty` class, so it inherits the new styling automatically.

---

### Task 1: Add `$accent-neon` variable

**Files:**
- Modify: `frontend/src/sass/abstracts/_variables.scss:9-13`

- [ ] **Step 1: Add the variable next to `$accent`**

Change lines 9-13 from:
```scss
// ─── Acento principal: verde deportivo ───────────────────────────────────────
$accent:       #00ff87;
$accent-dark:  #00cc6a;
$accent-dim:   rgba(0, 255, 135, 0.12);
$accent-glow:  rgba(0, 255, 135, 0.25);
```
to:
```scss
// ─── Acento principal: verde deportivo ───────────────────────────────────────
$accent:       #00ff87;
$accent-dark:  #00cc6a;
$accent-dim:   rgba(0, 255, 135, 0.12);
$accent-glow:  rgba(0, 255, 135, 0.25);
$accent-neon:  #39ff14;
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/sass/abstracts/_variables.scss
git commit -m "style: add \$accent-neon SCSS variable"
```

---

### Task 2: Replace hardcoded `#39FF14`/`#39ff14` literals with `v.$accent-neon`

**Files (all already `@use '../abstracts/variables' as v;`):**
- Modify: `frontend/src/sass/components/_navbar.scss:13,47`
- Modify: `frontend/src/sass/components/_install-banner.scss:14,32,59`
- Modify: `frontend/src/sass/components/_buttons.scss:136`
- Modify: `frontend/src/sass/components/_cards.scss:164,198,203`
- Modify: `frontend/src/sass/components/_bottom-nav.scss:12,39`
- Modify: `frontend/src/sass/components/_welcome.scss:102`
- Modify: `frontend/src/sass/pages/_quiniela.scss:13,14,119`
- Modify: `frontend/src/sass/pages/_duelo.scss:73`
- Modify: `frontend/src/sass/pages/_tablon.scss:265`
- Modify: `frontend/src/sass/pages/_perfil.scss:112,149`
- Modify: `frontend/src/sass/pages/_home.scss:376,433,466,555,603,638,662,676`

- [ ] **Step 1: Run the mechanical replacement**

```bash
cd frontend/src/sass
sed -i '' -E 's/#39[Ff][Ff]14/v.$accent-neon/g' \
  components/_navbar.scss \
  components/_install-banner.scss \
  components/_buttons.scss \
  components/_cards.scss \
  components/_bottom-nav.scss \
  components/_welcome.scss \
  pages/_quiniela.scss \
  pages/_duelo.scss \
  pages/_tablon.scss \
  pages/_perfil.scss \
  pages/_home.scss
```

- [ ] **Step 2: Verify no literal occurrences remain**

```bash
grep -rniE "#39ff14" frontend/src/sass
```
Expected: no output (empty result).

- [ ] **Step 3: Spot-check one replaced line looks right**

```bash
grep -n "accent-neon" frontend/src/sass/components/_navbar.scss
```
Expected:
```
13:  border-bottom: 2px solid v.$accent-neon;
47:    color: v.$accent-neon;
```

- [ ] **Step 4: Commit**

```bash
git add frontend/src/sass/components frontend/src/sass/pages
git commit -m "style: replace hardcoded #39FF14 literals with \$accent-neon"
```

---

### Task 3: Restyle `.empty` (generic inline empty state)

**Files:**
- Modify: `frontend/src/sass/base/_reset.scss:1,113-119`

- [ ] **Step 1: Add the mixins import**

Change line 1 from:
```scss
@use '../abstracts/variables' as v;
```
to:
```scss
@use '../abstracts/variables' as v;
@use '../abstracts/mixins' as m;
```

- [ ] **Step 2: Restyle `.empty`**

Change (current lines 113-119):
```scss
.empty {
  text-align: center;
  color: v.$text-muted;
  font-size: v.$fs-sm;
  padding: v.$sp-10 0;
  font-style: italic;
}
```
to:
```scss
.empty {
  @include m.card;
  text-align: center;
  color: v.$text-muted;
  font-size: v.$fs-sm;
  padding: v.$sp-8 v.$sp-4;
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/sass/base/_reset.scss
git commit -m "style: restyle .empty as a dark card matching app visual language"
```

---

### Task 4: Restyle `.jornada-empty`

**Files:**
- Modify: `frontend/src/sass/pages/_jornada.scss:1,122-144`

- [ ] **Step 1: Add the mixins import**

Change line 1 from:
```scss
@use '../abstracts/variables' as v;
```
to:
```scss
@use '../abstracts/variables' as v;
@use '../abstracts/mixins' as m;
```

- [ ] **Step 2: Restyle the block**

Change (current lines 122-144):
```scss
// ─── Estado sin jornada activa ───────────────────────────────────────────────
.jornada-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: v.$sp-3;
  text-align: center;
  padding: v.$sp-16 v.$sp-4;

  &__icon {
    font-size: 3rem;
  }

  &__title {
    font-size: v.$fs-lg;
    font-weight: v.$fw-bold;
    color: v.$text;
  }

  &__text {
    font-size: v.$fs-sm;
    color: v.$text-muted;
  }
}
```
to:
```scss
// ─── Estado sin jornada activa ───────────────────────────────────────────────
.jornada-empty {
  @include m.card;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: v.$sp-3;
  text-align: center;
  padding: v.$sp-16 v.$sp-4;

  &__icon {
    font-size: 3rem;
    color: v.$accent-neon;
  }

  &__title {
    font-size: v.$fs-lg;
    font-weight: v.$fw-bold;
    color: v.$text;
  }

  &__text {
    font-size: v.$fs-sm;
    color: v.$text-muted;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/sass/pages/_jornada.scss
git commit -m "style: restyle .jornada-empty as a dark card with neon icon"
```

---

### Task 5: Restyle `.duelo-empty`

**Files:**
- Modify: `frontend/src/sass/pages/_duelo.scss:90-100` (line numbers before Task 2's edit to line 73; re-check with `grep -n "duelo-empty" frontend/src/sass/pages/_duelo.scss` before editing since Task 2 only changes content on line 73, not line count)

- [ ] **Step 1: Restyle the block**

Change:
```scss
.duelo-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: v.$sp-3;
  text-align: center;
  padding: v.$sp-16 v.$sp-4;

  &__icon { font-size: 3rem; }
  &__text { font-size: v.$fs-sm; color: v.$text-muted; }
}
```
to:
```scss
.duelo-empty {
  @include m.card;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: v.$sp-3;
  text-align: center;
  padding: v.$sp-16 v.$sp-4;

  &__icon { font-size: 3rem; color: v.$accent-neon; }
  &__text { font-size: v.$fs-sm; color: v.$text-muted; }
}
```

(`_duelo.scss` already has `@use '../abstracts/mixins' as m;` on line 2 — no import change needed.)

- [ ] **Step 2: Commit**

```bash
git add frontend/src/sass/pages/_duelo.scss
git commit -m "style: restyle .duelo-empty as a dark card with neon icon"
```

---

### Task 6: Build verification

**Files:** none (verification only)

- [ ] **Step 1: Run the Vite build to catch Sass errors**

```bash
cd frontend && npm run build
```
Expected: build completes with exit code 0, no Sass compile errors (e.g. no "Undefined variable" or "Undefined mixin" errors referencing `_reset.scss`, `_jornada.scss`, or `_duelo.scss`).

- [ ] **Step 2: Start the dev server and visually confirm in a browser**

```bash
cd frontend && npm run dev
```
Open the app, navigate to a page whose empty state can be triggered (e.g. `#/jornada` when there's no active jornada, or `#/duelo` when the user has no assigned duelo) and confirm: dark card background, green (`#39ff14`) icon, white title/muted body text, consistent with the rest of the app's card styling. If no page is currently in an empty state, inspect the compiled CSS for `.empty`, `.jornada-empty`, `.duelo-empty` in devtools to confirm the new rules applied (`background: #0d0d0d`, `border: 1px solid #222222`, icon `color: #39ff14`).

---

## Self-Review Notes

- **Spec coverage:** covers spec section 1 in full — `$accent-neon` variable, literal replacement, restyle of both existing empty-state conventions (`.empty` and `*-empty` blocks), applied to jornada/duelo/tabla-v2 (tabla-v2 inherits via the shared `.empty` class, no separate file exists for it).
- **No new markup/JS**: confirmed by re-reading `jornada.js`, `duelo.js`, `tabla-v2.js` — none need changes, they already reference the classes being restyled.
- **Type/name consistency:** `$accent-neon` name used identically in Task 1 (definition) and Tasks 3-5 (usage).
