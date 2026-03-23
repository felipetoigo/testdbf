import { chromium } from 'playwright';

export class GameStats {
    private wonCount: number = 0;
    private lostCount: number = 0;
    private unknownCount: number = 0;

    constructor(private allHeroData: Array<[string, string, string]>) {
        this.calculateCounts();
    }

    private calculateCounts() {
        for (const [, , skillBase] of this.allHeroData) {
            if (skillBase === 'won') {
                this.wonCount++;
            } else if (skillBase === 'lost') {
                this.lostCount++;
            } else {
                this.unknownCount++;
            }
        }
    }

    getWonCount(): number {
        return this.wonCount;
    }

    getLostCount(): number {
        return this.lostCount;
    }

    getUnknownCount(): number {
        return this.unknownCount;
    }
}

export class HeroStats {
    private heroCounts: Record<string, { won: number, lost: number, total: number }> = {};

    constructor(private allHeroData: Array<[string, string, string]>) {
        this.calculateHeroCounts();
    }

    private calculateHeroCounts() {
        for (const [heroName, result, skillBase] of this.allHeroData) {
            if (heroName) {
                if (!this.heroCounts[heroName]) {
                    this.heroCounts[heroName] = { won: 0, lost: 0, total: 0 };
                }

                this.heroCounts[heroName].total++;

                if (result === 'Won Match' || skillBase === 'won') {
                    this.heroCounts[heroName].won++;
                } else if (result === 'Lost Match' || skillBase === 'lost') {
                    this.heroCounts[heroName].lost++;
                }
            }
        }
    }

    getHeroCounts(): Record<string, { won: number, lost: number, total: number }> {
        return this.heroCounts;
    }
}

(async () => {
    // Launch the browser in non-headless mode
    const browser = await chromium.launch({ headless: false });

    // Create a new page
    const page = await browser.newPage();

    // Array to store all hero data
    const allHeroData: Array<[string, string, string]> = [];

    // Iterate through each page
    for (let pageNumber = 1; pageNumber <= 2; pageNumber++) {
        // Navigate to the Dotabuff matches overview page for the specified player
        await page.goto(`https://www.dotabuff.com/players/97758803/matches?enhance=overview&page=${pageNumber}`);

        // Wait for the page to load completely
        await page.waitForLoadState('networkidle');

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
        }
    }

    const gameStats = new GameStats(allHeroData);
    console.log('\n ################################# \n');
    console.log('Number of won registers:', gameStats.getWonCount());
    console.log('Number of lost registers:', gameStats.getLostCount());
    console.log('Number of unknown registers:', gameStats.getUnknownCount());
    console.log('\n ################################# \n');

    const heroStats = new HeroStats(allHeroData);
    console.log('Hero Counts:');
    const sortedHeroCounts = Object.entries(heroStats.getHeroCounts()).sort((a, b) => b[1].total - a[1].total);
    for (const [heroName, counts] of sortedHeroCounts) {
    const { won, lost, total } = counts;
    console.log(`${heroName}: ${total} games (Won: ${won}, Lost: ${lost})`);
}


    // Close the browser
    await browser.close();
})();
