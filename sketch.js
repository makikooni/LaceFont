let font;
let points = [];
let angle = 0;
let cnv;
let capturer;
let isCapturing = false;
let captureFrames = 120;
let frameCountForGif = 0;

let rSlider, angleStepSlider, speedSlider, sizeSlider;
let fillPicker, strokePicker, strokeWeightSlider, strokeToggle;
let bgPicker, xOffsetSlider, yOffsetSlider, phaseSlider;
let textInput, saveButton, gifButton;
let xAmpSlider, xAngleStepSlider;
let durationSelect;
let loadingMessage;
let hasWarnedPhase = false;

function preload() {
  font = loadFont("fonts/Pacifico-Regular.ttf");
}

function setup() {
  cnv = createCanvas(800, 400);
  cnv.parent('canvas-container');

  let topUIContainer = select('#top-ui-container');
  let uiContainer = select('#ui-container');

  angleMode(DEGREES);

  createUIRowTop(topUIContainer);
  createUIRow1(uiContainer);
  createUIRow2(uiContainer);
  createUIRow3(uiContainer);
  createUIRow4(uiContainer);

  updateTextPoints();

  loadingMessage = createDiv("🎞️ Recording GIF... Please wait...");
  loadingMessage.parent(topUIContainer);
  loadingMessage.style('font-size', '16px');
  loadingMessage.style('font-weight', 'bold');
  loadingMessage.hide();
}

function draw() {
  background(bgPicker.color());

  let r = rSlider.value();
  let angleStep = angleStepSlider.value();
  let waveSpeed = speedSlider.value();
  let ellipseSize = sizeSlider.value();
  let fillCol = fillPicker.color();
  let strokeCol = strokePicker.color();
  let strokeW = strokeWeightSlider.value();
  let strokeEnabled = strokeToggle.checked();
  let xOffset = xOffsetSlider.value();
  let yOffset = yOffsetSlider.value();
  let wavePhase = phaseSlider.value();

  if (angleStep === 0) {
    if (!hasWarnedPhase && wavePhase !== 0) {
      alert("⚠️ Please increase Angle Step above 0 to use Wave Phase.");
      hasWarnedPhase = true;
    }
    phaseSlider.value(0);
    phaseSlider.attribute('disabled', true);
  } else {
    phaseSlider.removeAttribute('disabled');
    hasWarnedPhase = false;
  }

  fill(fillCol);
  if (strokeEnabled) {
    stroke(strokeCol);
    strokeWeight(strokeW);
  } else {
    noStroke();
  }

  let xAmp = xAmpSlider.value();
  let xAngleStep = xAngleStepSlider.value();

  for (let i = 0; i < points.length; i++) {
    let x = points[i].x + xAmp * sin(angle + i * xAngleStep) + xOffset;
    let y = points[i].y + r * sin(angle + i * angleStep + wavePhase) + yOffset;
    ellipse(x, y, ellipseSize, ellipseSize);
  }

  angle += waveSpeed * 0.05;

  if (isCapturing) {
    capturer.capture(cnv.canvas);
    frameCountForGif++;
    if (frameCountForGif >= captureFrames) {
      capturer.stop();
      capturer.save();
      isCapturing = false;
      showUI();
      loadingMessage.hide();
    }
  }
}

function startGifRecording() {
  let durationSec = int(durationSelect.value());
  let framerate = 30;
  captureFrames = durationSec * framerate;

  capturer = new CCapture({
    format: 'gif',
    framerate: framerate,
    workersPath: './'
  });

  hideUI();
  loadingMessage.show();
  isCapturing = true;
  frameCountForGif = 0;
  angle = 0;
  capturer.start();
  manualGifLoop();
}

function manualGifLoop() {
  if (!isCapturing || frameCountForGif >= captureFrames) {
    capturer.stop();
    capturer.save();
    isCapturing = false;
    showUI();
    setTimeout(() => loadingMessage.hide(), 3000);
    return;
  }
  draw();
  capturer.capture(cnv.canvas);
  frameCountForGif++;
  requestAnimationFrame(manualGifLoop);
}

function updateTextPoints() {
  let inputText = textInput.value();
  points = font.textToPoints(inputText, 20, height / 2, height / 2, {
    sampleFactor: 0.2,
    simplifyThreshold: 0
  });
}



