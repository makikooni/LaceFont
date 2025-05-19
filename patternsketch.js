let currentLayer = 0;
let maxLayers = 30;
let animate = true;
let frameCounter = 0;
let clearBackground = false;
let direction = 1;

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
  createP('Stitch Tempo').position(30, 200).style('color', '#fff');
  speedSlider = createSlider(1, 60, 10, 1);
  speedSlider.position(25, 240);

  // Clean Background Button
  cleanButton = createButton('Clean Background');
  cleanButton.position(30, 170);
  cleanButton.mousePressed(() => {
    clearBackground = true;
  });

  // Animate Checkbox (start checked)
  createP('Constant Weave?').position(30, 260).style('color', '#fff');
  animCheckbox = createCheckbox("", true); // ✅ Start checked
  animCheckbox.position(50, 300);
  animCheckbox.style('color', '#fff');
  animCheckbox.changed(() => {
    animate = animCheckbox.checked(); // toggles ongoing animation
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

  // Oscillating animation logic
  if (animate) {
    frameCounter++;
    if (frameCounter % speedSlider.value() === 0) {
      currentLayer += direction;

      if (currentLayer >= maxLayers) {
        direction = -1; // shrink
      } else if (currentLayer <= 0) {
        direction = 1; // grow
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
