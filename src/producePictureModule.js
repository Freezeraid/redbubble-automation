const sharp = require("sharp");
const Replicate = require("replicate");
const axios = require("axios");
const fs = require("fs").promises;
require("dotenv").config();

/**
 * Create a picture via IA on replicate.com
 * Only supporting landscaped pictures
 * Currently, trending keywords are not used...
 * IA used is Dreamshaper. Change replicate.run() first argument to switch to another IA and check the parameters required by the new one, entered as the second argument.
 * 
 * @param {string} settings Picture settings determined by ChatGPT
 * @param {string} imgName Image name in /pictures/generated 
 * @return {string}
 */
async function producePictureModule(settings, imgName) {
  const extension = settings.type === "Landscape" ? ".jpg" : ".png";
  const originalWidth = settings.type === "Landscape" ? 832 : 768;
  const originalHeight = 576;

  // GENERATE IMAGE VIA DREAMSHAPER
  const inputPath = `./pictures/generated/${imgName}${extension}`;
  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_KEY,
  });
  const version =
    "ed6d8bee9a278b0d7125872bddfb9dd3fc4c401426ad634d8246a660e387475b";

  const negative_prompt =
    "canvas frame, body out of frame, logo, ((deformed face)), ugly, bad art, ((extra limbs)), close up, ((blurry)), ((fusion)), ((inexpressive)),((duplicate)), nude, blurry hands, ((blurry face)), ((blurry  eyes)),  ((poorly drawn eyes)), ((mutation)), bad anatomy, (bad proportions), malformed limbs, missing limbs, (fused fingers), (too many fingers), (long neck), (extra objects), cross-eye"
  const prompt = `${settings.title.title.en.toLowerCase()}, ${
    settings.style.prompt
  }`;
  console.log("Prompt:", prompt);
  const output = await replicate.run(
    `cjwbw/dreamshaper:${version}`,
    {
      input: {
        prompt,
        negative_prompt,
        num_outputs: 1, 
        width: originalWidth,
        height: originalHeight,
        guidance_scale: 7.5,
        num_inference_steps: 40,
        scheduler: "K_EULER_ANCESTRAL"
      },
    }
  );

  await axios
    .get(output[0], { responseType: "arraybuffer" })
    .then(async (response) => {
      await fs.writeFile(
        inputPath,
        Buffer.from(response.data, "binary"),
        "binary"
      );
      console.log("Image downloaded and saved successfully");
    })
    .catch((error) => {
      console.error("Error downloading image:", error);
      process.exit()
    });

  // ENHANCE IMAGE
  const width = settings.type === "Landscape" ? 12768 : 3200;
  const format = settings.type === "Landscape" ? 16 / 9 : 1;
  const outputPath = `./pictures/toupload/${imgName}${extension}`;

  try {
    await fs.access(inputPath, fs.constants.F_OK);

    await sharp(inputPath)
      .resize(width, Math.ceil(width / format), {
        kernel: sharp.kernel.lanczos3,
      })
      .sharpen({ sigma: 5 })
      .modulate({ saturation: 1.4 })
      .toFile(outputPath);
    console.log(`Image resized successfully: ${outputPath}`);
    await fs.unlink(inputPath, fs.constants.F_OK);
  } catch (error) {
    console.error("Error while resizing picture:", error);
    await fs.unlink(inputPath, fs.constants.F_OK);
    process.exit()
  }

  return outputPath;
}

module.exports = { producePictureModule };
