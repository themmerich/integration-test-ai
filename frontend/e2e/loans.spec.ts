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

  test('filters rows with the global search', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search loans' }).fill('mortgage');

    await expect(page.locator('tbody tr')).toHaveCount(3);
    await expect(page.getByRole('cell', { name: 'Markus Weber' })).toBeHidden();
  });

  test('hides a column via the column toggle', async ({ page }) => {
    await page.getByText('10 columns').click();
    await page.getByRole('option', { name: 'Borrower' }).click();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('columnheader')).toHaveCount(9);
    await expect(page.getByRole('columnheader', { name: 'Borrower' })).toBeHidden();
  });

  test('resizes a column by dragging its border', async ({ page }) => {
    const header = page.getByRole('columnheader', { name: 'Type' });
    const before = (await header.boundingBox())!;

    await page.mouse.move(before.x + before.width - 2, before.y + before.height / 2);
    await page.mouse.down();
    await page.mouse.move(before.x + before.width + 80, before.y + before.height / 2, { steps: 5 });
    await page.mouse.up();

    const after = (await header.boundingBox())!;
    expect(after.width).toBeGreaterThan(before.width + 40);
  });

  test('exports the filtered rows as CSV', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Search loans' }).fill('mortgage');

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'CSV' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('loans.csv');
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const lines = Buffer.concat(chunks).toString('utf8').trim().split('\n');
    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain('"Borrower"');
    expect(lines[1]).toContain('"Mortgage"');
  });
});
