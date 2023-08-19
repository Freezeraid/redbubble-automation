const fs = require("fs").promises;
const { pause } = require("./utils");
const { getTrendingKeywordsModule } = require("./getTrendingKeywordsModule");
const { paramsGeneratorModule } = require("./paramsGeneratorModule");
const { producePictureModule } = require("./producePictureModule");
const { uploadPictureModule } = require("./uploadPictureModule");
require("dotenv").config();

(async () => {
  const today = new Date();
  // Indicate in this environmental value the date on which you created your account and entered all the information required to validate it.
  // No image upload before account validation
  const launchDate = new Date(process.env.START_DATE);
  // WAIT AT LEAST 7 DAYS IN ORDER TO GET THE REDBUBBLE ACCOUNT VERIFIED
  const waitingDays = 7;
  let difference = -Math.floor((today - launchDate.setDate(launchDate.getDate() + waitingDays)) / (1000 * 60 * 60 * 24));
  if (difference > 0) {
    console.log(
      `Still waiting at least ${difference} days for the store to be online.`
    );
    return;
  }

  // RANDOM DELAY (5 * 60 seconds max) TO UPLOAD TO BYPASS SOME BOT DETECTION
  const maxDelaySeconds = 5 * 60;
  console.log("Random timeout to pass bot detection...");
  await pause(true, maxDelaySeconds);
  console.log("Script starts now");

  const formattedDate = today.toISOString().split("T")[0];
  const timeStr = `${today.getHours()}-${today.getMinutes()}-${today.getSeconds()}-${today.getMilliseconds()}`;

  let trendingKeywords = [];
  const trendsFileName = `./src/historic/trends_${formattedDate}.json`;

  // GET TRENDING KEYWORDS
  try {
    await fs.access(trendsFileName, fs.constants.F_OK);
    const fileContent = await fs.readFile(trendsFileName, "utf-8");
    const trendsData = JSON.parse(fileContent);
    trendingKeywords = trendsData.trends;
  } catch (error) {
    console.log("Fetching trends on redbubble website...");
    trendingKeywords = await getTrendingKeywordsModule(formattedDate);
  }
  console.log("Trending Keywords:", trendingKeywords);

  // GET PICTURE SETTINGS
  console.log("Creating picture params...");
  const pictureSettings = await paramsGeneratorModule(trendingKeywords);
  console.log("Picture Settings:", pictureSettings);

  // GET PICTURE TO UPLOAD
  const imgName = `${formattedDate}-${timeStr}`;
  console.log("Generating picture with Dreamshaper AI Model on replicate.com ...");
  const outputImgPath = await producePictureModule(pictureSettings, imgName);

  // UPLOAD PICTURE THEN DELETE IT
  console.log("Uploading picture on Redbubble...");
  await uploadPictureModule(pictureSettings, imgName, outputImgPath);
  console.log("Script ends now");
})();
