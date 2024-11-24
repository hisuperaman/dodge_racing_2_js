const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const scoreBoardCanvas = document.getElementById('scoreBoard');
const scoreBoardCtx = scoreBoardCanvas.getContext('2d');

let CANVAS_WIDTH = canvas.width = canvas.scrollWidth;
let CANVAS_HEIGHT = canvas.height = canvas.scrollHeight;

let SCORE_BOARD_CANVAS_WIDTH = scoreBoardCanvas.width = scoreBoardCanvas.scrollWidth;
let SCORE_BOARD_CANVAS_HEIGHT = scoreBoardCanvas.height = scoreBoardCanvas.scrollHeight;

const crashSFX = new Audio("sfx/sfx_crash.mp3");
const bgm = new Audio("sfx/bgm.mp3");
const scoreSFX = new Audio("sfx/sfx_score.mp3");

scoreSFX.volume = 0.5;

let spawnInterval = 800;
let elapsedTime = 0;
let lastPaintTime = 0;


function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;

    const width = canvas.scrollWidth;
    const height = canvas.scrollHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    CANVAS_WIDTH = width;
    CANVAS_HEIGHT = height;

    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';


    scoreBoardCanvas.width = canvas.width;
    SCORE_BOARD_CANVAS_WIDTH = width;
    scoreBoardCanvas.style.width = canvas.style.width;
    const scoreBoardHeight = 0.05;
    scoreBoardCanvas.height = canvas.height * scoreBoardHeight;
    SCORE_BOARD_CANVAS_HEIGHT = height * scoreBoardHeight;
    scoreBoardCanvas.style.height = SCORE_BOARD_CANVAS_HEIGHT + 'px';
    scoreBoardCanvas.style.left = canvas.getBoundingClientRect().left + 'px';



    // ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr)
    scoreBoardCtx.scale(dpr, dpr)
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();


