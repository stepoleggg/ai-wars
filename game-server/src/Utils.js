const getRandomColor = () => {
  return "rgb(" + Math.floor(Math.random() * 256)
  + ", " + Math.floor(Math.random() * 256)
  + ", " + Math.floor(Math.random() * 256) + ")";
};

export { getRandomColor };