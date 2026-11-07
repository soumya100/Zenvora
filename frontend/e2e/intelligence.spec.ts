import { test, expect } from '@playwright/test';

test.describe('Zenvora Google-Style Search Intelligence', () => {
  test('1. Math & Calculation Expression OneBox', async ({ page }) => {
    await page.goto('/?q=25%20*%2040%20%2F%203');
    await expect(page.locator('text=Calculator Result')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=333.333333')).toBeVisible();
    await expect(page.locator('button:has-text("Copy")')).toBeVisible();
  });

  test('2. Currency Conversion OneBox', async ({ page }) => {
    await page.goto('/?q=100%20USD%20to%20EUR');
    await expect(page.locator('text=Currency Conversion')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=/\\d+(\\.\\d+)?\\s*EUR/')).toBeVisible();
  });

  test('3. Unit Conversion OneBox', async ({ page }) => {
    await page.goto('/?q=10%20km%20to%20miles');
    await expect(page.locator('text=Unit Conversion')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=6.21371 miles')).toBeVisible();
  });

  test('4. World Clock & Timezone OneBox', async ({ page }) => {
    await page.goto('/?q=time%20in%20Tokyo');
    await expect(page.locator('text=Local Time & World Clock')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Time in Tokyo, Japan')).toBeVisible();
  });

  test('5. Direct Fact OneBox (Capitals)', async ({ page }) => {
    await page.goto('/?q=capital%20of%20France');
    await expect(page.locator('text=Direct Fact')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Paris')).toBeVisible();
  });

  test('6. Person Search, Knowledge Card & People Also Ask', async ({ page }) => {
    await page.goto('/?q=Elon%20Musk');
    // Verify Knowledge Card (Instant Knowledge)
    await expect(page.locator('text=Instant Knowledge')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('h2:has-text("Elon Musk")')).toBeVisible();
    // Verify People Also Ask interactive questions
    await expect(page.locator('text=People Also Ask')).toBeVisible();
    await expect(page.locator("button:has-text('Elon Musk')").first()).toBeVisible();
  });

  test('7. "Did You Mean?" Spell Correction Banner', async ({ page }) => {
    await page.goto('/?q=albrt%20einstien');
    // Verify spell correction banner appears
    await expect(page.locator('text=Did you mean:')).toBeVisible({ timeout: 10000 });
    const suggestionBtn = page.locator('button:has-text("Albert Einstein")');
    await expect(suggestionBtn).toBeVisible();

    // Click suggestion and verify search updates
    await suggestionBtn.click();
    await expect(page.locator('h2:has-text("Albert Einstein")')).toBeVisible({ timeout: 10000 });
  });

  test('8. Dark / Light Mode Theme Switching', async ({ page }) => {
    await page.goto('/');
    const themeBtn = page.locator('button[aria-label="Toggle dark/light theme"]');
    await expect(themeBtn).toBeVisible({ timeout: 8000 });

    const isInitiallyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    await themeBtn.click();
    await page.waitForTimeout(300);

    const isAfterToggleDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
    expect(isInitiallyDark).not.toBe(isAfterToggleDark);
  });

  test('9. Search Category Tabs Switching', async ({ page }) => {
    await page.goto('/?q=spacecraft');
    await expect(page.locator('#tab-images')).toBeVisible({ timeout: 8000 });

    await page.evaluate(() => {
      const btn = document.querySelector('#tab-images');
      if (btn) (btn as HTMLButtonElement).click();
    });

    await page.waitForFunction(() => window.location.search.includes('category=images'), { timeout: 8000 });
  });

  test('10. Home Page Search Execution & Navigation', async ({ page }) => {
    await page.goto('/');
    const searchInput = page.locator('input[type="text"], input[type="search"]').first();
    await expect(searchInput).toBeVisible({ timeout: 8000 });

    await searchInput.fill('privacy search');
    await page.keyboard.press('Enter');

    await page.waitForFunction(() => window.location.search.includes('q=privacy'), { timeout: 8000 });
  });
});
