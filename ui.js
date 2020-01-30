let vMax, vMin, vW, selector;

function calcDimensions() {
  vW = width / 100;
  if (width > height) {
    vMax = width / 100;
    vMin = height / 100;
  } else {
    vMax = height / 100;
    vMin = width / 100;
  }
}


function writeTextUI() {
  col = color(0, 0, 0, 0.1);
  colSelect = color(0, 0, 0, 1);
  colH2 = color(230, 20, 74);
  colH3 = color(355, 87, 74);
  textSize(vMax*2);
  fill(0);
  noStroke();

  resetButton = createButton('Nouveau');
  resetButton.position(windowWidth - (10 * vMax) - (vMax * 5), windowHeight - vMax * 6);
  resetButton.class("select");
  resetButton.style('font-size', '1.7vmax');
  resetButton.style('height', '5vmax');
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
