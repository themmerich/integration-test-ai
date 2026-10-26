import { expect, test } from '@playwright/test';

test.describe('LoansPage e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the loan table as start page', async ({ page }) => {
    await expect(page.getByText('Kredite', { exact: true })).toBeVisible();
    await expect(page.getByRole('columnheader')).toHaveCount(10);
    await expect(page.getByRole('cell', { name: 'Anna Schmidt' })).toBeVisible();
  });

  test('sorts by borrower', async ({ page }) => {
    await page.getByRole('columnheader', { name: 'Kreditnehmer' }).click();

    await expect(page.getByRole('row').nth(1)).toContainText('Anna Schmidt');

    await page.getByRole('columnheader', { name: 'Kreditnehmer' }).click();

    await expect(page.getByRole('row').nth(1)).toContainText('Tim Richter');
  });

  test('filters rows with the global search', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Kredite durchsuchen' }).fill('Baufinanzierung');

    await expect(page.locator('tbody tr')).toHaveCount(3);
    await expect(page.getByRole('cell', { name: 'Markus Weber' })).toBeHidden();
  });

  test('hides a column via the column toggle', async ({ page }) => {
    await page.getByText('10 Spalten').click();
    await page.getByRole('option', { name: 'Kreditnehmer' }).click();
    await page.keyboard.press('Escape');

    await expect(page.getByRole('columnheader')).toHaveCount(9);
    await expect(page.getByRole('columnheader', { name: 'Kreditnehmer' })).toBeHidden();
  });

  test('resizes a column by dragging its border', async ({ page }) => {
    const header = page.getByRole('columnheader', { name: 'Kreditart' });
    const before = (await header.boundingBox())!;

    await page.mouse.move(before.x + before.width - 2, before.y + before.height / 2);
    await page.mouse.down();
    await page.mouse.move(before.x + before.width + 80, before.y + before.height / 2, { steps: 5 });
    await page.mouse.up();

    const after = (await header.boundingBox())!;
    expect(after.width).toBeGreaterThan(before.width + 40);
  });

  test('exports the filtered rows as CSV', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Kredite durchsuchen' }).fill('Baufinanzierung');
    // The table applies the global filter after its filterDelay; export only once it is in effect.
    await expect(page.locator('tbody tr')).toHaveCount(3);

    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'CSV' }).click();
    const download = await downloadPromise;

    expect(download.suggestedFilename()).toBe('kredite.csv');
    const stream = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of stream) {
      chunks.push(chunk as Buffer);
    }
    const lines = Buffer.concat(chunks).toString('utf8').trim().split('\n');
    expect(lines).toHaveLength(4);
    expect(lines[0]).toContain('"Kreditnehmer"');
    expect(lines[1]).toContain('"Baufinanzierung"');
  });
});

test.describe('Loan filter form e2e', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('restricts the table by borrower and status', async ({ page }) => {
    await page.getByLabel('Kreditnehmer', { exact: true }).fill('a');
    // The multiselect's combobox input is visually hidden; open it the keyboard way.
    await page.getByRole('combobox', { name: 'Status' }).focus();
    await page.keyboard.press('ArrowDown');
    await page.getByRole('option', { name: 'Aktiv' }).click();
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Suchen' }).click();

    await expect(page.locator('tbody tr')).toHaveCount(6);
    await expect(page.getByRole('cell', { name: 'Mia Neumann' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'Im Verzug' })).toBeHidden();
  });

  test('restricts the table by amount range', async ({ page }) => {
    await page.getByLabel('Kreditbetrag von').fill('100000');
    await page.getByLabel('Kreditbetrag bis').fill('300000');
    await page.getByRole('button', { name: 'Suchen' }).click();

    await expect(page.locator('tbody tr')).toHaveCount(3);
    await expect(page.getByRole('cell', { name: 'Elena Koch' })).toBeVisible();
  });

  test('restricts the table by disbursement period', async ({ page }) => {
    // The date picker parses keystrokes, so type the range instead of fill()ing it in one go.
    await page.getByLabel('Auszahlungszeitraum').pressSequentially('01.01.2024 - 30.06.2024');
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'Suchen' }).click();

    await expect(page.locator('tbody tr')).toHaveCount(4);
    await expect(page.getByRole('cell', { name: 'Laura Fischer' })).toBeHidden();
  });

  test('resets the form and shows all loans again', async ({ page }) => {
    await page.getByLabel('Kreditnehmer', { exact: true }).fill('Weber');
    await page.getByRole('button', { name: 'Suchen' }).click();
    await expect(page.locator('tbody tr')).toHaveCount(1);

    await page.getByRole('button', { name: 'Zurücksetzen' }).click();

    await expect(page.getByLabel('Kreditnehmer', { exact: true })).toHaveValue('');
    await expect(page.locator('tbody tr')).toHaveCount(10);
  });

  test('shows only as many pages as there are results', async ({ page }) => {
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeVisible();

    await page.getByLabel('Kreditnehmer', { exact: true }).fill('Weber');
    await page.getByRole('button', { name: 'Suchen' }).click();

    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '2', exact: true })).toBeHidden();
  });

  test('returns to the first page when a search narrows the result', async ({ page }) => {
    await page.getByRole('button', { name: '2', exact: true }).click();
    await expect(page.locator('tbody tr')).toHaveCount(2);

    await page.getByLabel('Kreditnehmer', { exact: true }).fill('Weber');
    await page.getByRole('button', { name: 'Suchen' }).click();

    await expect(page.getByRole('cell', { name: 'Markus Weber' })).toBeVisible();
  });

  test('shows an empty message when the form finds nothing', async ({ page }) => {
    await page.getByLabel('Kreditnehmer', { exact: true }).fill('nobody');
    await page.getByRole('button', { name: 'Suchen' }).click();

    await expect(page.getByRole('cell', { name: 'Keine Kredite gefunden.' })).toBeVisible();
    await expect(page.getByRole('button', { name: '1', exact: true })).toBeHidden();
  });

  test('shows an empty message when the global search finds nothing', async ({ page }) => {
    await page.getByRole('searchbox', { name: 'Kredite durchsuchen' }).fill('nobody');

    await expect(page.getByRole('cell', { name: 'Keine Kredite gefunden.' })).toBeVisible();
  });
});
