document.addEventListener("DOMContentLoaded", async function () {
    await faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/models');
    await faceapi.nets.faceLandmark68Net.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api@latest/models');
});

document.getElementById("imageUpload").addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const imgElement = document.createElement("img");
            imgElement.id = "uploadedImage";
            imgElement.src = e.target.result;
            imgElement.style.width = "200px";
            document.getElementById("imagePreview").innerHTML = "";
            document.getElementById("imagePreview").appendChild(imgElement);
        };
        reader.readAsDataURL(file);
    }
});

document.getElementById("rateButton").addEventListener("click", async function () {
    const img = document.getElementById("uploadedImage");
    if (!img) {
        document.getElementById("ratingOutput").innerText = "Please upload an image first.";
        return;
    }

    const detections = await faceapi.detectSingleFace(img, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks();
    if (!detections) {
        document.getElementById("ratingOutput").innerText = "No face detected. Try another image.";
        return;
    }

    const landmarks = detections.landmarks;

    // Calculate symmetry (distance between eyes, nose alignment, etc.)
    const leftEye = landmarks.getLeftEye();
    const rightEye = landmarks.getRightEye();
    const nose = landmarks.getNose();
    const jaw = landmarks.getJawOutline();

    const eyeDistance = Math.abs(leftEye[0].x - rightEye[0].x);
    const noseSymmetry = Math.abs(nose[0].x - (leftEye[3].x + rightEye[0].x) / 2);
    const jawShape = Math.abs(jaw[0].y - jaw[16].y);

    // Score based on feature ratios
    let score = 10 - (noseSymmetry * 5 + jawShape * 2) / eyeDistance;

    // Ensure the score is between 1 and 10
    score = Math.max(1, Math.min(10, score));

    document.getElementById("ratingOutput").innerText = `Your face structure rating: ${score.toFixed(1)}/10`;
});
