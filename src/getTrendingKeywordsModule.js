const puppeteer = require("puppeteer");
const cheerio = require("cheerio");
const fs = require("fs");
require("dotenv").config();

/**
 * Returns a list of today trending keywords based on input search from redbubble website. Store them in ./historic folder
 *
 * @param {string} formattedDate string date for json file name
 * @return {Array}
 */
async function getTrendingKeywordsModule(formattedDate) {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
      headless: true,
    });
    const page = await browser.newPage();
    await page.goto(process.env.REDBUBBLE_URL, { waitUntil: "networkidle2" });

    await page.waitForSelector(
      ".node_modules--redbubble-design-system-react-headerAndFooter-components-Typeahead-components-desktop-Box-Input-styles__term--2hJyR",
      { visible: true }
    );
    await page.focus(
      ".node_modules--redbubble-design-system-react-headerAndFooter-components-Typeahead-components-desktop-Box-Input-styles__term--2hJyR"
    );

    await page.waitForSelector(
      ".node_modules--redbubble-design-system-react-Box-styles__box--2Ufmy",
      { visible: true }
    );

    const content = await page.content();
    const $ = cheerio.load(content);

    const trendingKeywords = [];
    $(
      "div.node_modules--redbubble-design-system-react-Box-styles__box--2Ufmy.node_modules--redbubble-design-system-react-headerAndFooter-components-Typeahead-components-styles__overflowEllipsis--3V9NW"
    ).each((_, element) => {
      const keywordSpan = $(element).find(
        "span.node_modules--redbubble-design-system-react-Box-styles__box--2Ufmy.node_modules--redbubble-design-system-react-Text-styles__text--23E5U.node_modules--redbubble-design-system-react-Text-styles__body--3StRc"
      );
      if (keywordSpan) {
        trendingKeywords.push(keywordSpan.text().trim());
      }
    });

    await browser.close();

    const trendsData = {
      date: formattedDate,
      trends: trendingKeywords,
    };

    fs.writeFileSync(
      `src/historic/trends_${formattedDate}.json`,
      JSON.stringify(trendsData, null, 2)
    );
    return trendingKeywords;
  } catch (error) {
    console.error("Error:", error);
  }
}

module.exports = {
  getTrendingKeywordsModule,
};
