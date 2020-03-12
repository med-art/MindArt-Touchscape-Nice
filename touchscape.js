// orientation and direction for resizing the image
let storedOrientation, currentOrientation, rotateDirection = -1;

// declare all brush variables
let rakeX = 0,
  rakeY = 0,
  inverter = 1,
  angle1, segLength, driftX, driftY;

// mouse Tracking
let isMousedown = 0;

let vMax, selector;
let introText = ["Touchez et Ecoutez", "Regardez", "Dessinez"];
let appCol = "#469ede"; // 70, 158, 222
let slide = 4; // current app is starting at 4 to prevent any behaviour before first button press.
let delayTime = 13000; // this is the for each slide change
let introComplete = 0;

//DATA
let pointStore;
let lineStore;


function preload() {
  //load all brush assets and background
  img_rake = loadImage('assets/rake2b.png');
  img_background = loadImage('assets/sand_01.jpg');
  audio = loadSound('assets/audio_01.mp3');
  click = loadSound('assets/click.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bLayer = createGraphics(width, height);
  textLayer = createGraphics(width, height);
  introLayer = createGraphics(width, height);
  colorMode(HSB, 360, 100, 100, 1.0);

  introLayer.fill(255, 30);
  introLayer.blendMode(BLEND);
  introLayer.noStroke();

  pixelDensity(1); // effectively ignores retina displays

  calcDimensions();
  sizeWindow();
  slide = 0;
  slideShow();

  // all event listeners
  canvas.addEventListener('touchmove', moved);
  canvas.addEventListener('mousemove', moved);
  canvas.addEventListener('touchstart', touchdown);
  canvas.addEventListener('mousedown', touchdown);
  canvas.addEventListener('touchend', touchstop);
  canvas.addEventListener('touchleave', touchstop);
  canvas.addEventListener('mouseup', touchstop);

  //DATA
  pointStore = [];
  lineStore = [];

}

function draw() {
  if (introComplete === 1) {
    imageMode(CORNER);
    blendMode(BLEND);
    image(img_background, 0, 0, width, height);
    blendMode(OVERLAY);
    image(bLayer, 0, 0, windowWidth, windowHeight);
  } else {
    blendMode(BLEND);
    image(img_background, 0, 0, width, height);
    blendMode(MULTIPLY);
    image(introLayer, 0, 0, width, height);
    blendMode(BLEND);
    if (slide > 0) {
      textLayer.text(introText[slide - 1], width / 2, (height / 3) * (slide - 1));
    }
    image(textLayer, 0, 0, width, height);
    introBrush(driftX, driftY);
    driftX = driftX + (random(0, 4)) * inverter;
    if (driftX <= 0 || driftX >= width) {
      inverter = -inverter;
      driftX = driftX + (30 * inverter);
    }
    driftY = driftY + (random(-0.5, 1.5));
  }
}

function touchdown(ev) {
  isMousedown = 1;
  if (slide === 0) {
    startUp();
  }
  return false;
}

function touchstop(ev) {
  isMousedown = 0;

  //DATA
  if (introComplete === 1) {
    lineStore.push(pointStore);
    pointStore = [];
  }
  //  console.log(lineStore);
}

function startUp() {
  click.play();
  startButton.remove();
  slide++;
  if (audio.isPlaying()) {} else {
    audio.loop(1);
  }
  slideShow();
}

function moved(ev) {
  if (!isMousedown) return;
  ev.preventDefault();
  if (introComplete === 1) {
    bLayer.blendMode(BLEND);
    dx = winMouseX - rakeX;
    dy = winMouseY - rakeY;
    angle1 = atan2(dy, dx);
    rakeX = winMouseX - (cos(angle1) * segLength);
    rakeY = winMouseY - (sin(angle1) * segLength);

    //DATA
    pressure = getPressure(ev);
    pointStore.push({
      time: new Date().getTime(),
      x: rakeX,
      y: rakeY,
      pressure: pressure
    });

    segment(rakeX, rakeY, angle1, img_rake, ev, pressure)
  } else {
    if (slide === 0) {
      slide++;
      slideShow();
    } else if (slide > 0) {
      introBrush(mouseX, mouseY);

    }
  }
  return false;
}

function introBrush(_x, _y) {
  let randX = int(randomGaussian(-1, 1));
  let randY = int(randomGaussian(-1, 1));
  let randR = int(random(vMax * 16, vMax * 20))
  introLayer.ellipse(_x + randX, _y + randY, randR);
}

function segment(rakeX, rakeY, a, rake, ev, pressure) {
  bLayer.imageMode(CENTER);
  bLayer.push();
  bLayer.translate(rakeX, rakeY);
  bLayer.rotate(a);
  bLayer.scale(0.87); // change this value to vary brush size manually
  // to enable pressure sensitivity - bLayer.scale((pressure / 1.5) + 0.5)
  bLayer.image(rake, 0, 0, 0, 0);
  bLayer.pop();
}

function resetTimeout() {
  setTimeout(reset, 50);
}
getPressure = function (ev) {
  return ((ev.touches && ev.touches[0] && typeof ev.touches[0]["force"] !== "undefined") ? ev.touches[0]["force"] : 1.0);
}

function reset() {
  click.play();
  blendMode(REPLACE);
  image(img_background, 0, 0, width, height);
  bLayer.clear();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  sizeWindow();

  if (introComplete === 1) {
    removeElements();
    writeTextUI();
  }
}

function rotateWindow() {
  var newbLayer = createGraphics(windowWidth, windowHeight);
  newbLayer.push();
  newbLayer.translate(width / 2, height / 2);
  newbLayer.rotate((PI / 2) * rotateDirection);
  newbLayer.translate(-height / 2, -width / 2);
  newbLayer.image(bLayer, 0, 0, windowHeight, windowWidth);
  newbLayer.pop()
  bLayer.resizeCanvas(windowWidth, windowHeight);
  bLayer = newbLayer;
  rotateDirection = rotateDirection * -1;
}

function stretchWindow() {
  var newbLayer = createGraphics(windowWidth, windowHeight);
  newbLayer.image(bLayer, 0, 0, windowWidth, windowHeight);
  bLayer.resizeCanvas(windowWidth, windowHeight);
  bLayer = newbLayer;
}

function sizeWindow() {
  // canvas.width = window.innerWidth;
  // canvas.height =  window.innerHeight;
  image(img_background, 0, 0, width, height);
  if (width < height) {
    currentOrientation = "portrait";
  } else {
    currentOrientation = "landscape";
  }
  if (currentOrientation === storedOrientation) {
    stretchWindow();
  } else {
    rotateWindow();
  }
  storedOrientation = currentOrientation;
  segLength = width / 15;
  calcDimensions();
  img_rake.resize(vMax * 3, vMax * 11);
  textLayer.resizeCanvas(windowWidth, windowHeight);
  bLayer.tint(255, 190);
  driftX = width / 2;
  driftY = 0;
}
