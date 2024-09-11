let model;

async function loadModel() {
    model = await tf.loadLayersModel('model/model.json');
    console.log('Model loaded successfully');
}

function preprocessImage(imageElement) {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    
    canvas.width = 128;
    canvas.height = 128;
    ctx.drawImage(imageElement, 0, 0, 128, 128);

    let imageData = ctx.getImageData(0, 0, 128, 128);
    let tensor = tf.browser.fromPixels(imageData, 1);
    
    tensor = tensor.expandDims(0);  // Add a batch dimension
    tensor = tensor.div(255.0);     // Normalize to [0, 1]
    return tensor;
}

async function predict() {
    const imageUpload = document.getElementById('imageUpload');
    if (imageUpload.files.length === 0) {
        alert("Please upload an MRI image.");
        return;
    }

    let imageElement = new Image();
    imageElement.src = URL.createObjectURL(imageUpload.files[0]);
    
    imageElement.onload = async () => {
        let processedImage = preprocessImage(imageElement);
        let predictions = await model.predict(processedImage);
        let predictedClass = predictions.argMax(-1).dataSync()[0];

        let labels = ["Mild Demented", "Moderate Demented", "Non-Demented", "Very Mild Demented"];
        document.getElementById('result').innerText = `Prediction: ${labels[predictedClass]}`;
    };
}

window.onload = async () => {
    await loadModel();
};
