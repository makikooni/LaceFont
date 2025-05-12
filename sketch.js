// Ultra-lacey font rendering with full interactive UI and 3D-styled animated weaving
// PDF Summary of Improvements:
// This sketch integrates feedback from earlier iterations by moving from a dot-based font rendering
// to a lace-inspired Bézier thread system. Instead of simply plotting text point ellipses, we use
// a dynamic mask to trace character shapes and connect inner grid points with curved threads. 
// To replicate the spatial depth previously achieved through spheres, we now layer each thread 
// with three Bézier curves (shadow, mid-tone, highlight) and glowing midpoint ellipses. This creates
// a convincing 3D thread illusion while retaining full interactivity with sliders for wave, speed,
// amplitude, offsets, and colour. The resulting effect is both more delicate and typographically rich.

let font;
let points = [];
let maskGfx;
let spacing = 6;

let angle = 0;
let cnv;
let capturer;
let isCapturing = false;
let captureFrames = 120;
let frameCountForGif = 0;

let rSlider, angleStepSlider, speedSlider, sizeSlider, spacingSlider;
let fillPicker, strokePicker, strokeWeightSlider, strokeToggle, threadPicker;
let bgPicker, xOffsetSlider, yOffsetSlider, phaseSlider;
let textInput, saveButton, gifButton;
let xAmpSlider, xAngleStepSlider, noiseSlider;
let durationSelect;
let loadingMessage;
let hasWarnedPhase = false;

function preload() {
  font = loadFont("fonts/Pacifico-Regular.ttf");
}

let pixelDensityFactor = 2;
function setup() {
  pixelDensity(pixelDensityFactor);
  cnv = createCanvas(800, 400);
  cnv.parent('canvas-container');

  let topUIContainer = select('#top-ui-container');
  let uiContainer = select('#ui-container');

  angleMode(DEGREES);

  createUIRowTop(topUIContainer);
  createUIRow1(uiContainer);

  updateTextPoints();

  loadingMessage = createDiv("🎞️ Recording GIF... Please wait...");
  loadingMessage.parent(topUIContainer);
  loadingMessage.style('font-size', '16px');
  loadingMessage.style('font-weight', 'bold');
  loadingMessage.hide();
}
function updateTextPoints() {
  let inputText = textInput.value();
  let scaleSize = sizeSlider.value();
  spacing = spacingSlider.value();

  maskGfx = createGraphics(width, height);
  maskGfx.pixelDensity(1);
  maskGfx.background(0);
  maskGfx.fill(255);
  maskGfx.textFont(font);

  let baseFontSize = 100;
  let visualScale = scaleSize;
  let boundsRef = font.textBounds("hello", 0, 0, baseFontSize);
  let fontHeight = boundsRef.h;
  let targetHeight = 200;
  let correctionFactor = targetHeight / fontHeight;
  let adjustedSize = baseFontSize * correctionFactor * visualScale;

  maskGfx.textSize(adjustedSize);
  let bounds = font.textBounds(inputText, 0, 0, adjustedSize);

  let x = width / 2 - bounds.w / 2;
  let y = height / 2 + bounds.h / 2;
  maskGfx.text(inputText, x, y);
  maskGfx.loadPixels();

  points = [];
  for (let y = 0; y < height; y += spacing) {
    let row = [];
    for (let x = 0; x < width; x += spacing) {
      let offsetX = (y / spacing) % 2 === 0 ? 0 : spacing / 2;
      let px = x + offsetX;
      if (px >= width) continue;

      let inside = false;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          let sx = constrain(px + dx, 0, width - 1);
          let sy = constrain(y + dy, 0, height - 1);
          let c = maskGfx.get(sx, sy);
          if (c[0] > 127) {
            inside = true;
            break;
          }
        }
        if (inside) break;
      }
      row.push(inside ? createVector(px, y) : null);
    }
    points.push(row);
  }
}