document.addEventListener('DOMContentLoaded', e=> {
    let road = new Road(6, CANVAS_WIDTH, CANVAS_HEIGHT);
    let car = new Car(road.getLaneCenter(2), CANVAS_HEIGHT/2, CANVAS_WIDTH);
    
    
    let gameScore = 0;
    let gameHighscore = 0;
    let gameOver = false;
    
    const savedHighscore = localStorage.getItem("hisuperaman-dodge_racing");
    if(savedHighscore && !isNaN(savedHighscore)) {
        gameHighscore = savedHighscore;
    }
    
    let traffic = [
        new Car(road.getLaneCenter(getRandomInteger(0, road.laneCount-1)), CANVAS_HEIGHT/2-300, CANVAS_WIDTH, "DUMMY", maxSpeed=2),
    ]
    // console.log(traffic)
    
    function spawnTraffic() {
        const trafficCarX = road.getLaneCenter(getRandomInteger(0, road.laneCount));
        const trafficCarY = road.top-(getRandomInteger(10, 100));
    
        const trafficCarYAlreadyPresent = traffic.some(c => {
            const isXClose = c.x === trafficCarX;
            const isYOverlap = (trafficCarY + c.height*2 >= c.y) && (trafficCarY <= c.y + c.height*2)
            return isXClose && isYOverlap;
        })
        if(!trafficCarYAlreadyPresent) {
            traffic.push(
                new Car(trafficCarX, trafficCarY, CANVAS_WIDTH, "DUMMY", maxSpeed=2),
            )
        }
        
        // console.log(traffic)
    
        for(let i=0; i<traffic.length; i++){
            const c = traffic[i];
    
            if(!c.passed && car.y < c.y) {
                scoreSFX.play();
                gameScore += 1;
                car.speedUpdated = false;
                c.passed = true;
            }
    
            if (c.y > car.y+CANVAS_HEIGHT) {
                traffic.splice(i, 1);
            }
        }
    }
    
    function drawScore() {
        const text = gameScore
        scoreBoardCtx.fillStyle = "white"
        scoreBoardCtx.font = "22px serif";
        scoreBoardCtx.fillText(`${text}`, SCORE_BOARD_CANVAS_WIDTH-90, 25);
    }
    
    function drawHighscore() {
        const text = `🏆 ${gameHighscore}`
        scoreBoardCtx.fillStyle = "white"
        scoreBoardCtx.font = "22px serif";
        scoreBoardCtx.fillText(`${text}`, 20, 25);
    }
    
    function adjustSpawnInterval() {
        spawnInterval = Math.max(300, 1000-(car.maxSpeed * 100))
    }
    
    function handleGameover() {
        if(!gameOver) {
            crashSFX.play();
            gameOver = true;
        }
    }

    function drawGameOver(){
        ctx.save();
        ctx.font = "24px serif";
        ctx.textAlign = "center";
        ctx.fillStyle = 'white';
        ctx.fillText(`Game Over`, CANVAS_WIDTH/2, CANVAS_HEIGHT/2);
        ctx.fillStyle = 'black';
        ctx.fillText(`Game Over`, CANVAS_WIDTH/2+1, CANVAS_HEIGHT/2+2);
        ctx.restore();
    }


    document.addEventListener('click', (e)=>{
        const mouseX = e.clientX;
        const mouseY = e.clientY;
    
        const canvasRect = canvas.getBoundingClientRect();
        const {x: canvasX, y: canvasY} = canvasRect;
    
        const x = mouseX - canvasX;
        const y = mouseY - canvasY;
    
        if(restartButton && restartButton.isClicked(x, y)){
            restartButton = null;
            restartGame();
        }

    })


    document.addEventListener('click', function() {
        if(!gameOver) {
            bgm.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    });

    document.addEventListener('keydown', function(event) {
        if(!gameOver) {
            bgm.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    });

    document.addEventListener('touchstart', function() {
        if(!gameOver) {
            bgm.play().catch(error => {
                console.error('Error playing audio:', error);
            });
        }
    });


    let restartButton = null;
    
    function restartGame(){
        gameScore = 0;

        road = new Road(6, CANVAS_WIDTH, CANVAS_HEIGHT);
        car = new Car(road.getLaneCenter(2), CANVAS_HEIGHT/2, CANVAS_WIDTH);
        traffic = [
            new Car(road.getLaneCenter(getRandomInteger(0, road.laneCount-1)), CANVAS_HEIGHT/2-300, CANVAS_WIDTH, "DUMMY", maxSpeed=2),
        ]

        spawnInterval = 800;
        
        elapsedTime = 0;
        lastPaintTime = 0;
        
        gameOver = false;
            
        bgm.play();
        animate(0);
    }
    
    function animate(timestamp) {
        ctx.fillStyle = "#bababa";
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        
        scoreBoardCtx.fillStyle = "#232436"
        scoreBoardCtx.fillRect(0, 0, SCORE_BOARD_CANVAS_WIDTH, SCORE_BOARD_CANVAS_HEIGHT);
    
        const deltaTime = Math.abs(lastPaintTime - timestamp);
        elapsedTime += deltaTime;
    
        if(!gameOver && elapsedTime > spawnInterval) {
            // game
            spawnTraffic();
    
            elapsedTime = 0;
        }
        adjustSpawnInterval();
        if(gameScore > gameHighscore) {
            gameHighscore = gameScore;
            localStorage.setItem('hisuperaman-dodge_racing', gameScore);
        }
    
        road.update(car.y)
        car.update(road.borders, traffic, gameScore, handleGameover);
        for(let i=0; i<traffic.length; i++) {
            traffic[i].update(road.borders, [car]);
        }
        
        ctx.save();
        
        drawScore();
        drawHighscore();
        
        ctx.translate(0, -car.y+CANVAS_HEIGHT*0.7)
        road.draw(ctx);
        for(let i=0; i<traffic.length; i++) {
            traffic[i].draw(ctx);
        }
        
        car.draw(ctx);
        

        ctx.restore();

        lastPaintTime = timestamp;

        if(gameOver) {
            bgm.pause();
            bgm.currentTime = 0;
            drawGameOver();
            restartButton = new Button(CANVAS_WIDTH/2-50, CANVAS_HEIGHT/2+20, 100, 50, 'Restart');
            restartButton.draw(ctx);
        }
        else{
            window.requestAnimationFrame(animate);

        }
    
        
    }
    
    
    window.onload = ()=>{
        document.getElementById('loadingScreen').style.display = 'none';
    
        animate(0);
    }
})