let overLayCanvas,
    imagesDescriptors,
    faceMatcher;
async function run() {
    await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('http://localhost:3000/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('http://localhost:3000/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('http://localhost:3000/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('http://localhost:3000/models'),
        faceapi.nets.ssdMobilenetv1.loadFromUri('http://localhost:3000/models')
    ]);
    try {
        imagesDescriptors = await loadImagesDescriptors();
        faceMatcher = new faceapi.FaceMatcher(imagesDescriptors, 0.6);
    } catch (e) {
    }
    document.getElementsByClassName('divloader')[0].remove();
    const video = document.getElementById('video');
    const button = document.getElementById('button');
    video.srcObject = await navigator.mediaDevices.getUserMedia({ video: true });
    setInterval(() => {
        captureScreenshot();
    }, 100);
}

async function initCapturing() {
    const video = document.getElementById('video');
    overLayCanvas = faceapi.createCanvasFromMedia(video);
    document.body.append(overLayCanvas);
    const dispalySize = { width: video.width, height: video.height }
    faceapi.matchDimensions(overLayCanvas, dispalySize);
    var tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
        scoreThreshold: 0.3
    });
    setInterval(async () => {
        const detections = await faceapi.detectAllFaces(video, tinyFaceDetectorOptions).withFaceLandmarks().withFaceDescriptors();
        const resizeddetections = faceapi.resizeResults(detections, dispalySize);
        overLayCanvas.getContext('2d').clearRect(0, 0, overLayCanvas.width, overLayCanvas.height);
        let results = resizeddetections;
        if (faceMatcher) {
            results = resizeddetections.map(detection => {
                return faceMatcher.findBestMatch(detection.descriptor);
            });
        }
        results.forEach((result, i) => {
            debugger
            const box = resizeddetections[i].detection.box;
            const drawBox = new faceapi.draw.DrawBox(box, {
                label: faceMatcher? result.toString() : 'Unknown'
            });
            drawBox.draw(overLayCanvas);
        });
    }, 0);
}


function captureScreenshot() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('image-canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    overLayCanvas && context.drawImage(overLayCanvas, 0, 0, video.videoWidth, video.videoHeight);
    saveVideo(canvas.toDataURL('image/jpeg'));
}

async function loadImagesDescriptors() {
    var tinyFaceDetectorOptions = new faceapi.TinyFaceDetectorOptions({
        scoreThreshold: 0.3
    });
    const labels = ['mano', 'nithya', 'akila'];
    return Promise.all(labels.map(async label => {
        let detections = [];
        try {
            for (let index = 1; index <= 2; index++) {
                let image = await faceapi.fetchImage(`http://localhost:3000/images/${label}/${index}.jpg`);
                const detection = await faceapi.detectSingleFace(image, tinyFaceDetectorOptions)
                    .withFaceLandmarks().withFaceDescriptor();
                detections.push(detection.descriptor);
            }
            return new faceapi.LabeledFaceDescriptors(label, detections);
        } catch (e) {
        }
    }));
}
