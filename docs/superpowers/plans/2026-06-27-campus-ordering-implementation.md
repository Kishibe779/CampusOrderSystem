# Campus Ordering Mini Program Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the WeChat Mini Program campus ordering system and required training deliverables from `task.docx`.

**Architecture:** Native Mini Program pages call a local API facade that mirrors WeChat cloud functions. Cloud functions contain deployable handlers for route A, while pure order rules remain testable in shared JavaScript utilities.

**Tech Stack:** WXML, WXSS, JavaScript, WeChat Cloud Development, Node.js unit tests, python-docx for Word deliverables, artifact-tool/PowerPoint tooling or fallback PPTX generator.

---

### Task 1: Core Business Logic

**Files:**
- Create: `miniprogram/utils/orderLogic.js`
- Create: `tests/orderLogic.test.js`

- [x] Write failing tests for cart totals, stock validation, pickup code format, order number format, and status transitions.
- [x] Implement the minimal reusable order logic.
- [x] Run `node tests/orderLogic.test.js` and keep it passing.

### Task 2: Mini Program Shell

**Files:**
- Create: `project.config.json`
- Create: `miniprogram/app.js`
- Create: `miniprogram/app.json`
- Create: `miniprogram/app.wxss`
- Create: all page files under `miniprogram/pages/**`
- Create: `miniprogram/utils/api.js`
- Create: `miniprogram/utils/seed.js`
- Create: `miniprogram/utils/format.js`

- [x] Add all required pages to `app.json`.
- [x] Implement student ordering, reservation, cart, checkout, order list/detail, address, review, admin, and group meal screens.
- [x] Use realistic seed data and cache home dish/category data locally.

### Task 3: Cloud Functions

**Files:**
- Create: `cloudfunctions/login/index.js`
- Create: `cloudfunctions/getDishes/index.js`
- Create: `cloudfunctions/placeOrder/index.js`
- Create: `cloudfunctions/verifyPickupCode/index.js`
- Create: `cloudfunctions/updateOrderStatus/index.js`
- Create: `cloudfunctions/submitReview/index.js`
- Create: `cloudfunctions/*/package.json`

- [x] Implement deployable WeChat cloud function contracts.
- [x] Keep inputs and outputs aligned with the system design document.

### Task 4: Required Training Documents

**Files:**
- Create: `tools/build_deliverables.py`
- Output: `deliverables/*.docx`
- Output: `deliverables/*.pptx`

- [x] Generate requirement analysis, system design, test/Bug record, AI use record, personal report, and defense deck.
- [x] Include database design, interface design, user stories, process descriptions, testing evidence, and AI-use comparisons.

### Task 5: Verification and Packaging

**Files:**
- Create: `tools/check_structure.js`
- Output: `deliverables/campus-ordering-project.zip`

- [x] Run unit tests.
- [x] Run project structure checks.
- [x] Attempt DOCX render QA and record LibreOffice limitation if unavailable.
- [x] Create final zip containing source and deliverables.
