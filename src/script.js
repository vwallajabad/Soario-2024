let alzheimerModel, tumorModel;

async function loadAlzheimerModel() {
    alzheimerModel = await tf.loadLayersModel('Alzheimer_model/model.json');
    console.log('Alzheimer model loaded successfully');
}

async function loadTumorModel() {
    tumorModel = await tf.loadLayersModel('Tumor_model/model.json');
    console.log('Tumor model loaded successfully');
}

function preprocessImage(imageElement) {
    let canvas = document.getElementById('canvas');
    let ctx = canvas.getContext('2d');
    
    canvas.width = 128;
    canvas.height = 128;
    ctx.drawImage(imageElement, 0, 0, 128, 128);

    let imageData = ctx.getImageData(0, 0, 128, 128);
    let tensor = tf.browser.fromPixels(imageData, 1);
    
    tensor = tensor.expandDims(0);
    tensor = tensor.div(255.0);
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
        let alzheimerPredictions = await alzheimerModel.predict(processedImage);
        let alzheimerpredictedClass = alzheimerPredictions.argMax(-1).dataSync()[0];
        let alzheimerpredictionProbabilities = alzheimerPredictions.dataSync();
   
        let tumorpredictions = await tumorModel.predict(processedImage);
        let tumorpredictedClass = tumorpredictions.argMax(-1).dataSync()[0];
        let tumorpredictionProbabilities = tumorpredictions.dataSync();
     
        let alzheimerLabel = ["Mild Demented", "Moderate Demented", "Non-Demented", "Very Mild Demented"];
        let tumorLabel = ["Schwannoma T2", "Tuberculoma T1", "Schwannoma T1C+", "Schwannoma T1", "Papiloma T1C+", "Papiloma T1", "Oligodendroglioma T1", "Papiloma T2", "Oligodendroglioma T2", "Oligodendroglioma T1C+", "Neurocitoma T2", "Neurocitoma T1C+", "Granuloma T2", "Meningioma T2", "Neurocitoma T1", "Meduloblastoma T1C+", "Meningioma T1", "Meduloblastoma T2", "Meduloblastoma T1", "Meningioma T1C+", "Glioblastoma T2", "Granuloma T1C+", "Granuloma T1", "Glioblastoma T1C+", "Germinoma T2", "Germinoma T1C+", "Ganglioglioma T1", "Ganglioglioma T1C+", "Ependimoma T2", "Ganglioglioma T2", "Germinoma T1", "Glioblastoma T1", "Ependimoma T1C+", "Ependimoma T1", "Carcinoma T1C+", "Carcinoma T2", "Tuberculoma T1C+", "Astrocitoma T2", "Astrocitoma T1", "Tuberculoma T2", "_NORMAL T2", "Carcinoma T1", "_NORMAL T1", "Astrocitoma T1C+"];
        
        let alzheimerconfidence = (alzheimerpredictionProbabilities[alzheimerpredictedClass] * 100).toFixed(2);
        let tumorconfidence = (tumorpredictionProbabilities[tumorpredictedClass] * 100).toFixed(2);
        
        document.getElementById('result').innerText = `
            Prediction: ${alzheimerLabel[alzheimerpredictedClass]} (${alzheimerconfidence}%) 
            Prediction: ${tumorLabel[tumorpredictedClass]} (${tumorconfidence}%) 
        `;
    };
}

window.onload = async () => {
    await loadAlzheimerModel();
    await loadTumorModel();
};
