const visited = new Set();

export const isVisited = (url) => {
  return visited.has(url);
};

export const markVisited = (url) => {
  visited.add(url);
};
