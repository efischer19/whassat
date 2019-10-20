/* once we have permission to access the user's camera,
 * set that video stream as the main canvas' source
 * and start the web worker, which processes displayed frames */
function setVideoStream(stream) {
  // the video's loaddeddata event functions as our "ready to start processing" signal from the page
  video.addEventListener("loadeddata", function() {
    /* some trickery here - I was having problems getting the <video> element that displays
     * frames to line up properly with the <canvas> that displays object boundary boxes.
     * The trick is to *not* define any restrictions on the video stream returned by
     * getUserMedia below, then key on the returned value to size the box canvas. */
    var canvas = document.querySelector('canvas');
    canvas.style.left = "" + video.offsetLeft + "px";
    canvas.width = video.offsetWidth;
    canvas.height = video.offsetHeight;

    // now that the canvases are lined up, our web worker can start
    startWebWorker(canvas);
  });
  video.srcObject = stream;
};

// script-scoped reference to video element
const video = document.querySelector('video');

if (("OffscreenCanvas" in window)) {
  // default flow: ask for permission to open a camera stream, preferring the rear-facing camera if available
  navigator.mediaDevices.getUserMedia({video: {facingMode: "environment"}})
    .then(setVideoStream);
} else {
  // hide things that make no sense if you failed the feature check
  for (element in 
    [
      document.getElementById('waiting-label'),
      document.getElementById('videobox'),
      document.getElementById('lang-select')
    ]) {
    element.style.display = "none";
  }
  // and display the error message
  var noCompat = document.getElementById('no-compat');
  noCompat.style.display = "block";
}