function draw() {
  background(bgPicker.color());
  noFill();

  let r = rSlider.value();
  let angleStep = angleStepSlider.value();
  let wavePhase = phaseSlider.value();
  let xAmp = xAmpSlider.value();
  let xAngleStep = xAngleStepSlider.value();
  let xOffset = xOffsetSlider.value();
  let yOffset = yOffsetSlider.value();
  let scaleSize = sizeSlider.value();
  let strokeW = strokeWeightSlider.value();
  let noiseAmt = map(noiseSlider.value(), 0, 10, 10, 0);


  for (let y = 0; y < points.length - 1; y++) {
    for (let x = 0; x < points[y].length; x++) {
      let base = points[y][x];
      if (!base) continue;
      let curr = animatedPoint(base, x, y);

      let nextRow = points[y + 1];
      if (!nextRow) continue;

      let diagLeft = x - 1 >= 0 && nextRow[x - 1] ? animatedPoint(nextRow[x - 1], x - 1, y + 1) : null;
      let diagRight = nextRow[x] ? animatedPoint(nextRow[x], x, y + 1) : null;
      let across = points[y][x + 1] ? animatedPoint(points[y][x + 1], x + 1, y) : null;

      if (diagLeft) drawThread(curr, diagLeft, strokeW, scaleSize, noiseAmt);
      if (diagRight) drawThread(curr, diagRight, strokeW, scaleSize, noiseAmt);
      if (across) drawThread(curr, across, strokeW, scaleSize, noiseAmt);
    }
  }

  noStroke();
  fill(255, 20);
  for (let i = 20; i < width - 20; i += 10) {
    ellipse(i, height - 10, 4.5, 4.5);
    ellipse(i, 10, 4.5, 4.5);
  }

  angle += speedSlider.value() * 0.05;

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

function animatedPoint(base, col, row) {
  let scale = sizeSlider.value() / 10;
  let x = base.x + xAmpSlider.value() * scale * sin(angle + col * xAngleStepSlider.value()) + xOffsetSlider.value();
  let y = base.y + rSlider.value() * scale * sin(angle + row * angleStepSlider.value() + phaseSlider.value()) + yOffsetSlider.value();
  return createVector(x, y);
}

function drawThread(p1, p2) {
  let midX = (p1.x + p2.x) / 2;
  let midY = (p1.y + p2.y) / 2;

  let wave = rSlider.value() * 1.4 * sin((p1.x + p1.y + frameCount) * 0.03 + phaseSlider.value());

  // Add subtle noise distortion
  let noiseAmt =  map(noiseSlider.value(), 0, 10, 10, 0);
  let n = noise(p1.x * 0.01, p1.y * 0.01, frameCount * 0.01);
  let noiseOffset = map(n, 0, 1, -1, 1) * noiseAmt * 10;

  let ctrlOffset = wave + noiseOffset;


  let ctrl1X = lerp(p1.x, midX, 0.5);
  let ctrl1Y = lerp(p1.y, midY, 0.5) + ctrlOffset;
  let ctrl2X = lerp(p2.x, midX, 0.5);
  let ctrl2Y = lerp(p2.y, midY, 0.5) + ctrlOffset;

  let strokeW = strokeWeightSlider.value();

  // Shadow thread
  if (strokeToggle.checked()) {
    stroke(strokePicker.color());
    strokeWeight(strokeW * 0.12);
    bezier(p1.x + 1.5, p1.y + 1.5, ctrl1X + 1.5, ctrl1Y + 1.5, ctrl2X + 1.5, ctrl2Y + 1.5, p2.x + 1.5, p2.y + 1.5);
  }

  // Main thread (mid-tone thread colour)
  stroke(threadPicker.color());
  strokeWeight(strokeW * 0.1);
  bezier(p1.x, p1.y, ctrl1X, ctrl1Y, ctrl2X, ctrl2Y, p2.x, p2.y);


  // Highlight layer
  stroke(fillPicker.color());
  strokeWeight(strokeW * 0.06);
  bezier(p1.x - 1, p1.y - 1, ctrl1X - 1, ctrl1Y - 1, ctrl2X - 1, ctrl2Y - 1, p2.x - 1, p2.y - 1);

  // Mid-thread knot glow
  noStroke();
  let glow = fillPicker.color();
  fill(glow.levels[0], glow.levels[1], glow.levels[2], 60);
  ellipse(midX, midY, strokeW * 1.4, strokeW * 1.4);
  fill(glow.levels[0], glow.levels[1], glow.levels[2], 200);
  ellipse(midX, midY, strokeW * 0.7, strokeW * 0.7);

  // Thread tips
  fill(255, 40);
  ellipse(p1.x, p1.y, strokeW * 0.5, strokeW * 0.5);
  ellipse(p2.x, p2.y, strokeW * 0.5, strokeW * 0.5);
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




function createUIRowTop(parent) {
  let row = createDiv().class('ui-row').parent(parent);

  // ➕ Add Font Selector DIV
  createDiv("Base").parent(row);
  let fontSelect = createSelect();
  fontSelect.option('Pacifico');
  fontSelect.option('Inconsolata Condensed Bold');
    fontSelect.option('Arizonia');
  fontSelect.option('Cookie');
    fontSelect.option('CherryBomb');
    fontSelect.option('Astloch');
  fontSelect.option('Coiny');
      fontSelect.option('Jacquard');
    fontSelect.option('MissFajadose');

  fontSelect.parent(row);
  fontSelect.changed(() => {
    let selected = fontSelect.value();
    if (selected === 'Pacifico') {
      font = loadFont('fonts/Pacifico-Regular.ttf', updateTextPoints);
    } else if (selected === 'Inconsolata Condensed Bold') {
      font = loadFont('fonts/Inconsolata_Condensed-Bold.ttf', updateTextPoints);
    }else if (selected === 'Arizonia') {
      font = loadFont('fonts/Arizonia-Regular.ttf', updateTextPoints);
    }else if (selected === 'Cookie') {
      font = loadFont('fonts/Cookie-Regular.ttf', updateTextPoints);
    } else if (selected === 'MissFajadose') {
      font = loadFont('fonts/MissFajardose-Regular.ttf', updateTextPoints);
    }else if (selected === 'Jacquard') {
      font = loadFont('fonts/Jacquard12Charted-Regular.ttf', updateTextPoints);
    }else if (selected === 'Coiny') {
      font = loadFont('fonts/Coiny-Regular.ttf', updateTextPoints);
    }else if (selected === 'Astloch') {
      font = loadFont('fonts/Astloch-Bold.ttf', updateTextPoints);
    }else if (selected === 'CherryBomb') {
      font = loadFont('fonts/CherryBombOne-Regular.ttf', updateTextPoints);
    }
  });

  // Existing Type Text
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

  createDiv("Underlay Thread").parent(row);
  strokeToggle = createCheckbox('', true).parent(row);

  createDiv("Underlay Thread").parent(row);
  strokePicker = createColorPicker('#000000').parent(row);

  createDiv("Raised Thread").parent(row);
  fillPicker = createColorPicker('#FFFFFF').parent(row);

  createDiv("Working Thread").parent(row);
  threadPicker = createColorPicker('#FFFFFF').parent(row);

  createDiv("Bobbin Ground").parent(row);
  bgPicker = createColorPicker('#fff3f5').parent(row);

  createDiv("Thread Thickness").parent(row);
  strokeWeightSlider = createSlider(0, 10, 1, 0.1).parent(row);

  createDiv("Lacework Size").parent(row);
  sizeSlider = createSlider(0.1, 1.8, 1, 0.1).parent(row);
  sizeSlider.input(updateTextPoints);

  createDiv("Weave Tempo").parent(row);
  speedSlider = createSlider(0, 200, 0).parent(row);

  createDiv("Left/Right").parent(row);
  xOffsetSlider = createSlider(-100, 300, 0).parent(row);

  createDiv("Up/Down").parent(row);
  yOffsetSlider = createSlider(-150, 120, -10).parent(row);

  createDiv("Thread Curve (U/D)").parent(row);
  rSlider = createSlider(0, 100, 10).parent(row);

  createDiv("Loom Shift").parent(row);
  phaseSlider = createSlider(0, 360, 360).parent(row);

  createDiv("Thread Sway (L/R)").parent(row);
  xAmpSlider = createSlider(0, 100, 0).parent(row);

  createDiv("Sway Precision").parent(row);
  xAngleStepSlider = createSlider(0, 20, 2, 0.1).parent(row);

  createDiv("Weave Density").parent(row);
  angleStepSlider = createSlider(0, 20, 2, 0.1).parent(row);

  createDiv("Stich Spacing").parent(row);
  spacingSlider = createSlider(2, 18, 4, 1).parent(row);
  spacingSlider.input(updateTextPoints);

  createDiv("Skill level").parent(row);
  noiseSlider = createSlider(0, 10, 10, 0.5).parent(row);
}


function hideUI() {
  selectAll('.ui-row').forEach(el => el.hide());
  selectAll('input').forEach(el => el.hide());
  selectAll('button').forEach(el => el.hide());
  selectAll('select').forEach(el => el.hide());
}

function showUI() {
  selectAll('.ui-row').forEach(el => {
    el.show();
    el.style('display', 'grid'); // ✅ use grid, not flex
    el.style('grid-template-columns', 'repeat(4, 1fr)');
    el.style('gap', '12px');
  });

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
function saveHighResImage() {
  let scaleFactor = 2;
  let scaledCanvas = createGraphics(width * scaleFactor, height * scaleFactor);

  // Redraw the maskGfx at higher resolution
  scaledCanvas.pixelDensity(1); // Important for consistency
  scaledCanvas.background(bgPicker.color());
  scaledCanvas.noFill();
  scaledCanvas.textFont(font);
  scaledCanvas.textSize(sizeSlider.value() * 100 * scaleFactor);
  scaledCanvas.textAlign(CENTER, CENTER);
  scaledCanvas.fill(255);
  scaledCanvas.text(textInput.value(), scaledCanvas.width / 2, scaledCanvas.height / 2);

  // Save image
  save(scaledCanvas, 'text_visual_highres.png');
}