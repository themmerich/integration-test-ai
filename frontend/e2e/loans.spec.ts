import { expect, test } from '@playwright/test';

test.describe('LoansPage e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the loan table as start page', async ({ page }) => {
    await expect(page.getByText('Loans', { exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader')).toHaveCount(10);
    await expect(page.getByRole('cell', { name: 'Anna Schmidt' })).toBeVisible();
  });

  test('sorts by borrower', async ({ page }) => {
    await page.getByRole('columnheader', { name: 'Borrower' }).click();

    await expect(page.getByRole('row').nth(1)).toContainText('Anna Schmidt');

    await page.getByRole('columnheader', { name: 'Borrower' }).click();

    await expect(page.getByRole('row').nth(1)).toContainText('Tim Richter');
  });
});
