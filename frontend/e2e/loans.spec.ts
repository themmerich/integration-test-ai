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
    // The table applies the global filter after its filterDelay; export only once it is in effect.
    await expect(page.locator('tbody tr')).toHaveCount(3);

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

test.describe('Loan filter form e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('restricts the table by borrower and status', async ({ page }) => {
    await page.getByLabel('Borrower', { exact: true }).fill('a');
    // The multiselect's combobox input is visually hidden; open it the keyboard way.
    await page.getByRole('combobox', { name: 'Status' }).focus();
    await page.keyboard.press('ArrowDown');
    await page.getByRole('option', { name: 'Active' }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator('tbody tr')).toHaveCount(6);
    await expect(page.getByRole('cell', { name: 'Mia Neumann' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Overdue' })).toBeHidden();
  });

  test('restricts the table by amount range', async ({ page }) => {
    await page.getByLabel('Amount from').fill('100000');
    await page.getByLabel('Amount to').fill('300000');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator('tbody tr')).toHaveCount(3);
    await expect(page.getByRole('cell', { name: 'Elena Koch' })).toBeVisible();
  });

  test('restricts the table by disbursement period', async ({ page }) => {
    // The date picker parses keystrokes, so type the range instead of fill()ing it in one go.
    await page.getByLabel('Disbursement period').pressSequentially('01/01/2024 - 06/30/2024');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Search' }).click();

    await expect(page.locator('tbody tr')).toHaveCount(4);
    await expect(page.getByRole('cell', { name: 'Laura Fischer' })).toBeHidden();
  });

  test('resets the form and shows all loans again', async ({ page }) => {
    await page.getByLabel('Borrower', { exact: true }).fill('Weber');
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('tbody tr')).toHaveCount(1);

    await page.getByRole('button', { name: 'Reset' }).click();

    await expect(page.getByLabel('Borrower', { exact: true })).toHaveValue('');
    await expect(page.locator('tbody tr')).toHaveCount(10);
  });
});
