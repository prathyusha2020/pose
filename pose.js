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
    context.arc(landmark.x * canvas.width, landmark.y * canvas.height, 5, 0, 2 * Math.PI);
    context.fillStyle = '#FF0000';
    context.fill();
  });
  context.restore();

  // Example: Calculate angle between specified joints
  if (results.poseLandmarks.length >= 3) {
    const jointA = results.poseLandmarks[0]; // Example: replace index with desired joint
    const jointB = results.poseLandmarks[1]; // Example: replace index with desired joint
    const jointC = results.poseLandmarks[2]; // Example: replace index with desired joint
    const angle = calculateAngle(jointA, jointB, jointC);
    console.log("Angle between joints: " + angle + " degrees");
  }
}

function calculateAngle(pointA, pointB, pointC) {
  const vectorAB = {
    x: pointB.x - pointA.x,
    y: pointB.y - pointA.y
  };
  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y
  };

  const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;
  const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y);
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);
  const cosTheta = dotProduct / (magnitudeAB * magnitudeBC);
  const angleRad = Math.acos(cosTheta);
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg;
}
