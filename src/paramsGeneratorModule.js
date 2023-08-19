const { KEYWORDS, BOOSTER_KEYWORDS, STYLE_KEYWORD, TYPE_KEYWORD } = require('./constant/keywords');
const { Configuration, OpenAIApi } = require("openai");
require('dotenv').config()

/**
 * Generate pictures settings translated in every langages, by ChatGPT
 * Not using trendingKeywords currently
 * 
 * @param {Array} trendingKeywords Trending keywords of the day of upload
 * @return {Object}
 */
const paramsGeneratorModule = async(trendingKeywords) => {
  const maxKeyword = 50;
  const maxKeywordLength = 255;
  const characterCount = Math.random() < 0.1 ? 0 : Math.random() > 0.9 ? 2 : 1;

  const booster = BOOSTER_KEYWORDS[Math.floor(Math.random() * BOOSTER_KEYWORDS.length)];
  const type = TYPE_KEYWORD[0];

  const keywords = [];
  let params = {};
  let uploadKeywords = "";

  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  });
  const openai = new OpenAIApi(configuration);

  // Adding 0, 1 or 2 characters
  const charactersSet = new Set();
  let keyword;
  for (let i = 0; i < characterCount; i++) {
    while (!keyword || charactersSet.has(keyword)) {
      keyword = KEYWORDS.character[Math.floor(Math.random() * KEYWORDS.character.length)];
    }

    keywords.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
    charactersSet.add(keyword);
  }

  // Adding an event if no character
  if (!characterCount) {
    keyword = KEYWORDS.event[Math.floor(Math.random() * KEYWORDS.event.length)];
    keywords.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));
  }

  // Adding a location
  keyword = KEYWORDS.location[Math.floor(Math.random() * KEYWORDS.location.length)];
  keywords.push(keyword.charAt(0).toUpperCase() + keyword.slice(1));

  // Adding a style
  let style;
  let isCharacterStyle;
  while (!style || isCharacterStyle && !characterCount) {
    style = STYLE_KEYWORD[Math.floor(Math.random() * STYLE_KEYWORD.length)];
    isCharacterStyle = style.style.toLowerCase().includes("face") || style.style.toLowerCase().includes("character") || style.style.toLowerCase().includes("psycho") || style.style.toLowerCase().includes("caricature") || style.style.toLowerCase().includes("portrait");
  }

  // QUERIES OPENAI (Title, Description)
  const roleText = "Tu es un redacteur web polyglote connu pour la qualité de tes textes d'un point de vue compréhension et optimisation du référencement naturel.";
  const keywordsText = `Les mots clés à utiliser pour créer ton texte sont: ${keywords}`;

  const titleMessages = [
    {"role": "system", "content": roleText},
    {"role": "user", "content": `Je veux que tu inventes un texte de entre 5 et 6 mots. Ce titre sera un titre logique d'une scène d'image de ${style.style}, et devra inclure tous les mots clés renseignés, et des adjectifs mélioratifs. Ce texte devra être traduis en anglais, allemand, français et espagnol sous la forme d'un objet javascript en ajoutant les traductions dans les clés "en", "de", "fr", "es". Ta réponse ne contiendra que cet objet.`},
    {"role": "user", "content": `Exemple: {"en": "My title", "de": "Mein Titel", "fr": "Mon titre", "es": "Mi título"}`},
    {"role": "user", "content": keywordsText}
  ]
  const queryTitle = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: titleMessages
  });
  const descMessages = [
    {"role": "system", "content": roleText},
    {"role": "user", "content": `Je veux que tu inventes un texte de entre 250 et 300 caractères, en incluant les mots clés renseignés, qui va décrire une image de ${type} à partir de mots clés. Ce texte devra être traduis en anglais, allemand, français et espagnol sous la forme d'un objet javascript en ajoutant les traductions dans les clés "en", "de", "fr", "es". Ta réponse ne contiendra que cet objet.`},
    {"role": "user", "content": `Exemple: {"en": "My description", "de": "Mein Beschreibung", "fr": "Ma description", "es": "Mi descripción"}`},
    {"role": "user", "content": keywordsText}
  ]
  const queryDescription = await openai.createChatCompletion({
    model: "gpt-3.5-turbo",
    messages: descMessages
  });

  let queryResults = await Promise.all([queryTitle, queryDescription])
  
  keywords.push(style.style);

  let title = queryResults[0].data.choices[0].message.content
  let description = queryResults[0].data.choices[0].message.content;

  for (let i = 0; i < maxKeyword; i++) {
    const keyIndex = i % keywords.length;
    const keyword = keywords[keyIndex];
    let singleSpam = "";

    while (`${singleSpam} ${keyword}`.length < maxKeywordLength - 2) {
      singleSpam += `${keyword} `;
    }

    if (singleSpam.length > 0) {
      singleSpam = singleSpam.slice(0, singleSpam.length - 1);
    }

    uploadKeywords += `${singleSpam} ${i},`
  } 

  if (uploadKeywords.length > 0) {
    uploadKeywords = uploadKeywords.slice(0, uploadKeywords.length - 1);
  }

  params = {
    keywords,
    type,
    style,
    title: {booster, title: JSON.parse(title)},
    description: JSON.parse(description),
    uploadKeywords
  }

  return params;
}

module.exports = {
  paramsGeneratorModule
}