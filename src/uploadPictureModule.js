const fs = require("fs").promises;
const puppeteer = require("puppeteer-extra");
const { pause } = require("./utils");
require("dotenv").config();

/**
 * Upload generated and enhanced picture to your redbubble account
 * 
 * @param {string} settings Picture settings determined by ChatGPT
 * @param {string} imgName Image name in /pictures/toupload 
 * @param {string} outputPath picture path
 */
async function uploadPictureModule(settings, imgName, outputPath) {
  const cookiePath = "./cookie/session.json";
  const StealthPlugin = require("puppeteer-extra-plugin-stealth");
  puppeteer.use(StealthPlugin());
  const { executablePath } = require("puppeteer");
  const browser = await puppeteer.launch({
    ignoreDefaultArgs: ["--disable-extensions", "--enable-automation"],
    args: [
      '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36"',
      "--start-maximized",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-dbus",
      "--disable-remote-fonts",
    ],
    headless: false,
    defaultViewport: null,
    userDataDir: "./user_data",
    executablePath: executablePath(),
  });
  const page = await browser.newPage();

  try {
    try {
      await fs.access(cookiePath, fs.constants.F_OK);
      const fileContent = await fs.readFile(cookiePath, "utf-8");
      const cookies = JSON.parse(fileContent);
      await page.setCookie(...cookies);
    } catch (e) {
      console.log("No cookie session saved.");
    }

    await page.goto(process.env.REDBUBBLE_URL, { waitUntil: "networkidle2" });

    try {
      await page.waitForSelector('a[data-testid="ds-header-login-action"]', {
        visible: true,
        timeout: 5000,
      });

      await pause(true, 5, 2);
      await page.goto("https://www.redbubble.com/fr/auth/login");

      await page.waitForSelector('input[name="cognitoUsername"]', {
        visible: true,
      });
      await page.type(
        'input[name="cognitoUsername"]',
        process.env.REDBUBBLE_LOGIN
      );

      await page.waitForSelector('input[name="password"]', { visible: true });
      await page.type('input[name="password"]', process.env.REDBUBBLE_PW);

      await page.waitForSelector(
        ".app-ui-components-Button-Button_button_1_MpP.app-ui-components-Button-Button_primary_pyjm6.app-ui-components-Button-Button_padded_1fH5b",
        { visible: true }
      );
      await pause(true, 5, 2);
      await page.click(
        ".app-ui-components-Button-Button_button_1_MpP.app-ui-components-Button-Button_primary_pyjm6.app-ui-components-Button-Button_padded_1fH5b"
      );

      await page.waitForNavigation({ waitUntil: "networkidle0" });

      const cookies = await page.cookies();
      await fs.writeFile(cookiePath, JSON.stringify(cookies));
    } catch (e) {
      console.log("Already Logged", e);
    }
    await pause(true, 15, 2);

    // NAVIGATE TO THE UPLOAD PICTURE PAGE
    await page.goto(
      "https://www.redbubble.com/portfolio/images/new?ref=dashboard",
      { waitUntil: "networkidle2" }
    );

    //LOAD PICTURE
    const x = 215;
    const y = 290;
    try {
      await page.waitForSelector("#select-image-single", {
        visible: true,
        timeout: 25000,
      });
    } catch {
      console.log("Clicking on the captcha with pixels dimension");
      await pause(true, 5, 2);
      await page.mouse.click(x, y);
    }

    try {
      await page.waitForSelector("#select-image-single", {
        visible: true,
        timeout: 5000,
      });
    } catch {
      console.log("Clicking on the captcha with pixels dimension 2");
      await pause(true, 5, 2);
      await page.mouse.click(x, y);
    }

    await page.waitForSelector("#select-image-single", {
      visible: true,
      timeout: 20000,
    });
    await pause(true, 5, 2);
    const inputElement = await page.$("#select-image-single");
    await inputElement.uploadFile(outputPath);

    await pause(true, 5, 2);
    // SET SETTINGS
    await Promise.all([
      pause(false, 60),
      (async (settings) => {
        await page.evaluate(() => {
          document.querySelector("#work_safe_for_work_true").click();
          document.querySelector("#rightsDeclaration").click();
        });
        await page.select("#work_default_product", "poster");

        await page.waitForSelector("#work_title_fr", { visible: true });
        await page.waitForTimeout(500);

        await page.evaluate((settings) => {
          document.querySelector(
            "#work_title_fr"
          ).value = `${settings.title.booster} ${settings.title.title.fr}`;
          document.querySelector("#work_tag_field_fr").value =
            settings.uploadKeywords;
          document.querySelector("#work_description_fr").value =
            settings.description.fr;
          document.querySelector("#language-tab-en").click();
        }, settings);

        await page.waitForTimeout(500);
        await page.waitForSelector("#work_artist_translate_en");
        await page.click("#work_artist_translate_en");
        await page.waitForTimeout(500);
        await page.evaluate((settings) => {
          document.querySelector(
            "#work_title_en"
          ).value = `${settings.title.booster} ${settings.title.title.en}`;
          document.querySelector("#work_tag_field_en").value =
            settings.uploadKeywords;
          document.querySelector("#work_description_en").value =
            settings.description.en;
          document.querySelector("#language-tab-de").click();
        }, settings);

        await page.waitForTimeout(500);
        await page.waitForSelector("#work_artist_translate_de");
        await page.click("#work_artist_translate_de");
        await page.waitForTimeout(500);
        await page.evaluate((settings) => {
          document.querySelector(
            "#work_title_de"
          ).value = `${settings.title.booster} ${settings.title.title.de}`;
          document.querySelector("#work_tag_field_de").value =
            settings.uploadKeywords;
          document.querySelector("#work_description_de").value =
            settings.description.de;
          document.querySelector("#language-tab-es").click();
        }, settings);

        await page.waitForTimeout(500);
        await page.waitForSelector("#work_artist_translate_es");
        await page.click("#work_artist_translate_es");
        await page.waitForTimeout(500);
        await page.evaluate((settings) => {
          document.querySelector(
            "#work_title_es"
          ).value = `${settings.title.booster} ${settings.title.title.es}`;
          document.querySelector("#work_tag_field_es").value =
            settings.uploadKeywords;
          document.querySelector("#work_description_es").value =
            settings.description.es;
        }, settings);
      })(settings),
    ]);

    // ACTIVATE EVERY PRODUCTS
    await page.evaluate(() => {
      for (const element of document.getElementsByClassName("enable-all")) {
        element.click();
      }
    });
    await pause(true, 5, 2);
    await page.evaluate(() => {
      document.querySelector("#submit-work").click();
    });
    await pause(false, 60);
  } catch (e) {
    console.log(`Upload picture has failed on ${imgName} : ${e}`);
    await browser.close();
    await fs.unlink(outputPath, fs.constants.F_OK);
    process.exit();
  }

  console.log(`Upload picture of ${imgName} has been done successfully !`);
  await browser.close();
  await fs.unlink(outputPath, fs.constants.F_OK);
}


module.exports = {
  uploadPictureModule,
};
