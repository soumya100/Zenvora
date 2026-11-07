const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

// Ensure screenshots directory exists
const screenshotsDir = path.resolve(__dirname, 'screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

// Import backend app
const { createApp } = require('../../backend/dist/app');

async function runVerification() {
  console.log('========================================================');
  console.log('🧪 Starting Playwright E2E Search Intelligence Verification');
  console.log('========================================================\n');

  // 1. Start Server
  const app = createApp();
  const PORT = 3000;
  const server = await new Promise((resolve, reject) => {
    const s = app.listen(PORT, '127.0.0.1', (err) => {
      if (err) return reject(err);
      console.log(`🚀 Test Server listening at http://127.0.0.1:${PORT}`);
      resolve(s);
    });
  });

  let browser;
  let passed = 0;
  let failed = 0;

  try {
    // 2. Launch Google Chrome via Playwright
    console.log('🌐 Launching Chrome via Playwright...');
    browser = await chromium.launch({
      channel: 'chrome',
      headless: true,
    });
    const context = await browser.newContext({
      viewport: { width: 1280, height: 800 },
    });
    const page = await context.newPage();

    // Helper assertion
    async function runTest(name, testFn) {
      process.stdout.write(`⏳ Running: ${name}... `);
      const start = Date.now();
      try {
        await testFn(page);
        const duration = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`\x1b[32mPASSED\x1b[0m (${duration}s)`);
        passed++;
      } catch (err) {
        const duration = ((Date.now() - start) / 1000).toFixed(2);
        console.log(`\x1b[31mFAILED\x1b[0m (${duration}s)`);
        console.error(`   Error: ${err.message}`);
        failed++;
      }
    }

    // --- TEST 1: Math Calculator ---
    await runTest('Test 1: Math Calculator OneBox (25 * 40 / 3)', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/?q=25%20*%2040%20%2F%203`, { waitUntil: 'networkidle' });
      await page.waitForSelector('text=Calculator Result', { timeout: 8000 });
      const answerEl = await page.waitForSelector('text=333.333333');
      if (!answerEl) throw new Error('Answer 333.333333 not found in DOM');
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test1_calculator.png') });
    });

    // --- TEST 2: Currency Conversion ---
    await runTest('Test 2: Currency Conversion OneBox (100 USD to EUR)', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/?q=100%20USD%20to%20EUR`, { waitUntil: 'networkidle' });
      await page.waitForSelector('text=Currency Conversion', { timeout: 8000 });
      const answerEl = await page.waitForSelector('text=/\\d+(\\.\\d+)?\\s*EUR/', { timeout: 8000 });
      if (!answerEl) throw new Error('Converted currency with EUR not found');
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test2_currency.png') });
    });

    // --- TEST 3: Unit Conversion ---
    await runTest('Test 3: Unit Conversion OneBox (10 km to miles)', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/?q=10%20km%20to%20miles`, { waitUntil: 'networkidle' });
      await page.waitForSelector('text=Unit Conversion', { timeout: 8000 });
      const answerEl = await page.waitForSelector('text=6.21371 miles');
      if (!answerEl) throw new Error('Converted unit 6.21371 miles not found');
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test3_units.png') });
    });

    // --- TEST 4: World Clock ---
    await runTest('Test 4: World Clock OneBox (time in Tokyo)', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/?q=time%20in%20Tokyo`, { waitUntil: 'networkidle' });
      await page.waitForSelector('text=Local Time & World Clock', { timeout: 8000 });
      await page.waitForSelector('text=Time in Tokyo, Japan');
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test4_world_clock.png') });
    });

    // --- TEST 5: Direct Fact ---
    await runTest('Test 5: Direct Fact OneBox (capital of France)', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/?q=capital%20of%20France`, { waitUntil: 'networkidle' });
      await page.waitForSelector('text=Direct Fact', { timeout: 8000 });
      const answerEl = await page.waitForSelector('text=Paris');
      if (!answerEl) throw new Error('Fact answer "Paris" not found');
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test5_fact.png') });
    });

    // --- TEST 6: Person Search, Knowledge Card & People Also Ask ---
    await runTest('Test 6: Person Search & Knowledge Card (Elon Musk)', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/?q=Elon%20Musk`, { waitUntil: 'networkidle' });
      await page.waitForSelector('text=Instant Knowledge', { timeout: 8000 });
      await page.waitForSelector('h2:has-text("Elon Musk")');
      await page.waitForSelector('text=People Also Ask');
      await page.waitForSelector("button:has-text('Elon Musk')");
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test6_knowledge_card.png') });
    });

    // --- TEST 7: Spell Correction ("Did you mean?") ---
    await runTest('Test 7: Spell Correction Banner (albrt einstien -> Albert Einstein)', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/?q=albrt%20einstien`, { waitUntil: 'networkidle' });
      await page.waitForSelector('text=Did you mean:', { timeout: 8000 });
      const suggestionBtn = await page.waitForSelector('button:has-text("Albert Einstein")');
      if (!suggestionBtn) throw new Error('Suggestion button for Albert Einstein not found');
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test7_spell_correction.png') });

      // Click the corrected suggestion and verify navigation
      await suggestionBtn.click();
      await page.waitForSelector('h2:has-text("Albert Einstein")', { timeout: 8000 });
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test7_clicked_correction.png') });
    });

    // --- TEST 8: Dark / Light Mode Theme Toggle ---
    await runTest('Test 8: Theme Switcher (Dark/Light Mode Reactivity)', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
      const themeBtn = await page.waitForSelector('button[aria-label="Toggle dark/light theme"]', { timeout: 8000 });
      if (!themeBtn) throw new Error('Theme toggle button not found');

      // Check initial theme class
      const isInitiallyDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));

      // Toggle theme
      await themeBtn.click();
      await page.waitForTimeout(400);

      const isAfterToggleDark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
      if (isInitiallyDark === isAfterToggleDark) {
        throw new Error('Theme toggle did not alter document dark class');
      }

      await page.screenshot({ path: path.join(screenshotsDir, 'test8_theme_toggled.png') });

      // Revert theme back
      await themeBtn.click();
      await page.waitForTimeout(200);
    });

    // --- TEST 9: Category Tabs Switching ---
    await runTest('Test 9: Category Switching (General -> Images)', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/?q=spacecraft`, { waitUntil: 'networkidle' });
      await page.waitForSelector('#tab-images', { timeout: 8000 });

      // Click "Images" tab directly
      await page.evaluate(() => {
        const btn = document.querySelector('#tab-images');
        if (btn) btn.click();
      });

      await page.waitForFunction(() => window.location.search.includes('category=images'), { timeout: 8000 });
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test9_category_images.png') });
    });

    // --- TEST 10: Home Page Search Execution ---
    await runTest('Test 10: Home Page Search & Navigation', async (page) => {
      await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: 'networkidle' });
      const searchInput = await page.waitForSelector('input[type="text"], input[type="search"]', { timeout: 8000 });
      if (!searchInput) throw new Error('Home search input not found');

      await searchInput.fill('privacy search');
      await page.keyboard.press('Enter');

      await page.waitForFunction(() => window.location.search.includes('q=privacy'), { timeout: 8000 });
      await page.waitForSelector('h2, div[data-testid="result-card"], article, .space-y-4', { timeout: 8000 });
      await page.keyboard.press('Escape');
      await page.screenshot({ path: path.join(screenshotsDir, 'test10_home_search.png') });
    });

  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Browser closed.');
    }
    server.close(() => {
      console.log('🛑 Test server shut down cleanly.');
    });
  }

  console.log('\n========================================================');
  console.log(`📊 Playwright Verification Summary:`);
  console.log(`   Passed: \x1b[32m${passed}\x1b[0m / ${passed + failed}`);
  console.log(`   Failed: \x1b[${failed > 0 ? '31' : '32'}m${failed}\x1b[0m / ${passed + failed}`);
  console.log(`   Screenshots: ${screenshotsDir}`);
  console.log('========================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runVerification().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
