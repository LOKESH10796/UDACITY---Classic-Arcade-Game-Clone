let currentLevel = 1;
let nukes = 1;
let score = 0;
let nukeActive = false;
let nukeEffectTimer = 0;
let flashTimer = 0;

const BUG_Y_POSITIONS = [60, 145, 230, 315];

class Enemy {
    constructor(x, y, speed) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.sprite = 'images/enemy-bug.png';
    }

    update(dt) {
        if (nukeActive) {
            // Nuke blows them away backwards quickly
            this.x -= this.speed * dt * 3;
            if (this.x < -200) {
                this.x = Math.random() * 500 + 600;
                this.y = BUG_Y_POSITIONS[Math.floor(Math.random() * BUG_Y_POSITIONS.length)];
            }
            return;
        }

        this.x += this.speed * dt;
        if (this.x > 550) {
            this.x = -150;
            this.speed = 100 + Math.random() * (currentLevel * 50);
            this.y = BUG_Y_POSITIONS[Math.floor(Math.random() * BUG_Y_POSITIONS.length)];
        }

        // Collision detection
        if (
            this.x < player.x + 50 &&
            this.x + 50 > player.x &&
            this.y < player.y + 50 &&
            this.y + 50 > player.y
        ) {
            flashTimer = 1.0;
            player.reset();
            score = 0;
            currentLevel = 1;
            nukes = 1;
            generateEnemies();
        }
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
}

class Player {
    constructor() {
        this.reset();
        this.sprite = 'images/char-boy.png';
    }

    reset() {
        this.x = 202;
        this.y = 400;
    }

    update(dt) {
        if (this.y < 20) {
            score += currentLevel * 100;
            currentLevel++;
            if (currentLevel > 5) {
                alert("YOU BEAT ALL 5 LEVELS! YOU ARE AN ARCADE LEGEND! Restarting...");
                currentLevel = 1;
                score = 0;
                nukes = 1;
            } else {
                nukes++; 
            }
            this.reset();
            generateEnemies();
        }
    }

    render() {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }

    handleInput(key) {
        if (nukeActive) return; // Cant move during nuke

        switch (key) {
            case 'up': if (this.y > 0) this.y -= 83; break;
            case 'down': if (this.y < 400) this.y += 83; break;
            case 'left': if (this.x > 0) this.x -= 101; break;
            case 'right': if (this.x < 400) this.x += 101; break;
            case 'space': 
                if (nukes > 0 && !nukeActive) {
                    nukes--;
                    nukeActive = true;
                    nukeEffectTimer = 1.5;
                }
                break;
        }
    }
}

let allEnemies = [];
const player = new Player();

function generateEnemies() {
    allEnemies = [];
    const numEnemies = 2 + currentLevel * 2; // Level 1 has 4 enemies, Level 5 has 12
    for (let i = 0; i < numEnemies; i++) {
        let x = Math.random() * -800;
        let y = BUG_Y_POSITIONS[Math.floor(Math.random() * BUG_Y_POSITIONS.length)];
        let speed = 100 + Math.random() * (currentLevel * 80);
        allEnemies.push(new Enemy(x, y, speed));
    }
}

generateEnemies();

document.addEventListener('keydown', function(e) {
    let allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        32: 'space'
    };
    if(allowedKeys[e.keyCode]) {
        e.preventDefault();
        player.handleInput(allowedKeys[e.keyCode]);
    }
});