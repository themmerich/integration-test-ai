import { expect, test } from '@playwright/test';

test.describe('AppLayout e2e', () => {
  test('marks the current page in the sidebar', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('link', { name: 'Loan overview' })).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('columnheader', { name: 'Borrower' })).toBeVisible();
  });

  test('collapses and expands a menu group', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: 'Lending' }).click();
    await expect(page.getByRole('link', { name: 'Loan overview' })).toBeHidden();

    await page.getByRole('button', { name: 'Lending' }).click();
    await expect(page.getByRole('link', { name: 'Loan overview' })).toBeVisible();
  });

  test('opens the sidebar via the menu button on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Loan overview' })).toBeHidden();

    await page.getByRole('button', { name: 'Toggle menu' }).click();

    await expect(page.getByRole('link', { name: 'Loan overview' })).toBeVisible();
  });
});
