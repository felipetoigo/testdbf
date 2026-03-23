import { chromium } from 'playwright';

(async () => {
  // Launch the browser in non-headless mode
  const browser = await chromium.launch({ headless: false });

  // Create a new page
  const page = await browser.newPage();

  // Array to store all hero data
  const allHeroData: Array<[string, string, string]> = [];
  
  // Initialize heroCounts object
  const heroCounts: Record<string, { won: number, lost: number, total: number }> = {};

  // Iterate through each page
  for (let pageNumber = 1; pageNumber <= 2; pageNumber++) {
    // Navigate to the Dotabuff matches overview page for the specified player
    await page.goto(`https://www.dotabuff.com/players/97758803/matches?enhance=overview&page=${pageNumber}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000 // 60 segundos
    });
    await page.waitForTimeout(2000); // Espera de 2 segundos

    // Wait for the table to be visible
    try {
      await page.waitForSelector('tbody > tr', { timeout: 10000 });
    } catch (e) {
      console.log(`Warning: Could not find table on page ${pageNumber}`);
      continue;
    }

    // Extract data from the page
    const rows = await page.$$('tbody > tr:not(:first-child)');

    for (const row of rows) {
      const [heroName, result, skillBase] = await row.evaluate(row => {
        const heroName = row.querySelector('.cell-large a')?.textContent;
        const result = row.querySelector('.cell-large div.subtext')?.textContent;

        const winElement = row.querySelector('.won');
        const loseElement = row.querySelector('.lost');

        let skillBase: string;

        if (winElement) {
          skillBase = 'won';
        } else if (loseElement) {
          skillBase = 'lost';
        } else {
          skillBase = 'unknown';
        }

        return [heroName, result, skillBase];
      });

      allHeroData.push([heroName || '', result || '', skillBase]);

      if (heroName) {
        if (!heroCounts[heroName]) {
          heroCounts[heroName] = { won: 0, lost: 0, total: 0 };
        }

        heroCounts[heroName].total++;

        if (result === 'Won Match' || skillBase === 'won') {
          heroCounts[heroName].won++;
        } else if (result === 'Lost Match' || skillBase === 'lost') {
          heroCounts[heroName].lost++;
        }
      }
    }
  }

  // Convert heroCounts object to an array of [heroName, counts] pairs
  const sortedHeroCounts = Object.entries(heroCounts).sort(([, countsA], [, countsB]) => countsB.total - countsA.total);

  // Print the counts to the console
  console.log('Hero Counts:');
  for (const [heroName, counts] of sortedHeroCounts) {
    console.log(`${heroName}: ${counts.total} games (Won: ${counts.won}, Lost: ${counts.lost})`);
  }

  // Count won, lost, and unknown registers
  let wonCount = 0;
  let lostCount = 0;
  let unknownCount = 0;

  for (const [, , skillBase] of allHeroData) {
    if (skillBase === 'won') {
      wonCount++;
    } else if (skillBase === 'lost') {
      lostCount++;
    } else {
      unknownCount++;
    }
  }

  // Print the counts to the console
  console.log('\n ################################# \n');
  console.log('Number of won registers:', wonCount);
  console.log('Number of lost registers:', lostCount);
  console.log('Number of unknown registers:', unknownCount);

  // Close the browser
  await browser.close();
})();
