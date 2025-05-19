let currentLayer = 0;
let maxLayers = 30;
let animate = true;
let frameCounter = 0;
let hasPlayedOnce = false;
let clearBackground = false;

let speedSlider;
let cleanButton;
let animCheckbox;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noFill();
  strokeWeight(1.5);
  angleMode(RADIANS);

  // Speed Slider
  createP('Animation Speed').position(420, 10).style('color', '#fff');
  speedSlider = createSlider(1, 60, 10, 1);
  speedSlider.position(400, 50);

  // Clean Background Button
  cleanButton = createButton('Clean Background');
  cleanButton.position(250, 50);
  cleanButton.mousePressed(() => {
    clearBackground = true;
  });

  // Animate Checkbox
createP('Constant?').position(560, 10).style('color', '#fff');
  animCheckbox = createCheckbox("", false); // Start unchecked
  animCheckbox.position(580, 50);
  animCheckbox.style('color', '#fff');
  animCheckbox.changed(() => {
    if (animCheckbox.checked()) {
      currentLayer = 0;
      frameCounter = 0;
      animate = true;
      hasPlayedOnce = false;
    }
  });
}

function draw() {
  // Background fading
  if (clearBackground) {
    background(10, 80, 20, 100); // Full wipe
    clearBackground = false;
  } else {
    background(10, 80, 20, 9); // Trail mode
  }

  // Glowing trails
  blendMode(ADD);
  for (let i = 0; i < currentLayer; i++) {
    drawRadialPattern(i);
  }
  blendMode(BLEND);

  // One-time growing animation
  if (animate && !hasPlayedOnce) {
    frameCounter++;
    if (frameCounter % speedSlider.value() === 0) {
      currentLayer++;

      if (currentLayer >= maxLayers) {
        animate = false;
        hasPlayedOnce = true;
        animCheckbox.checked(false); // Visually uncheck the box
      }
    }
  }
}

function drawRadialPattern(layer) {
  push();
  translate(width / 2, height / 2);

  let arms = int(map(mouseX, 0, width, 4, 100));
  let radius = layer * map(mouseY, 0, height, 20, 100);
  let r = map(mouseX + mouseY, 40, width + height, 20, 80);

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
