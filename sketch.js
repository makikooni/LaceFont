let font;
let points = [];
let angle = 0;
let cnv;
let capturer;
let isCapturing = false;
let captureFrames = 120;
let frameCountForGif = 0;

// UI Elements
let rSlider, angleStepSlider, speedSlider, sizeSlider;
let fillPicker, strokePicker, strokeWeightSlider, strokeToggle;
let bgPicker, xOffsetSlider, yOffsetSlider, phaseSlider;
let textInput, saveButton, gifButton;
let durationSelect;
let loadingMessage;

function preload() {
  font = loadFont("fonts/Pacifico-Regular.ttf");
}

function setup() {
  cnv = createCanvas(600, 400);
  angleMode(DEGREES);

  createUIRow1();
  createUIRow2();
  createUIRow3();

  updateTextPoints();

  // Loading message
  loadingMessage = createDiv("🎞️ Recording GIF... Please wait...");
  loadingMessage.position(10, height + 180);
  loadingMessage.style('font-size', '16px');
  loadingMessage.style('font-weight', 'bold');
  loadingMessage.hide(); // hidden until recording starts
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

  fill(fillCol);
  if (strokeEnabled) {
    stroke(strokeCol);
    strokeWeight(strokeW);
  } else {
    noStroke();
  }

  for (let i = 0; i < points.length; i++) {
    let x = points[i].x + xOffset;
    let y = points[i].y + r * sin(angle + i * angleStep + wavePhase) + yOffset;
    ellipse(x, y, ellipseSize, ellipseSize);
  }

  angle += waveSpeed * 0.05;

  if (isCapturing) {
    capturer.capture(cnv.canvas);
    frameCountForGif++;
    console.log(`Capturing frame ${frameCountForGif}/${captureFrames}`);

    if (frameCountForGif >= captureFrames) {
      console.log("✅ GIF capture complete.");
      capturer.stop();
      capturer.save();
      isCapturing = false;
      showUI();
      loadingMessage.hide(); // ⬅️ hide after saving
    }
  }
}

function startGifRecording() {
  console.log("🎥 Starting GIF recording...");

  let durationSec = int(durationSelect.value());
  let framerate = 30;
  captureFrames = durationSec * framerate;

  capturer = new CCapture({
    format: 'gif',
    framerate: framerate,
    workersPath: './'
  });

  hideUI();
  loadingMessage.show(); // ⬅️ show message
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

setTimeout(() => {
  loadingMessage.hide();
}, 10000); // ✅ Delay hiding until GIF download is triggered

    
    console.log("✅ GIF capture complete.");
    return;
  }

  draw();
  capturer.capture(cnv.canvas);
  frameCountForGif++;
  requestAnimationFrame(manualGifLoop);
}

function updateTextPoints() {
  let inputText = textInput.value();
  points = font.textToPoints(inputText, 20, 300, 160, {
    sampleFactor: 0.2,
    simplifyThreshold: 0
  });
}

// === UI Layout ===

function createUIRow1() {
  createDiv("Amplitude").position(10, height + 5);
  rSlider = createSlider(0, 100, 15);
  rSlider.position(10, height + 25).style('width', '100px');

  createDiv("Angle Step").position(130, height + 5);
  angleStepSlider = createSlider(0, 20, 2, 0.1);
  angleStepSlider.position(130, height + 25).style('width', '100px');

  createDiv("Speed").position(250, height + 5);
  speedSlider = createSlider(0, 50, 30);
  speedSlider.position(250, height + 25).style('width', '100px');

  createDiv("Size").position(370, height + 5);
  sizeSlider = createSlider(1, 30, 10);
  sizeSlider.position(370, height + 25).style('width', '100px');
}

function createUIRow2() {
  createDiv("X Offset").position(10, height + 60);
  xOffsetSlider = createSlider(-200, 200, 0);
  xOffsetSlider.position(10, height + 80).style('width', '100px');

  createDiv("Y Offset").position(130, height + 60);
  yOffsetSlider = createSlider(-200, 200, 0);
  yOffsetSlider.position(130, height + 80).style('width', '100px');

  createDiv("Wave Phase").position(250, height + 60);
  phaseSlider = createSlider(0, 360, 0);
  phaseSlider.position(250, height + 80).style('width', '100px');

  createDiv("Stroke Weight").position(370, height + 60);
  strokeWeightSlider = createSlider(0, 10, 1, 0.1);
  strokeWeightSlider.position(370, height + 80).style('width', '100px');

  createDiv("Toggle Stroke").position(500, height + 60);
  strokeToggle = createCheckbox('', true);
  strokeToggle.position(535, height + 80);

  createDiv("GIF Duration").position(620, height + 60);
  durationSelect = createSelect();
  durationSelect.position(620, height + 80);
  [2, 4, 6, 8, 10].forEach(sec => {
    durationSelect.option(`${sec} sec`, sec);
  });
  durationSelect.selected('4');
}

function createUIRow3() {
  createDiv("Type Text").position(10, height + 115);
  textInput = createInput('hello');
  textInput.position(10, height + 135);
  textInput.input(updateTextPoints);

  createDiv("Fill Colour").position(180, height + 115);
  fillPicker = createColorPicker('#FFFFFF');
  fillPicker.position(180, height + 135);

  createDiv("Stroke Colour").position(280, height + 115);
  strokePicker = createColorPicker('#000000');
  strokePicker.position(280, height + 135);

  createDiv("Background").position(380, height + 115);
  bgPicker = createColorPicker('#DDDDDD');
  bgPicker.position(380, height + 135);

  createDiv("Save as JPG").position(500, height + 115);
  saveButton = createButton("Save Image");
  saveButton.position(500, height + 135);
  saveButton.mousePressed(() => saveCanvas('text_visual', 'jpg'));

  createDiv("Record GIF").position(620, height + 115);
  gifButton = createButton("Record GIF");
  gifButton.position(620, height + 135);
  gifButton.mousePressed(startGifRecording);
}

function hideUI() {
  selectAll('div').forEach(el => el.hide());
  selectAll('input').forEach(el => el.hide());
  selectAll('button').forEach(el => el.hide());
  selectAll('select').forEach(el => el.hide());
}

function showUI() {
  selectAll('div').forEach(el => el.show());
  selectAll('input').forEach(el => el.show());
  selectAll('button').forEach(el => el.show());
  selectAll('select').forEach(el => el.show());
}
