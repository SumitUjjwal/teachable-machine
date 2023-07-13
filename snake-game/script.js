var blockSize = 25;
var total_row = 17;
var total_col = 17;
var board;
var context;

var snakeX = blockSize * 5;
var snakeY = blockSize * 5;

// Set the total number of rows and columns
var speedX = 0;
var speedY = 0;

var snakeBody = [];

var foodX;
var foodY;

var gameOver = false;

window.onload = function () {
    // Set board height and width
    board = document.getElementById("board");
    board.height = total_row * blockSize;
    board.width = total_col * blockSize;
    context = board.getContext("2d");

    placeFood();
    // Set snake speed
    setInterval(update, 500);
}

function update() {
    if (gameOver) {
        return;
    }

    // Background of the Game
    context.fillStyle = "#1a5591";
    context.fillRect(0, 0, board.width, board.height);

    // Set food color and position
    context.fillStyle = "white";
    context.fillRect(foodX, foodY, blockSize, blockSize);

    if (snakeX == foodX && snakeY == foodY) {
        snakeBody.push([foodX, foodY]);
        placeFood();
    }

    // body of snake will grow
    for (let i = snakeBody.length - 1; i > 0; i--) {
        snakeBody[i] = snakeBody[i - 1];
    }
    if (snakeBody.length) {
        snakeBody[0] = [snakeX, snakeY];
    }

    context.fillStyle = "yellow";
    snakeX += speedX * blockSize; //updating Snake position in X coordinate.
    snakeY += speedY * blockSize; //updating Snake position in Y coordinate.
    context.fillRect(snakeX, snakeY, blockSize, blockSize);
    for (let i = 0; i < snakeBody.length; i++) {
        context.fillRect(snakeBody[i][0], snakeBody[i][1], blockSize, blockSize);
    }

    if (snakeX < 0
        || snakeX > total_col * blockSize
        || snakeY < 0
        || snakeY > total_row * blockSize) {

        // Out of bound condition
        gameOver = true;
        alert("Game Over");
        window.location.reload();
    }

    for (let i = 0; i < snakeBody.length; i++) {
        if (snakeX == snakeBody[i][0] && snakeY == snakeBody[i][1]) {

            // Snake eats own body
            gameOver = true;
            alert("Game Over");
            window.location.reload();
        }
    }
}

// Movement of the snake 
async function changeDirection(move) {
    if (move == 'Up' && speedY != 1) {
        speedX = 0;
        speedY = -1;
    }
    else if (move == 'Down' && speedY != -1) {
        speedX = 0;
        speedY = 1;
    }
    else if (move == 'Left' && speedX != 1) {
        speedX = -1;
        speedY = 0;
    }
    else if (move == 'Right' && speedX != -1) {
        speedX = 1;
        speedY = 0;
    }
}

// Randomly place food
function placeFood() {

    // in x coordinates.
    foodX = Math.floor(Math.random() * total_col) * blockSize;

    //in y coordinates.
    foodY = Math.floor(Math.random() * total_row) * blockSize;
}

// Voice Model---------------------------------------------------------------------------------
// more documentation available at
// https://github.com/tensorflow/tfjs-models/tree/master/speech-commands

// the link to your model provided by Teachable Machine export panel
const URL = "https://teachablemachine.withgoogle.com/models/BQ6fxnxMj/";

async function createModel() {
    const checkpointURL = URL + "model.json"; // model topology
    const metadataURL = URL + "metadata.json"; // model metadata

    const recognizer = speechCommands.create(
        "BROWSER_FFT", // fourier transform type, not useful to change
        undefined, // speech commands vocabulary feature, not useful for your models
        checkpointURL,
        metadataURL);

    // check that model and metadata are loaded via HTTPS requests.
    await recognizer.ensureModelLoaded();

    return recognizer;
}

async function init() {
    document.getElementById("startBtn").innerText = "Loading...";
    const recognizer = await createModel();
    const classLabels = recognizer.wordLabels(); // get class labels
    const labelContainer = document.getElementById("label-container");
    for (let i = 0; i < classLabels.length; i++) {
        labelContainer.appendChild(document.createElement("div"));
    }

    document.getElementById("startBtn").innerText = "Listening...";

    recognizer.listen(result => {
        let move = '', score = 0.8;
        for (let i = 0; i < classLabels.length; i++) {
            if (result.scores[i].toFixed(2) >= score) {
                score = result.scores[i].toFixed(2);
                move = classLabels[i];
            }
        }

        changeDirection(move);
    }, {
        includeSpectrogram: true, // in case listen should return result.spectrogram
        probabilityThreshold: 0.75,
        invokeCallbackOnNoiseAndUnknown: true,
        overlapFactor: 0.50 // probably want between 0.5 and 0.75. More info in README
    });

    document.getElementById("stopBtn").addEventListener("click", () => {
            window.location.reload();
        }
    )
}


// Image Model---------------------------------------------------------------------------------
// // More API functions here:
// // https://github.com/googlecreativelab/teachablemachine-community/tree/master/libraries/image

// // the link to your model provided by Teachable Machine export panel
// const URL = "https://teachablemachine.withgoogle.com/models/yVaTTf-g8/";

// let model, webcam, labelContainer, maxPredictions;

// // Load the image model and setup the webcam
// async function init() {
//     const modelURL = URL + "model.json";
//     const metadataURL = URL + "metadata.json";

//     // load the model and metadata
//     // Refer to tmImage.loadFromFiles() in the API to support files from a file picker
//     // or files from your local hard drive
//     // Note: the pose library adds "tmImage" object to your window (window.tmImage)
//     model = await tmImage.load(modelURL, metadataURL);
//     maxPredictions = model.getTotalClasses();

//     // Convenience function to setup a webcam
//     const flip = true; // whether to flip the webcam
//     webcam = new tmImage.Webcam(200, 200, flip); // width, height, flip
//     await webcam.setup(); // request access to the webcam
//     await webcam.play();
//     window.requestAnimationFrame(loop);

//     // append elements to the DOM
//     document.getElementById("webcam-container").appendChild(webcam.canvas);
//     labelContainer = document.getElementById("label-container");
//     for (let i = 0; i < maxPredictions; i++) { // and class labels
//         labelContainer.appendChild(document.createElement("div"));
//     }
// }

// async function loop() {
//     webcam.update(); // update the webcam frame
//     const move = await predict();
//     changeDirection(move);
//     window.requestAnimationFrame(loop);
// }

// // run the webcam image through the image model
// async function predict() {
//     // predict can take in an image, video or canvas html element
//     let move = '', score = 0.8;
//     const prediction = await model.predict(webcam.canvas);
//     for (let i = 0; i < maxPredictions; i++) {
//         // const classPrediction =
//         //     prediction[i].className + ": " + prediction[i].probability.toFixed(2);
//         // labelContainer.childNodes[i].innerHTML = classPrediction;

//         // const classPrediction = [prediction[i].className, prediction[i].probability.toFixed(2)];
//         // console.log(classPrediction);
//         // return classPrediction;

//         if(prediction[i].probability.toFixed(2) > score){
//             score = prediction[i].probability.toFixed(2);
//             move = prediction[i].className;
//         }
//     }
//     return move;
//     // console.log(move);
//     // await changeDirection(move);
// }