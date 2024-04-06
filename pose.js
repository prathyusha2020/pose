// Function to calculate the angle between three points
function calculateAngle(pointA, pointB, pointC) {
  // Calculate vectors AB and BC
  const vectorAB = {
    x: pointB.x - pointA.x,
    y: pointB.y - pointA.y
  };
  const vectorBC = {
    x: pointC.x - pointB.x,
    y: pointC.y - pointB.y
  };

  // Calculate dot product of AB and BC
  const dotProduct = vectorAB.x * vectorBC.x + vectorAB.y * vectorBC.y;

  // Calculate magnitude of vectors
  const magnitudeAB = Math.sqrt(vectorAB.x * vectorAB.x + vectorAB.y * vectorAB.y);
  const magnitudeBC = Math.sqrt(vectorBC.x * vectorBC.x + vectorBC.y * vectorBC.y);

  // Calculate angle in radians using dot product and magnitudes
  const cosTheta = dotProduct / (magnitudeAB * magnitudeBC);
  const angleRad = Math.acos(cosTheta);

  // Convert radians to degrees
  const angleDeg = (angleRad * 180) / Math.PI;

  return angleDeg;
}

// When an image is clicked, let's detect it and display results!
async function handleClick(event) {
  if (!poseLandmarker) {
    console.log("Wait for poseLandmarker to load before clicking!");
    return;
  }

  if (runningMode === "VIDEO") {
    runningMode = "IMAGE";
    await poseLandmarker.setOptions({ runningMode: "IMAGE" });
  }
  // Remove all landmarks drawed before
  const allCanvas = event.target.parentNode.getElementsByClassName("canvas");
  for (var i = allCanvas.length - 1; i >= 0; i--) {
    const n = allCanvas[i];
    n.parentNode.removeChild(n);
  }

  // We can call poseLandmarker.detect as many times as we like with
  // different image data each time. The result is returned in a callback.
  poseLandmarker.detect(event.target, (result) => {
    const canvas = document.createElement("canvas");
    canvas.setAttribute("class", "canvas");
    canvas.setAttribute("width", event.target.naturalWidth + "px");
    canvas.setAttribute("height", event.target.naturalHeight + "px");
    canvas.style =
      "left: 0px;" +
      "top: 0px;" +
      "width: " +
      event.target.width +
      "px;" +
      "height: " +
      event.target.height +
      "px;";

    event.target.parentNode.appendChild(canvas);
    const canvasCtx = canvas.getContext("2d");
    const drawingUtils = new DrawingUtils(canvasCtx);
    for (const landmark of result.landmarks) {
      drawingUtils.drawLandmarks(landmark, {
        radius: (data) => DrawingUtils.lerp(data.from!.z, -0.15, 0.1, 5, 1)
      });
      drawingUtils.drawConnectors(landmark, PoseLandmarker.POSE_CONNECTIONS);
    }

    // Example: Calculate angle between joints
    if (result.landmarks.length >= 3) {
      const jointA = result.landmarks[0].positions[0]; // Example: replace index with desired joint
      const jointB = result.landmarks[0].positions[1]; // Example: replace index with desired joint
      const jointC = result.landmarks[0].positions[2]; // Example: replace index with desired joint
      const angle = calculateAngle(jointA, jointB, jointC);
      console.log("Angle between joints: " + angle + " degrees");
    }
  });
}
