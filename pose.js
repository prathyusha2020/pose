const video = document.getElementById('video');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');

const poseModel = new mediapipe.Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
  }
});

poseModel.setOptions({
  modelComplexity: 1,
  enableSegmentation: true,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

poseModel.onResults(processResults);

const stream = navigator.mediaDevices.getUserMedia({ video: true })
  .then((stream) => {
    video.srcObject = stream;
    video.play();
    video.onloadedmetadata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      detectPose();
    };
  })
  .catch((error) => {
    console.log('Error accessing camera:', error);
  });

function detectPose() {
  requestAnimationFrame(detectPose);
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  poseModel.send({ image: canvas });
}

function processResults(results) {
  context.save();
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(results.segmentationMask, 0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = 'source-in';
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = 'source-over';
  context.lineWidth = 5;
  context.strokeStyle = '#FF0000';
  results.poseLandmarks.forEach((landmark) => {
    context.beginPath();
    context.moveTo(landmark.x * canvas.width, landmark.y * canvas.height);
    context.lineTo((landmark.x + landmark.z) * canvas.width, (landmark.y + landmark.w) * canvas.height);
    context.stroke();
  });
  context.restore();
}
