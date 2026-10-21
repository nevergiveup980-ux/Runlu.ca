import { test, expect } from '@playwright/test';

const url = 'http://127.0.0.1:8765/twist.html';

test('twenty puzzles, score, review and reset', async ({ page }) => {
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
