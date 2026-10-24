import { test, expect } from '@playwright/test';

const url = 'http://127.0.0.1:8765/twist.html';

test('twenty puzzles, score, review and reset', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(url);
  await expect(page.locator('#counter')).toContainText('01 / 20');
  await expect(page.locator('#nextBtn')).toBeDisabled();
  for (let i = 0; i < 20; i++) {
    if (i === 0) await page.locator('#hintBtn').click();
    await page.locator('#answerBtn').click();
    await expect(page.locator('#explanation')).toBeVisible();
    if (i === 0) await page.locator('#gotBtn').click();
    if (i < 19) await page.locator('#nextBtn').click();
  }
  await expect(page.locator('#solved')).toContainText('20 / 20');
  await expect(page.locator('#points')).toContainText('195');
  await expect(page.locator('#reviewBtn')).toBeVisible();
  await page.locator('#reviewBtn').click();
  await expect(page.locator('#counter')).toContainText('01 / 20');
  await page.locator('#nextBtn').click();
  await expect(page.locator('#counter')).toContainText('02 / 20');
  await page.reload();
  await expect(page.locator('#counter')).toContainText('02 / 20');
  await expect(page.locator('#points')).toContainText('195');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#resetBtn').click();
  await expect(page.locator('#solved')).toContainText('0 / 20');
  await expect(page.locator('#points')).toContainText('0');
  expect(errors).toEqual([]);
});

test('language, self-report correction and reload', async ({ page }) => {
  await page.goto(url);
  await page.locator('#language').selectOption('zh');
  await expect(page.locator('#counter')).toContainText('第 01');
  await page.locator('#answerBtn').click();
  await page.locator('#gotBtn').click();
  await expect(page.locator('#correct')).toContainText('1 / 1');
  await page.locator('#missBtn').click();
  await expect(page.locator('#correct')).toContainText('0 / 1');
  await page.reload();
  await expect(page.locator('#language')).toHaveValue('zh');
  await expect(page.locator('#correct')).toContainText('0 / 1');
  await expect(page.locator('#answer')).toBeVisible();
});

test('narrow screen has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(url);
  const overflowing = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflowing).toBe(false);
});

test('cancel reset preserves progress and assessment', async ({ page }) => {
  await page.goto(url);
  await page.locator('#answerBtn').click();
  await page.locator('#gotBtn').click();
  page.once('dialog', dialog => dialog.dismiss());
  await page.locator('#resetBtn').click();
  await expect(page.locator('#solved')).toContainText('1 / 20');
  await expect(page.locator('#correct')).toContainText('1 / 1');
});

test('keyboard focus and localized accessibility labels', async ({ page }) => {
  await page.goto(url);
  await page.locator('#answerBtn').click();
  await page.locator('#nextBtn').click();
  await expect(page.locator('#question')).toBeFocused();
  await page.locator('#language').selectOption('zh');
  await expect(page.locator('#eyebrow')).toHaveText('跳出惯性思维');
  await expect(page.locator('#progress')).toHaveAttribute('aria-label', '答题进度');
  await expect(page.locator('#puzzleCard')).toHaveAttribute('aria-label', '脑洞题');
});

test('small phone header stays within viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto(url);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
});

test('invalid saved assessments are ignored without losing valid progress', async ({ page }) => {
  await page.goto(url);
  await page.evaluate(() => {
    localStorage.setItem('runlu-twist-node001-v1', JSON.stringify({
      index: 0, completed: [0], hints: [],
      assessments: { '0': 'yes', '1': 'yes', '999': 'yes', '2': 'maybe' }
    }));
  });
  await page.reload();
  await expect(page.locator('#solved')).toContainText('1 / 20');
  await expect(page.locator('#correct')).toContainText('1 / 1');
  await expect(page.locator('#answer')).toBeVisible();
});

test('progress remains intact when moving backward and changing language', async ({ page }) => {
  await page.goto(url);
  await page.locator('#answerBtn').click();
  await page.locator('#nextBtn').click();
  await page.locator('#prevBtn').click();
  await expect(page.locator('#answer')).toBeVisible();
  await page.locator('#language').selectOption('zh');
  await expect(page.locator('#solved')).toContainText('1 / 20');
  await expect(page.locator('#points')).toContainText('10');
});

test('hint and answer remain consistent after reload', async ({ page }) => {
  await page.goto(url);
  await page.locator('#hintBtn').click();
  await expect(page.locator('#hint')).toBeVisible();
  await page.reload();
  await expect(page.locator('#hint')).toBeVisible();
  await expect(page.locator('#hintBtn')).toBeDisabled();
  await page.locator('#answerBtn').click();
  await expect(page.locator('#points')).toContainText('5');
  await page.reload();
  await expect(page.locator('#answer')).toBeVisible();
  await expect(page.locator('#points')).toContainText('5');
});

test('self-report can be corrected after reloading', async ({ page }) => {
  await page.goto(url);
  await page.locator('#answerBtn').click();
  await page.locator('#gotBtn').click();
  await page.reload();
  await page.locator('#missBtn').click();
  await expect(page.locator('#correct')).toContainText('0 / 1');
  await page.reload();
  await expect(page.locator('#correct')).toContainText('0 / 1');
});

test('editorial integrity: twenty distinct complete bilingual puzzles', async ({ page }) => {
  await page.goto(url);
  const content = await page.evaluate(() => ({
    en: puzzles,
    zh,
    explanations
  }));
  for (const locale of ['en', 'zh']) {
    const entries = content[locale];
    expect(entries).toHaveLength(20);
    expect(content.explanations[locale]).toHaveLength(20);
    const questions = new Set();
    for (let i = 0; i < 20; i++) {
      const entry = entries[i];
      expect(entry).toHaveLength(3);
      for (const [fieldIndex, field] of entry.entries()) {
        expect(typeof field).toBe('string');
        const minLength = fieldIndex === 2 ? (locale === 'zh' ? 1 : 2) : (locale === 'zh' ? 4 : 8);
        expect(field.trim().length).toBeGreaterThan(minLength);
      }
      expect(content.explanations[locale][i].trim().length).toBeGreaterThan(locale === 'zh' ? 7 : 20);
      expect(entry[1].trim().toLowerCase()).not.toBe(entry[2].trim().toLowerCase());
      questions.add(entry[0].trim());
    }
    expect(questions.size).toBe(20);
  }
});

test('mobile touch flow: hint, answer, next and reload', async ({ browser }) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 3
  });
  try {
    const page = await context.newPage();
    await page.goto(url);
    await page.locator('#hintBtn').tap();
    await expect(page.locator('#hint')).toBeVisible();
    await page.locator('#answerBtn').tap();
    await expect(page.locator('#answer')).toBeVisible();
    await expect(page.locator('#points')).toContainText('5');
    await page.locator('#nextBtn').tap();
    await expect(page.locator('#counter')).toContainText('02 / 20');
    await page.reload();
    await expect(page.locator('#counter')).toContainText('02 / 20');
    await page.locator('#prevBtn').tap();
    await expect(page.locator('#answer')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false);
  } finally {
    await context.close();
  }
});
