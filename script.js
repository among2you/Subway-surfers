const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 400;

// Game variables
let gameSpeed = 5;
let score = 0;

// Player class
class Player {
  constructor() {
    this.x = 50;
    this.y = canvas.height - 100;
    this.width = 50;
    this.height = 50;
    this.color = 'blue';
    this.dy = 0;
    this.gravity = 0.5;
    this.jumpStrength = -10;
    this.grounded = true;
  }

  update() {
    // Apply gravity
    if (!this.grounded) {
      this.dy += this.gravity;
    } else {
      this.dy = 0;
    }

    this.y += this.dy;

    // Prevent falling below the ground
    if (this.y + this.height >= canvas.height) {
      this.y = canvas.height - this.height;
      this.grounded = true;
    }
  }

  jump() {
    if (this.grounded) {
      this.dy = this.jumpStrength;
      this.grounded = false;
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// Obstacle class
class Obstacle {
  constructor(x, y, width, height, color) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  update() {
    this.x -= gameSpeed;
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

// Coin class
class Coin {
  constructor(x, y, radius) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.collected = false;
  }

  update() {
    this.x -= gameSpeed;
  }

  draw() {
    if (!this.collected) {
      ctx.fillStyle = 'gold';
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Collision detection
function isColliding(rect1, rect2) {
  return (
    rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y
  );
}

function isCollidingWithCircle(rect, circle) {
  const distX = Math.abs(circle.x - rect.x - rect.width / 2);
  const distY = Math.abs(circle.y - rect.y - rect.height / 2);

  if (distX > rect.width / 2 + circle.radius || distY > rect.height / 2 + circle.radius) {
    return false;
  }

  if (distX <= rect.width / 2 || distY <= rect.height / 2) {
    return true;
  }

  const dx = distX - rect.width / 2;
  const dy = distY - rect.height / 2;
  return dx * dx + dy * dy <= circle.radius * circle.radius;
}

// Game objects
const player = new Player();
const obstacles = [];
const coins = [];

// Spawn obstacles and coins
function spawnObjects() {
  if (Math.random() < 0.02) {
    const height = Math.random() * 50 + 20;
    obstacles.push(new Obstacle(canvas.width, canvas.height - height, 20, height, 'red'));
  }

  if (Math.random() < 0.01) {
    const radius = 10;
    coins.push(new Coin(canvas.width, Math.random() * (canvas.height - radius * 2) + radius, radius));
  }
}

// Game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Update player
  player.update();
  player.draw();

  // Update obstacles
  obstacles.forEach((obstacle, index) => {
    obstacle.update();
    obstacle.draw();

    // Check collision with player
    if (isColliding(player, obstacle)) {
      alert(`Game Over! Your score: ${score}`);
      document.location.reload();
    }

    // Remove off-screen obstacles
    if (obstacle.x + obstacle.width < 0) {
      obstacles.splice(index, 1);
    }
  });

  // Update coins
  coins.forEach((coin, index) => {
    coin.update();
    coin.draw();

    // Check collision with player
    if (isCollidingWithCircle(player, coin)) {
      coin.collected = true;
      score += 10;
    }

    // Remove off-screen coins
    if (coin.x + coin.radius < 0) {
      coins.splice(index, 1);
    }
  });

  // Spawn new objects
  spawnObjects();

  // Display score
  ctx.fillStyle = 'black';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 30);

  requestAnimationFrame(gameLoop);
}

// Event listeners
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    player.jump();
  }
});

// Start the game
gameLoop();
