//"updates from the worker" handler
function update(workerMessage) {
  // clear the non-canvas label once the canvas is labelling things for us
  var label = document.getElementById('waiting-label')
  label.style.display = "none";

  // worker has no reference to window.speechSynthesis available, must speak here
  var label = workerMessage.data.message;
  var lang = workerMessage.data.lang;
  if (lang && label !== lastSpokenLabel) {
    /* the display text can be updated much faster than the words are read aloud,
     * so I clear the utterance queue before "speaking" to try and get text/audio
     * to match as much as possible */
    window.speechSynthesis.cancel();
    var utter = new SpeechSynthesisUtterance(label)
    utter.lang = lang;
    window.speechSynthesis.speak(utter);
    lastSpokenLabel = label;
  }

  window.requestAnimationFrame(sendFrameData);
}

// this is the "send updates to the worker" method
function sendFrameData() {
  // can't avoid the drawImage/getImageData loop AFAICT
  sendFrameCtx.drawImage(document.querySelector('video'), 0, 0);
  var imgData = sendFrameCtx.getImageData(0, 0, sendFrameCtx.canvas.width, sendFrameCtx.canvas.height)

  var textLang = document.getElementById('text-select').value;
  var audioLang = document.getElementById('audio-select').value;

  worker.postMessage({frameImageData: imgData, text: textLang, audio: audioLang});
}

function startWebWorker(canvas) {
  // there are actually *two* canvas elements. This one is used to copy video frames to the worker
  sendFrameCtx = new OffscreenCanvas(canvas.width, canvas.height).getContext('2d');

  // and this is the one defined in index.html, controlled by the worker to display bounding boxes and labels
  var offscreen = canvas.transferControlToOffscreen();
  worker.onmessage = update;
  worker.postMessage({canvas: offscreen}, [offscreen]);
}

var sendFrameCtx = null;
var lastSpokenLabel = "";
const worker = new Worker("scripts/web-worker.js");
