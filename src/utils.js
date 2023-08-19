/**
 * Returns a promise when timeout is completed. Necessary to trick bot detector.
 *
 * @param {boolean} isRandom is the timeout random or not
 * @param {number} seconds seconds to wait.
 * @param {number} additionalSeconds minimum seconds to wait
 * @return {Promise}
 */

async function pause(isRandom, seconds, additionalSeconds = 0) {
  let timer = seconds * 1000;
  if (isRandom) {
    timer = Math.floor(Math.random() * timer) + additionalSeconds * 1000;
  }
  return await new Promise((resolve) => setTimeout(resolve, timer));
}

module.exports = {
  pause,
};
