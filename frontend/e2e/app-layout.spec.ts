import { expect, test } from '@playwright/test';

test.describe('AppLayout e2e', () => {
  test('marks the current page in the sidebar', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Kreditübersicht' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('columnheader', { name: 'Kreditnehmer' })).toBeVisible();
  });

  test('collapses and expands a menu group', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Kreditgeschäft' }).click();
    await expect(page.getByRole('link', { name: 'Kreditübersicht' })).toBeHidden();

    await page.getByRole('button', { name: 'Kreditgeschäft' }).click();
    await expect(page.getByRole('link', { name: 'Kreditübersicht' })).toBeVisible();
  });

  test('opens the sidebar via the menu button on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Kreditübersicht' })).toBeHidden();

    await page.getByRole('button', { name: 'Menü ein-/ausblenden' }).click();

    await expect(page.getByRole('link', { name: 'Kreditübersicht' })).toBeVisible();
  });
});
