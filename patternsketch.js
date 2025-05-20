// This code enhances the UI by placing all controls into a compact sliding panel lower on the left side
let currentLayer = 0;
let maxLayers = 30;
let animate = true;
let frameCounter = 0;
let clearBackground = false;
let direction = 1;

let speedSlider;
let cleanButton;
let animCheckbox;
let hueCheckbox;
let useRainbow = false;

let uiPanel;
let panelVisible = false;
let toggleArea;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noFill();
  strokeWeight(1.5);
  angleMode(RADIANS);

  // Create compact UI panel container
  uiPanel = createDiv();
  uiPanel.position(0, windowHeight - 900);
  uiPanel.style('width', '200px');
  uiPanel.style('background', '#a1887f');
  uiPanel.style('padding', '20px 0px');
  uiPanel.style('text-align', 'center');
  uiPanel.style('display', 'flex');
  uiPanel.style('flex-direction', 'column');
  uiPanel.style('align-items', 'center');
  uiPanel.style('box-shadow', '2px 0 10px rgba(0,0,0,0.2)');
  uiPanel.style('transition', 'transform 0.3s ease');
  uiPanel.style('transform', 'translateX(-180px)');
  uiPanel.style('font-family', 'sans-serif');
  uiPanel.style('border-radius', '0 12px 12px 0');
  uiPanel.style('max-height', '300px');
  uiPanel.style('overflow', 'hidden');

  // Add transparent toggle area to the right side of the panel
  toggleArea = createDiv();
  toggleArea.position(0, windowHeight - 900);
  toggleArea.size(20, 250);
  toggleArea.style('cursor', 'pointer');
  toggleArea.style('background', 'transparent');
  toggleArea.mousePressed(togglePanel);

  // Clean Background Button
  cleanButton = createButton('Clean Background');
  cleanButton.parent(uiPanel);
  cleanButton.style('margin', '4px 0 4px 0');
  cleanButton.mousePressed(() => {
    clearBackground = true;
  });

  // Stitch Tempo label and slider
  let tempoLabel = createP('Stitch Tempo');
  tempoLabel.parent(uiPanel);
  tempoLabel.style('color', '#ffffff');
  tempoLabel.style('margin-bottom', '2px');
  tempoLabel.style('margin-top', '8px');
  speedSlider = createSlider(1, 60, 10, 1);
  speedSlider.parent(uiPanel);
  speedSlider.style('margin-bottom', '8px');

  // Animate Checkbox
  let weaveLabel = createP('Constant Weave?');
  weaveLabel.parent(uiPanel);
  weaveLabel.style('color', '#ffffff');
  weaveLabel.style('margin-bottom', '2px');
  animCheckbox = createCheckbox('', true);
  animCheckbox.parent(uiPanel);
  animCheckbox.style('margin-bottom', '8px');
  animCheckbox.changed(() => {
    animate = animCheckbox.checked();
  });

  // Rainbow Hue Checkbox
  let rainbowLabel = createP('Rainbow Hue?');
  rainbowLabel.style('color', '#ffffff');
  rainbowLabel.parent(uiPanel);
  rainbowLabel.style('margin-bottom', '2px');
  hueCheckbox = createCheckbox('', false);
  hueCheckbox.parent(uiPanel);
  hueCheckbox.style('margin-bottom', '8px');
  hueCheckbox.changed(() => {
    useRainbow = hueCheckbox.checked();
  });
}

function togglePanel() {
  panelVisible = !panelVisible;
  if (panelVisible) {
    uiPanel.style('transform', 'translateX(0)');
    toggleArea.position(173, windowHeight - 900);
  } else {
    uiPanel.style('transform', 'translateX(-180px)');
    toggleArea.position(0, windowHeight - 900);
  }
}

function draw() {
  if (clearBackground) {
    background(10, 80, 20, 100);
    clearBackground = false;
  } else {
    background(10, 80, 20, 9);
  }

  blendMode(ADD);
  for (let i = 0; i < currentLayer; i++) {
    drawRadialPattern(i);
  }
  blendMode(BLEND);

  if (animate) {
    frameCounter++;
    if (frameCounter % speedSlider.value() === 0) {
      currentLayer += direction;
      if (currentLayer >= maxLayers) direction = -1;
      else if (currentLayer <= 0) direction = 1;
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

    if (useRainbow) {
      let hueValue = (frameCount + layer * 10) % 360;
      stroke(hueValue, 80, 100, 60);
    } else {
      stroke(100, 60);
    }

    ellipse(radius, 0, r / 2, r);
    line(radius, 0, radius + 5, 0);
    pop();
  }
  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  uiPanel.position(0, windowHeight - 320);
  if (panelVisible) {
    toggleArea.position(200, windowHeight - 320);
  } else {
    toggleArea.position(20, windowHeight - 320);
  }
}
