import { expect, test } from '@playwright/test';

test.describe('AppLayout e2e', () => {
  test('navigates between pages via the sidebar and marks the current page', async ({ page }) => {
    await page.goto('/');
    const loanOverview = page.getByRole('link', { name: 'Loan overview' });
    const primengDemo = page.getByRole('link', { name: 'PrimeNG demo' });
    await expect(loanOverview).toHaveAttribute('aria-current', 'page');

    await primengDemo.click();

    await expect(page).toHaveURL(/\/demo$/);
    await expect(page.getByText('PrimeNG + Transloco Smoke Test')).toBeVisible();
    await expect(primengDemo).toHaveAttribute('aria-current', 'page');
    await expect(loanOverview).not.toHaveAttribute('aria-current', 'page');

    await loanOverview.click();

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
    await expect(page.getByRole('link', { name: 'PrimeNG demo' })).toBeHidden();

    await page.getByRole('button', { name: 'Toggle menu' }).click();

    await expect(page.getByRole('link', { name: 'PrimeNG demo' })).toBeVisible();
  });
});
