let introText = ["Touchez et Ecoutez", "Regardez", "Dessinez"];
let appCol = "#469ede"; // 70, 158, 222
let slide = 4; // current app is starting at 4 to prevent any behaviour before first button press.
// this is illogical, need to rephrase.
let delayTime = 13000; // this is the for each slide change
let introState = 0;
let startButton;



function slideShow() {
  if (slide === 0) {
    introLayer.background(60, 150, 255, 255);
    startButton = createButton(introText[0]);
    startButton.class("startButton");
    startButton.position((width / 2) - (20 * vMax), (height / 2) - (4 * vMax));
    startButton.mousePressed(startUp);
  }
  if (slide === introText.length) {
    textLayer.clear();
    introState = 3;
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
        delayTime = 10000;
      }
      slide++;
        setTimeout(slideShow, delayTime);
    }
  }
}
