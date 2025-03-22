const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Responsive canvas
function resizeCanvas() {
  canvas.width = window.innerWidth * 0.9; // 90% of the screen width
  canvas.height = window.innerHeight * 0.7; // 70% of the screen height
}

// Set default canvas size
canvas.width = 800; // Default width
canvas.height = 400; // Default height

resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Load assets
const playerImage = new Image();
playerImage.src = './assets/player.png'; // Path to player image
playerImage.alt = "Player character"; // Alt text for accessibility

const playerGif = new Image();
playerGif.src = './assets/player_running.gif'; // Ensure this path is correct

const obstacleImage = new Image();
obstacleImage.src = './assets/obstacle.png'; // Path to obstacle PNG
obstacleImage.alt = "Obstacle";

const coinImage = new Image();
coinImage.src = './assets/coin.png'; // Path to coin PNG
coinImage.alt = "Coin";

// Load sounds
const coinSound = new Audio('./assets/coin.mp3'); // Use .mp3 format for compatibility
const jumpSound = new Audio('./assets/jump.mp3');
const hitSound = new Audio('./assets/hit.mp3');

// Error handling for assets
playerImage.onerror = () => console.error('Failed to load player image');
coinSound.onerror = () => console.error('Failed to load coin sound');
jumpSound.onerror = () => console.error('Failed to load jump sound');
hitSound.onerror = () => console.error('Failed to load hit sound');

playerGif.onerror = () => console.error('Failed to load player GIF');
obstacleImage.onerror = () => console.error('Failed to load obstacle image');
coinImage.onerror = () => console.error('Failed to load coin image');

// Load player animation frames with error handling
const playerFrames = [
  './assets/player_frame1.png',
  './assets/player_frame2.png',
  './assets/player_frame3.png',
  './assets/player_frame4.png',
].map((src, index) => {
  const img = new Image();
  img.src = src;

  // Handle broken images
  img.onerror = () => {
    console.error(`Failed to load player frame: ${src}`);
    img.src = './assets/placeholder.png'; // Use a placeholder image if the frame fails to load
  };

  return img;
});

// Game variables
let gameSpeed = 5;
let score = 0;
let gameOver = false;
let obstacleCooldown = 0; // Cooldown timer for obstacles

// Player class
class Player {
  constructor() {
    this.x = 50;
    this.y = canvas.height - 120; // Adjusted to match new height
    this.width = 60; // Increased width for better visibility
    this.height = 80; // Increased height for better visibility
    this.dy = 0;
    this.gravity = 0.5;
    this.jumpStrength = -12; // Adjusted jump strength for new size
    this.grounded = true;

    // Animation properties
    this.frameIndex = 0; // Current frame index
    this.frameTimer = 0; // Timer to control frame rate
    this.frameInterval = 10; // Number of game loop iterations per frame
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

    // Update animation frame
    this.frameTimer++;
    if (this.frameTimer >= this.frameInterval) {
      this.frameIndex = (this.frameIndex + 1) % playerFrames.length; // Loop through frames
      this.frameTimer = 0;
    }
  }

  jump() {
    if (this.grounded) {
      this.dy = this.jumpStrength;
      this.grounded = false;
      playSound(jumpSound);
    }
  }

  draw() {
    // Draw the current frame
    ctx.drawImage(
      playerFrames[this.frameIndex], // Current frame image
      this.x,
      this.y,
      this.width,
      this.height
    );
  }
}

// Obstacle class
class Obstacle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  update() {
    this.x -= gameSpeed;
  }

  draw() {
    ctx.drawImage(obstacleImage, this.x, this.y, this.width, this.height);
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
      ctx.drawImage(coinImage, this.x - this.radius, this.y - this.radius, this.radius * 2, this.radius * 2);
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

// Play sound safely
function playSound(sound) {
  if (sound.readyState >= 2) {
    const playPromise = sound.play();
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn('Audio playback failed:', error);
      });
    }
  }
}

// Game objects
const player = new Player();
const obstacles = [];
const coins = [];

// Update spawnObjects function to adjust obstacle sizes
function spawnObjects() {
  // Spawn obstacles with a cooldown
  if (obstacleCooldown <= 0 && Math.random() < 0.02) {
    const height = Math.random() * 50 + 50; // Adjust height range (50 to 100)
    const width = Math.random() * 30 + 40; // Adjust width range (40 to 70)
    obstacles.push(new Obstacle(canvas.width, canvas.height - height, width, height));
    obstacleCooldown = 60; // Cooldown for better spacing
  }

  // Decrease cooldown timer
  if (obstacleCooldown > 0) {
    obstacleCooldown--;
  }

  // Spawn coins
  if (Math.random() < 0.01) {
    const radius = 15; // Adjust coin size
    const yPosition = Math.random() * (canvas.height - 100 - radius) + (canvas.height - 100); // Ensure coins spawn within jumpable range
    coins.push(new Coin(canvas.width, yPosition, radius));
  }
}

// Game loop
function gameLoop() {
  if (gameOver) {
    displayGameOver();
    return;
  }

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
      playSound(hitSound);
      gameOver = true;
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
      playSound(coinSound);
    }

    // Remove off-screen coins
    if (coin.x + coin.radius < 0 || coin.collected) {
      coins.splice(index, 1);
    }
  });

  // Spawn new objects
  spawnObjects();

  // Display score
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(5, 5, 120, 30); // Background for the score
  ctx.fillStyle = 'white';
  ctx.font = '20px Arial';
  ctx.fillText(`Score: ${score}`, 10, 25);

  // Increase game speed as score increases
  if (score % 50 === 0 && score > 0) {
    gameSpeed += 0.1;
  }

  requestAnimationFrame(gameLoop);
}

// Display game over message
function displayGameOver() {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2 - 20);
  ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 20);
  ctx.fillText('Press R to Restart', canvas.width / 2, canvas.height / 2 + 60);
}

// Restart the game
function restartGame() {
  score = 0;
  gameOver = false;
  obstacles.length = 0;
  coins.length = 0;
  player.y = canvas.height - player.height; // Reset player position
  player.dy = 0; // Reset player velocity
  gameSpeed = 5; // Reset game speed
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
  gameLoop();
}

// Event listeners for mobile and desktop
canvas.addEventListener('click', () => {
  if (gameOver) {
    restartGame();
  } else {
    player.jump();
  }
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault(); // Prevent default touch behavior (e.g., scrolling)
  if (gameOver) {
    restartGame();
  } else {
    player.jump();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    player.jump();
  } else if (e.code === 'KeyR' && gameOver) {
    restartGame();
  }
});

// Start the game
gameLoop();
