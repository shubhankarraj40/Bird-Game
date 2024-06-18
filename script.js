// board
let board; //represents the game board or canvas where the game elements will be displayed.
let boardWidth = 360; //his variable stores the width of the game board, set to 360 pixels.
let boardHeight = 640; //This variable stores the height of the game board, set to 640 pixels.
let context;

// bird
let birdWidth = 38; // width/height ratio = 17/12
let birdHeight = 28;

let birdX = boardWidth / 8; //This variable stores the initial horizontal position of the bird sprite, set to one-eighth of the board width (45 pixels).
let birdY = boardHeight / 2; //This variable stores the initial vertical position of the bird sprite, set to half the board height (320 pixels).
let birdImg; //It likely holds the image data for the bird sprite.

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
};

// pipes
let pipeArray = [];
let pipeWidth = 64; // width/height ratio = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;

// physics
let velocityX = -4; // pipes moving left speed
let velocityY = 0; // bird jump speed
let gravity = 0.4; //bird gravity and intial point from where the bird start moving 

let gameOver = false;
let score = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); // used for drawing on the board

    // load images
    birdImg = new Image();
    birdImg.src = "./bird.png";
    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    };

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); // every 1.5 seconds
    document.addEventListener("keydown", moveBird);
};

//In summary, this update function is responsible for handling the game logic related to the bird's movement and the gravity effect.
//It also clears the canvas and checks for game-over conditions. This function is called repeatedly in the game loop to create animation and update the game state.
function update() {
    requestAnimationFrame(update);
    // This line sets up the next call to the update function using the requestAnimationFrame method. This ensures that the update function is called in sync with the browser's repaint cycle.

    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // bird
    velocityY += gravity;
    //This line updates the bird's vertical velocity by adding the gravity value. This simulates the effect of gravity on the bird, causing it to accelerate downward over time.

    bird.y = Math.max(bird.y + velocityY, 0); // apply gravity to current bird.y, limit the bird.y to the top of the canvas
    //This line updates the bird's vertical position by adding the current velocity to its current position. The Math.max function is used to ensure that the bird's position doesn't go below the top of the canvas (0 pixels).

    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    //This line draws the bird on the canvas at its updated position.
    //clears the entire game canvas before redrawing the game elements. This ensures a clean slate for each frame


    if (bird.y > board.height) {
        gameOver = true;
    }

    // pipes
    for (let i = 0; i < pipeArray.length; i++) 
    //This is a standard for loop that iterates over each element in the pipeArray array.
    {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width)
         //This condition checks if the bird has passed the current pipe. The !pipe.passed ensures that this check only happens once for each pipe. If the bird's horizontal position is greater than the sum of the pipe's position and width, it means the bird has passed the pipe
        {
            score += 0.5; // 0.5 because there are 2 pipes, so 0.5 * 2 = 1 for each set of pipes
            pipe.passed = true;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth)
    {
        //This while loop is removing pipes from the pipeArray that have moved entirely off the canvas (to the left, beyond a certain threshold represented by -pipeWidth).
        //The condition pipeArray[0].x < -pipeWidth checks if the x-coordinate of the first pipe in the array is less than the negative of the pipe width. 
        //If true, it means the pipe is completely off the canvas, and it is removed from the array using pipeArray.shift().
        pipeArray.shift(); // removes the first element from the array
    }

    // score
    context.fillStyle = "black"; // Set the color to black
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 90);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    };
    pipeArray.push(bottomPipe);
}

function moveBird(e) {
    if (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") {
        // jump
        velocityY = -6;

        // reset game
        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            score = 0;
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && // a's top-left corner doesn't reach b's top-right corner
        a.x + a.width > b.x && // a's top-right corner passes b's top-left corner
        a.y < b.y + b.height && // a's top-left corner doesn't reach b's bottom-left corner
        a.y + a.height > b.y; // a's bottom-left corner passes b's top-left corner
}
