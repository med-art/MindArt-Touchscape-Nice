let img_background, img_rake, bLayer; // all images
let storedOrientation;
let currentOrientation;
let rotateDirection = -1;
// declare all brush variables
let rakeX = 0,
  rakeY = 0,
  angle1, segLength;
//button spacing
let audio;
let hMax, lMax;
let driftX, driftY;
let inverter = 1;
let isMousedown = 0;

function preload() {
  //load all brush assets and background
  img_rake = loadImage('assets/rake2b.png');
  img_background = loadImage('assets/sand_01.jpg')
  audio = loadSound('assets/audio.mp3');
  click = loadSound('assets/click.mp3');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  bLayer = createGraphics(windowWidth, windowHeight);
  textLayer = createGraphics(windowWidth, windowHeight);
  introLayer = createGraphics(windowWidth, windowHeight);
  introLayer.fill(255, 5);
  introLayer.blendMode(BLEND);
  introLayer.noStroke();

  pixelDensity(1); // effectively ignores retina displays
  colorMode(HSB, 360, 100, 100, 1.0);
  calcDimensions();
  sizeWindow();
  slide = 0;
  slideShow();
  if (width < height) {
    storedOrientation = "portrait";
  } else {
    storedOrientation = "landscape";
  }
  canvas.addEventListener('touchmove', moved);
  canvas.addEventListener('mousemove', moved);
  canvas.addEventListener('touchstart', touchdown);
  canvas.addEventListener('mousedown', touchdown);
  canvas.addEventListener('touchend', touchstop);
  canvas.addEventListener('touchleave', touchstop);
  canvas.addEventListener('mouseup', touchstop);


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

function draw() {
  if (introState === 3) {
    imageMode(CORNER);
    blendMode(BLEND);
    image(img_background, 0, 0, width, height);
    blendMode(OVERLAY);
    image(bLayer, 0, 0, windowWidth, windowHeight);
    blendMode(BLEND);
  } else {
    blendMode(BLEND);
    image(img_background, 0, 0, width, height);
    blendMode(MULTIPLY);
    image(introLayer, 0, 0, width, height);
    blendMode(BLEND);
    if (slide > 0) {
      textLayer.text(introText[slide - 1], width / 2, (height / 6) * (slide));
    }
    image(textLayer, 0, 0, width, height);
    introBrush(driftX, driftY);

    driftX = driftX + (random(0, 10)) * inverter;
    if (driftX <= 40 || driftX >= width - 40) {
      inverter = -inverter;
      driftX = driftX + (30 * inverter);
    }
    driftY = driftY + (random(-1, 2));
  }
}


function touchdown(ev) {
  isMousedown = 1;


  if (introState < 3) {
    if (audio.isPlaying()) {} else {
      audio.loop(8);
    }
  }
  if (slide === 0) {
    startUp();
  }
  return false;

}

function touchstop(ev) {
  isMousedown = 0;
}

function startUp() {
  click.play();
  startButton.remove();
  slide++;
  slideShow();
}

function moved(ev) {

  if (!isMousedown) return;
  ev.preventDefault();
  if (introState === 3) {

    bLayer.blendMode(BLEND);
    dx = winMouseX - rakeX;
    dy = winMouseY - rakeY;
    angle1 = atan2(dy, dx);
    rakeX = winMouseX - (cos(angle1) * segLength);
    rakeY = winMouseY - (sin(angle1) * segLength);
    segment(rakeX, rakeY, angle1, img_rake, ev)
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
  for (i = 0; i < 5; i++) {
    let randX = int(randomGaussian(-30, 30));
    let randY = int(randomGaussian(-30, 30));
    let randR = int(random(vMax, vMax * 23))
    introLayer.ellipse(_x + randX, _y + randY, randR);
  }
}

function segment(rakeX, rakeY, a, rake, ev) {
  bLayer.imageMode(CENTER);
  bLayer.push();
  bLayer.translate(rakeX, rakeY);
  bLayer.rotate(a);
  bLayer.scale(0.87); // change this value to vary brush size manually
  // to enable pressure sensitivity - bLayer.scale((getPressure(ev) / 1.5) + 0.5)
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

  if (introState === 3) {
    removeElements();
    writeTextUI();
  }
}
