function calcDimensions() {
  if (width > height) {
    vMax = width / 100;
  } else {
    vMax = height / 100;
  }
}

function writeTextUI() {
  col = color(0, 0, 0, 0.1);
  colSelect = color(0, 0, 0, 1);
  colH2 = color(230, 20, 74);
  colH3 = color(355, 87, 74);
  textSize(vMax * 2);
  fill(0);
  noStroke();

  resetButton = createButton('Nouveau');
  resetButton.position(windowWidth - (10 * vMax) - (vMax * 5), windowHeight - vMax * 6);
  resetButton.class("select");
  resetButton.position(width - (16 * vMax), height - (7 * vMax));
  resetButton.mousePressed(resetTimeout);
}

function switchSound() {
  if (audio.isPlaying()) {
    audio.stop();
  } else {
    audio.loop();
  }
  return false; // is this needed
}

function slideShow() {
  if (slide === 0) {
    introLayer.background(appCol);
    startButton = createButton(introText[0]);
    startButton.class("startButton");
    startButton.position((width / 2) - (20 * vMax), (height / 2) - (4 * vMax));
    startButton.mousePressed(startUp);
  }
  if (slide === introText.length) {
    textLayer.clear();
    introComplete = 1;
    sizeWindow();
    writeTextUI();
    counter = 0;
  } else if (slide < introText.length && slide > 0) {
    textLayer.clear();
    textLayer.fill(255, 5);
    textLayer.textSize(vMax * 7);
    textLayer.textAlign(CENTER, CENTER);
    textLayer.rectMode(CENTER);
    if (slide > 0) {
      if (slide === introText.length - 1) {
        delayTime = delayTime + 10000;
      }
      slide++;
      setTimeout(slideShow, delayTime);
    }
  }
}
