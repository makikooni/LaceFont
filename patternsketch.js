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
let panelTop = 70;

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  noFill();
  strokeWeight(1.5);
  angleMode(RADIANS);

  const goBackButton = document.querySelector('.button-container');
  if (goBackButton) {
    const rect = goBackButton.getBoundingClientRect();
    panelTop = rect.bottom + 10;
  }

  let isMobile = windowWidth < 500;
  let panelWidth = isMobile ? 160 : 200;
  let panelPadding = isMobile ? '12px 0' : '20px 0';
  let panelHeight = isMobile ? 260 : 320;
  let visibleTab = 20;

  // UI Panel
  uiPanel = createDiv();
  uiPanel.style('width', `${panelWidth}px`);
  uiPanel.style('background', '#a1887f');
  uiPanel.style('padding', panelPadding);
  uiPanel.style('text-align', 'center');
  uiPanel.style('display', 'flex');
  uiPanel.style('flex-direction', 'column');
  uiPanel.style('align-items', 'center');
  uiPanel.style('box-shadow', '2px 0 10px rgba(0,0,0,0.2)');
  uiPanel.style('transition', 'transform 0.3s ease');
  uiPanel.style('transform', `translateX(-${panelWidth - visibleTab}px)`);
  uiPanel.style('font-family', 'sans-serif');
  uiPanel.style('border-radius', '0 12px 12px 0');
  uiPanel.style('max-height', `${panelHeight}px`);
  uiPanel.style('overflow', 'hidden');
  uiPanel.position(0, panelTop);

  // Toggle Area
  toggleArea = createDiv();
  toggleArea.size(visibleTab, panelHeight);
  toggleArea.style('cursor', 'pointer');
  toggleArea.style('background', 'transparent'); // visible on mobile
  toggleArea.style('border-radius', '0 8px 8px 0');
  toggleArea.mousePressed(togglePanel);
  toggleArea.position(0, panelTop);

  // Buttons and Sliders
  cleanButton = createButton('Clean Background');
  cleanButton.parent(uiPanel);
  cleanButton.style('margin', '4px 0');
  cleanButton.mousePressed(() => {
    clearBackground = true;
  });

  let tempoLabel = createP('Stitch Tempo');
  tempoLabel.parent(uiPanel);
  tempoLabel.style('color', '#ffffff');
  tempoLabel.style('margin', '8px 0 2px 0');
  speedSlider = createSlider(1, 60, 10, 1);
  speedSlider.parent(uiPanel);
  speedSlider.style('margin-bottom', '8px');
  speedSlider.style('width', isMobile ? '120px' : '160px');

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

  let rainbowLabel = createP('Rainbow Hue?');
  rainbowLabel.parent(uiPanel);
  rainbowLabel.style('color', '#ffffff');
  rainbowLabel.style('margin-bottom', '2px');
  hueCheckbox = createCheckbox('', false);
  hueCheckbox.parent(uiPanel);
  hueCheckbox.style('margin-bottom', '8px');
  hueCheckbox.changed(() => {
    useRainbow = hueCheckbox.checked();
  });
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

function togglePanel() {
  panelVisible = !panelVisible;

  const panelWidth = uiPanel.elt.offsetWidth || 200;
  const toggleWidth = toggleArea.elt.offsetWidth || 20;
  const visibleTab = 20;

  if (panelVisible) {
    uiPanel.style('transform', 'translateX(0)');
    toggleArea.position(panelWidth - toggleWidth, panelTop);
  } else {
    uiPanel.style('transform', `translateX(-${panelWidth - visibleTab}px)`);
    toggleArea.position(0, panelTop);
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  setTimeout(() => {
    const goBackButton = document.querySelector('.button-container');
    if (goBackButton) {
      const rect = goBackButton.getBoundingClientRect();
      panelTop = rect.bottom + 10;

      const panelWidth = uiPanel.elt.offsetWidth || 200;
      const toggleWidth = toggleArea.elt.offsetWidth || 20;
      const visibleTab = 20;

      uiPanel.position(0, panelTop);
      toggleArea.position(panelVisible ? panelWidth - toggleWidth : 0, panelTop);
    }
  }, 50);

  let isMobile = windowWidth < 500;
  let panelHeight = isMobile ? 260 : 320;
  toggleArea.size(20, panelHeight);
  uiPanel.style('max-height', `${panelHeight}px`);
}
