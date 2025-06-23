const { default: axios } = require("axios");

const fetchPage = async (url) => {
  const { data } = await axios.get(url, {
    headers: {
      "User-Agent": "MyNodeCrawlerBot/1.0; (alausaabdulazeez@gmail.com)",
    },
  });
  return data;
};

module.exports = { fetchPage };
