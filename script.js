const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

const gravity = 0.5;
let gameSpeed = 5;
let score = 0;
let gameOver = false;

// Player object
const player = {
    x: 50,
    y: 300,
    width: 50,
    height: 50,
    dy: 0,
    jumping: false,
    draw() {
        ctx.fillStyle = "blue";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    jump() {
        if (!this.jumping) {
            this.dy = -10;
            this.jumping = true;
        }
    },
    update() {
        this.y += this.dy;
        if (this.y < 200) {
            this.dy += gravity;
        } else {
            this.dy = 0;
            this.jumping = false;
            this.y = 300;
        }
    }
};

// Police object
const police = {
    x: -100,
    y: 300,
    width: 50,
    height: 50,
    draw() {
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    },
    update() {
        this.x += 1;
        if (this.x > player.x - 20) {
            gameOver = true;
        }
    }
};

// Coins array
const coins = [];
setInterval(() => {
    const coin = {
        x: canvas.width,
        y: 250,
        width: 20,
        height: 20,
        draw() {
            ctx.fillStyle = "gold";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            this.x -= gameSpeed;
        }
    };
    coins.push(coin);
}, 2000);

// Obstacles array
const obstacles = [];
setInterval(() => {
    const obstacle = {
        x: canvas.width,
        y: 320,
        width: 30,
        height: 30,
        draw() {
            ctx.fillStyle = "black";
            ctx.fillRect(this.x, this.y, this.width, this.height);
        },
        update() {
            this.x -= gameSpeed;
        }
    };
    obstacles.push(obstacle);
}, 1500);

// Game loop
function updateGame() {
    if (gameOver) {
        alert(`Game Over! Score: ${score}`);
        document.location.reload();
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    player.update();
    player.draw();

    police.update();
    police.draw();

    coins.forEach((coin, index) => {
        coin.update();
        coin.draw();
        if (player.x < coin.x + coin.width && player.x + player.width > coin.x && player.y < coin.y + coin.height && player.y + player.height > coin.y) {
            score += 10;
            coins.splice(index, 1);
        }
    });

    obstacles.forEach((obstacle, index) => {
        obstacle.update();
        obstacle.draw();
        if (player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x && player.y < obstacle.y + obstacle.height && player.y + player.height > obstacle.y) {
            gameOver = true;
        }
    });

    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 20, 30);

    requestAnimationFrame(updateGame);
}

// Handle key press
document.addEventListener("keydown", (e) => {
    if (e.key === " " || e.key === "ArrowUp") {
        player.jump();
    }
});

updateGame();
