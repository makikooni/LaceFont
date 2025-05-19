let currentLayer = 0;
let maxLayers = 10;
let animate = true;
let frameCounter = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  noFill();
  strokeWeight(1.5);
  angleMode(RADIANS);
}

function draw() {
  background(255, 12); // Soft trailing effect

  for (let i = 0; i < currentLayer; i++) {
    drawRadialPattern(i);
  }

  if (animate && currentLayer < maxLayers) {
    frameCounter++;
    if (frameCounter % 10 === 0) {
      currentLayer++;
    }
  }
}

function drawRadialPattern(layer) {
  push();
  translate(width / 2, height / 2);

  let arms = int(map(mouseX, 0, width, 4, 20));
  let radius = layer * map(mouseY, 0, height, 20, 100);
  let r = map(mouseX + mouseY, 0, width + height, 20, 80);

  for (let a = 0; a < arms; a++) {
    let angle = TWO_PI / arms * a;

    push();
    rotate(angle);

    stroke(100, 60);
    ellipse(radius, 0, r / 2, r);
    line(radius, 0, radius + 5, 0);

    pop();
  }

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
