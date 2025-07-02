const videoElement = document.getElementById('input_video');
const predictionDisplay = document.getElementById('prediction');

// Setup MediaPipe Hands
const hands = new Hands({
  locateFile: file => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});
hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: 0.7,
  minTrackingConfidence: 0.5
});

hands.onResults(onResults);

// Access the camera
const camera = new Camera(videoElement, {
  onFrame: async () => {
    await hands.send({ image: videoElement });
  },
  width: 640,
  height: 480
});
camera.start();

function onResults(results) {
  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const landmarks = results.multiHandLandmarks[0].map(point => [point.x, point.y, point.z]).flat();

    fetch('/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ landmarks: landmarks })
    })
    .then(res => res.json())
    .then(data => {
      if (data.prediction) {
        predictionDisplay.textContent = data.prediction;
      } else if (data.error) {
        predictionDisplay.textContent = "خطأ: " + data.error;
      }
    })
    .catch(error => {
      console.error('Prediction error:', error);
      predictionDisplay.textContent = "حدث خطأ...";
    });

  } else {
    predictionDisplay.textContent = "جاري التنبؤ ....";
  }
}