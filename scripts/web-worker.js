if( 'function' === typeof importScripts) {
  importScripts('tfjs.js', 'coco-ssd.js', 'lang-dicts.js');
}

async function predict(image, text, audio) {
  // Classify the image. Limit of 10 items chosen arbitrarily by me.
  const predictions = await model.detect(image, 10);

  // process i18n transforms before drawing labels
  if (text !== "en") {
    predictions.forEach(function(prediction) {
      var endex = language_classes["en"].indexOf(prediction.class);
      prediction.enBase = prediction.class;
      prediction.class = language_classes[text][endex];
    });
  }

  drawPredictions(predictions);

  // potentially need to transform the returned label-to-be-spoken into chosen audio language
  if (audio && predictions.length > 0) {
    var baseDex = language_classes[text].indexOf(predictions[0].class);
    postMessage({message: language_classes[audio][baseDex], lang: audio});
  } else {
    postMessage({});
  }
};

function drawPredictions(predictions) {
  offscreenCtx.clearRect(0, 0, offscreenCtx.canvas.width, offscreenCtx.canvas.height);
  if (predictions.length == 0) {
    return;
  }
  drawPredictionsRecurse(predictions, 0);
};

// I unroll the predictions recursively because I want the most-confident box to be drawn last (highest z-layer)
function drawPredictionsRecurse(predictions, index) {
  if (index < predictions.length - 1) {
    drawPredictionsRecurse(predictions, index + 1);
  }
  drawBox(predictions[index], index == 0);
}

function drawBox(prediction, highlightLabel) {
  const x = prediction.bbox[0];
  const y = prediction.bbox[1];
  const width = prediction.bbox[2];
  const height = prediction.bbox[3];

  var light = "#f3e9dc";
  var dark = "#241e4e";
  var thick = 3;
  var thin = 1;

  // Draw the bounding and highlight boxes.
  // light-dark-light should ensure visibility no matter the background
  offscreenCtx.strokeStyle = light;
  offscreenCtx.lineWidth = thick;
  offscreenCtx.strokeRect(x, y, width, height);
  offscreenCtx.strokeStyle = dark;
  offscreenCtx.lineWidth = thin;
  offscreenCtx.strokeRect(x,y, width, height);
  // fill with transparent highlight
  offscreenCtx.globalAlpha = 0.4;
  offscreenCtx.fillStyle = light;
  offscreenCtx.fillRect(x, y, width, height);
  offscreenCtx.globalAlpha = 1;

  // floating label in dark text with light outline
  // enBase means we have 2 labels to draw
  // in that case, I draw at the same coordinates twice with top/bottom textBaseline settings
  offscreenCtx.font = "32px arial";
  offscreenCtx.textAlign = "center";
  offscreenCtx.textBaseline = prediction.enBase? "bottom" : "middle";
  offscreenCtx.strokeStyle = light;
  offscreenCtx.strokeText(prediction.class, x + (width/2), y + (height/2));
  offscreenCtx.fillStyle = dark;
  offscreenCtx.fillText(prediction.class, x + (width/2), y + (height/2));
  if (prediction.enBase) {
    offscreenCtx.textBaseline = "top";
    offscreenCtx.strokeStyle = light;
    offscreenCtx.strokeText(prediction.enBase, x + (width/2), y + (height/2));
    offscreenCtx.fillStyle = dark;
    offscreenCtx.fillText(prediction.enBase, x + (width/2), y + (height/2));
  }


  // highlight most-confident label
  if (highlightLabel) {
    text = offscreenCtx.measureText(prediction.class);
    maxTextWidth = prediction.enBase ? Math.max(text.width, offscreenCtx.measureText(prediction.enBase).width) : text.width;
    offscreenCtx.strokeStyle = "#ce6c47";  // orange and red shades taken from my logo svg
    offscreenCtx.lineWidth = thick;
    textHeight = prediction.enBase ? 80 : 40;  // two labels means the highlight box is twice as tall
    offscreenCtx.strokeRect(x + (width/2) - (maxTextWidth/2) - 5, y + (height/2) - (textHeight/2), maxTextWidth + 10, textHeight);
    offscreenCtx.strokeStyle = "#960200";
    offscreenCtx.lineWidth = thin;
    offscreenCtx.strokeRect(x + (width/2) - (maxTextWidth/2) - 5, y + (height/2) - (textHeight/2), maxTextWidth + 10, textHeight);
  }
};

onmessage = async function(evt) {
  if (evt.data.canvas) {
    offscreenCtx = evt.data.canvas.getContext('2d');
    model = await cocoSsd.load({modelUrl: "/model/model.json"});

    //bootstrap the main-worker dialog by saying "I didn't detect any objects in this not-a-frame"
    postMessage({});
  }
  else {
    predict(evt.data.frameImageData, evt.data.text, evt.data.audio);
  }
}

// script-scoped variables
var offscreenCtx = null;
var model = null;
