const fetch = require('node-fetch');

const getRemoteFile = (function getRemoteFile() {
  const cache = {};
  return async (url) => {
    if (cache[url] === undefined) {
      const response = await fetch(url);
      cache[url] = await response.text();
    }
    return cache[url];
  };
}());

module.exports = getRemoteFile;
