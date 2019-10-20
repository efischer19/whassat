# Scripts

All the "verbs" that happen on this page come from scripts in this directory. Here's a high level overview:

## External code

The heavy tensorflow lifting comes from `tfjs` and `coco-ssd`, neither of which I wrote. The projects' respective home pages are [`tfjs`]() and [`coco-ssd`](), and they are usually included in HTML via script tags like this:

```
<script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs"></script>
<script src="https://cdn.jsdelivr.net/npm/@tensorflow-models/coco-ssd"></script>
```

However, since I was focusing this project on being a totally standalone <6MB bundle, I've just `curl -O`'d them from those urls and hosted them in my s3 bucket. This also greatly simplified the PWA/service worker caching strategy, since I know all my resources come from just one place.

## Code I wrote

- `register-service-worker.js`: Like it says, registers the service worker. Called by `index.html`, knows where to find `service-worker.js` and how to handle the A2HS (add to home screen) prompt.
- `start-camera.js`: Another tough title for this script called by `index.html`. Assuming your browser passes a rudimentary feature check ([OffScreenCanvas](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) yes/no), it will load a video stream, dynamically resize the drawing canvas atop the live stream, and start the backgroud worker thread.
- `worker-interface.js`: This script defines how the main thread interacts with my background thread. It has two main functions, sending and receiving data to/from the other thread. When the main thread sends an update *to* the worker, it consists of a new video frame to analizye. Updates *from* the worker consist of the current label to be spoken if appropriate and indicate that the worker is ready for another frame. This script contains all speech synthesis code, as that's only available via a [`window` reference](https://developer.mozilla.org/en-US/docs/Web/API/Window/speechSynthesis).
- `lang-dicts.js`: Literally, just a dict of object classes in several languages. I took the classes [directly from coco-ssd code](https://github.com/tensorflow/tfjs-models/blob/75ba186dad87c6bd45cf8b2588cb0eae454553fa/coco-ssd/src/classes.ts), bash'd that file into newline-and-quote delimited words, and fed that through [Translatr](https://translatr.varunmalhotra.xyz/). A little more bash magic (and remembering that `'` is a valid in-word character in French), and I have my dictionary. Order does matter, I assume `lang_classes[x][n]` is a valid translation of the `y` language word `lang_classes[y][n]` into the `x` language.
- `web-worker.js`: My [web worker](https://www.w3schools.com/html/html5_webworkers.asp). It loads the external code above using my small model file, then receives frames of video. On getting a frame, it asks coco-ssd to detect some objects and their bounding boxes. Then it labels each item visually and draws the bounding boxes on an [`OffScreenCanvas` element](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas) before asking for another frame.
