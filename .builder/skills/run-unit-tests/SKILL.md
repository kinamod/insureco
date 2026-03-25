---
name: run-unit-tests
description: Run the unit test suite for this project. Use this skill when the user asks to run tests, check if tests pass, verify a change didn't break anything, or see test results.
---

# Run Unit Tests

## Commands

**Single run (CI-style, shows results and exits):**
```bash
npm run test:run
```

**Watch mode (re-runs on file save):**
```bash
npm test
```

**With coverage report:**
```bash
npm run test:coverage
```

## Stack

- **Runner**: Vitest v4
- **Component rendering**: `@testing-library/react`
- **Extra matchers**: `@testing-library/jest-dom` (loaded globally via `src/__tests__/setup.js`)
- **Environment**: jsdom (no real browser required)

## Test file locations

```
src/__tests__/
├── setup.js                        # Global setup — imports jest-dom matchers
├── utils/
│   └── businessHelpers.test.js     # Pure utility function tests
├── components/                     # Component-level tests
└── pages/                          # Page/flow tests
```

## Writing new tests

- Test files must match `**/*.{test,spec}.{js,jsx}`
- Wrap React components in `<ThemeProvider>` from `src/contexts/ThemeContext.jsx`
- Wrap routed pages in `<MemoryRouter>` from `react-router-dom`
- Mock Carbon icons with inline `vi.mock('@carbon/icons-react', ...)`
- CSS and SCSS imports are ignored automatically (`css: false` in `vite.config.js`)

---

## Report Format

After running the tests, ALWAYS reply with a summary in this exact format:

---

### 🧪 Test Results

| | |
|---|---|
| 🔢 **Total** | X tests across Y files |
| ✅ **Passed** | X |
| ❌ **Failed** | X |
| 📊 **Pass rate** | X% |

**Files:** `file1.test.js` ✅ · `file2.test.jsx` ✅ · `file3.test.jsx` ❌

#### ❌ Failures

**`path/to/file.test.js` › describe block › test name**
- **Expected:** `"value"`
- **Received:** `"other value"`
- **Line:** `file.test.js:25`

_(Repeat for each failure. If no failures, omit this section entirely.)_

---

Rules for the report:
- Always show the report after running, even if all tests pass
- Pass rate = (passed / total) × 100, rounded to nearest whole number
- If all tests pass, replace the ❌ Failures section with: **🎉 All tests passed!**
- For each failure, include the describe + test name, the Expected/Received diff, and the file:line
- Keep failure explanations factual — what the assertion got vs what it wanted, not speculation
