class Canvas {
  constructor(id, width, height) {
    this.domElement = document.getElementById(id);
    this.domElement.width = width;
    this.domElement.height = height;
    this.width = width;
    this.height = height;
    this.ctx = this.domElement.getContext('2d');
  }

  makeNoise() {
    for (let x = 0; x < this.width; x += 1) {
      for (let y = 0; y < this.height; y += 1) {
        this.ctx.fillStyle = 'rgb(' + Math.floor(Math.random() * 256) + ', '
          + Math.floor(Math.random() * 256) + ', '
          + Math.floor(Math.random() * 256) + ')';
        this.ctx.fillRect(x, y, 1, 1);
      }
    }
  }

  clear() {
    this.ctx.clearRect(0, 0, this.width, this.height);
  }

  fillRect(x, y, width, height, color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x - width / 2, y - height / 2, width, height);
  }
}

export default Canvas;