function createUIRowTop(parent) {
  let row = createDiv().class('ui-row').parent(parent);
  createDiv("Type Text").parent(row);
  textInput = createInput('hello');
  textInput.parent(row).input(updateTextPoints);

  createDiv("GIF Duration").parent(row);
  durationSelect = createSelect();
  durationSelect.parent(row);
  [2, 4, 6, 8, 10].forEach(sec => durationSelect.option(`${sec} sec`, sec));
  durationSelect.selected('4');

  saveButton = createButton("Save Image").parent(row);
  saveButton.mousePressed(() => saveCanvas('text_visual', 'jpg'));

  gifButton = createButton("Record GIF").parent(row);
  gifButton.mousePressed(startGifRecording);
}

function createUIRow1(parent) {
  let row = createDiv().class('ui-row').parent(parent);
  createDiv("Toggle Stroke").parent(row);
  strokeToggle = createCheckbox('', true).parent(row);

  createDiv("Fill Colour").parent(row);
  fillPicker = createColorPicker('#FFFFFF').parent(row);

  createDiv("Stroke Colour").parent(row);
  strokePicker = createColorPicker('#000000').parent(row);

  createDiv("Stroke Weight").parent(row);
  strokeWeightSlider = createSlider(0, 10, 1, 0.1).parent(row);
}

function createUIRow2(parent) {
  let row = createDiv().class('ui-row').parent(parent);
  createDiv("Background").parent(row);
  bgPicker = createColorPicker('#DDDDDD').parent(row);

  createDiv("Size").parent(row);
  sizeSlider = createSlider(1, 30, 10).parent(row);

  createDiv("X Offset").parent(row);
  xOffsetSlider = createSlider(0, 330, 165).parent(row); // maxWidth / 2

  createDiv("Y Offset").parent(row);
  yOffsetSlider = createSlider(10, 170, 80).parent(row); // 400 / 2
}

function createUIRow3(parent) {
  let row = createDiv().class('ui-row').parent(parent);
  createDiv("Wave Phase").parent(row);
  phaseSlider = createSlider(0, 360, 0).parent(row);

  createDiv("X Amplitude").parent(row);
  xAmpSlider = createSlider(0, 100, 0).parent(row);

  createDiv("X Angle Step").parent(row);
  xAngleStepSlider = createSlider(0, 20, 2, 0.1).parent(row);
}

function createUIRow4(parent) {
  let row = createDiv().class('ui-row').parent(parent);
  createDiv("Amplitude").parent(row);
  rSlider = createSlider(0, 100, 15).parent(row);

  createDiv("Angle Step").parent(row);
  angleStepSlider = createSlider(0, 20, 2, 0.1).parent(row);

  createDiv("Speed").parent(row);
  speedSlider = createSlider(0, 50, 30).parent(row);
}

function hideUI() {
  selectAll('.ui-row').forEach(el => el.hide());
  selectAll('input').forEach(el => el.hide());
  selectAll('button').forEach(el => el.hide());
  selectAll('select').forEach(el => el.hide());
}

function showUI() {
  selectAll('.ui-row').forEach(el => el.show());
  selectAll('input').forEach(el => el.show());
  selectAll('button').forEach(el => el.show());
  selectAll('select').forEach(el => el.show());
}

function windowResized() {
  let maxWidth = 800;
  let newWidth = windowWidth > maxWidth ? maxWidth : windowWidth - 40;
  resizeCanvas(newWidth, 400);
  updateTextPoints();

  // Calculate scale factor relative to 800px
  let scaleFactor = newWidth / maxWidth;

  // Calculate new min/max
  let xMin = -maxWidth / 2 * scaleFactor;
  let xMax = maxWidth / 2 * scaleFactor;
  let yMin = 10 * scaleFactor;
  let yMax = 170 * scaleFactor;

  // Update sliders properly
  xOffsetSlider.elt.min = xMin;
  xOffsetSlider.elt.max = xMax;
  xOffsetSlider.value(constrain(xOffsetSlider.value(), xMin, xMax));

  yOffsetSlider.elt.min = yMin;
  yOffsetSlider.elt.max = yMax;
  yOffsetSlider.value(constrain(yOffsetSlider.value(), yMin, yMax));
}
