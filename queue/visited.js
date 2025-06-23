const visited = new Set();

const isVisited = (url) => {
  return visited.has(url);
};

const markVisited = (url) => {
  visited.add(url);
};

module.exports = { isVisited, markVisited };
