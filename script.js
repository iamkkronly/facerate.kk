// Wait for the DOM to load before running scripts
document.addEventListener("DOMContentLoaded", async function () {
    console.log("Loading face-api models...");

    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/models');

    console.log("Face-api models loaded successfully.");
});

// Handle image upload
document.getElementById("imageUpload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgElement = document.createElement("img");
            imgElement.id = "uploadedImage";
            imgElement.src = e.target.result;
            imgElement.style.width = "200px";
            imgElement.onload = function () {
                console.log("Image loaded successfully.");
            };
            document.getElementById("imagePreview").innerHTML = "";
            document.getElementById("imagePreview").appendChild(imgElement);
        };
        reader.readAsDataURL(file);
    }
});

// Analyze the face structure
document.getElementById("rateButton").addEventListener("click", async function () {
    const img = document.getElementById("uploadedImage");
    if (!img) {
        document.getElementById("ratingOutput").innerText = "Please upload an image first.";
        return;
    }

    console.log("Analyzing image...");

    // Detect face and landmarks
    const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    if (!detections) {
        document.getElementById("ratingOutput").innerText = "No face detected. Try another image.";
        console.log("No face detected.");
        return;
    }

    console.log("Face detected. Processing landmarks...");

    const landmarks = detections.landmarks;

    // Extract facial points
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();
    const jaw = landmarks.getJawOutline();

    // Calculate ratios for rating
    const eyeDistance = Math.abs(leftEye[0].x - rightEye[0].x);
    const noseSymmetry = Math.abs(nose[0].x - (leftEye[3].x + rightEye[0].x) / 2);
    const jawShape = Math.abs(jaw[0].y - jaw[16].y);

    // Calculate rating (higher symmetry = higher score)
    let score = 10 - (noseSymmetry * 5 + jawShape * 2) / eyeDistance;

    // Ensure score is within 1-10 range
    score = Math.max(1, Math.min(10, score));

    console.log("Calculated face rating:", score);

    // Display rating
    document.getElementById("ratingOutput").innerText = `Your face structure rating: ${score.toFixed(1)}/10`;
});
