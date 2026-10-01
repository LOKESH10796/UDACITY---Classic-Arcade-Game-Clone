/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine makes the canvas' context (ctx) object globally available to make 
 * writing app.js a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 505;
    canvas.height = 606;
    doc.body.appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        update(dt);
        render();

        /* Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        /* Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);
    }

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
        reset();
        lastTime = Date.now();
        main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
        if (typeof nukeEffectTimer !== 'undefined' && nukeEffectTimer > 0) {
            nukeEffectTimer -= dt;
            if (nukeEffectTimer <= 0) {
                nukeActive = false;
            }
        }
        if (typeof flashTimer !== 'undefined' && flashTimer > 0) {
            flashTimer -= dt;
        }
    }

    function updateEntities(dt) {
        allEnemies.forEach(function(enemy) {
            enemy.update(dt);
        });
        player.update(dt);
    }

    function render() {
        // Level-specific environments
        var levelMaps = [
            ['images/water-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/grass-block.png', 'images/grass-block.png'],
            ['images/water-block.png', 'images/grass-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/grass-block.png'],
            ['images/water-block.png', 'images/stone-block.png', 'images/grass-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/grass-block.png'],
            ['images/water-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/grass-block.png', 'images/stone-block.png', 'images/stone-block.png'],
            ['images/water-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png', 'images/stone-block.png'],
        ];

        var rowImages = levelMaps[typeof currentLevel !== 'undefined' ? Math.min(currentLevel - 1, 4) : 0],
            numRows = 6,
            numCols = 5,
            row, col;
        
        ctx.clearRect(0,0,canvas.width,canvas.height);

        for (row = 0; row < numRows; row++) {
            for (col = 0; col < numCols; col++) {
                ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
            }
        }

        renderEntities();

        // Draw UI Overlay
        ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
        ctx.fillRect(0, 0, canvas.width, 50);
        ctx.fillStyle = "white";
        ctx.font = "20px Impact";
        ctx.textAlign = "left";
        ctx.fillText("SCORE: " + (typeof score !== 'undefined' ? score : 0), 10, 35);
        ctx.textAlign = "center";
        ctx.fillText("LEVEL: " + (typeof currentLevel !== 'undefined' ? currentLevel : 1), canvas.width / 2, 35);
        ctx.textAlign = "right";
        ctx.fillStyle = (typeof nukes !== 'undefined' && nukes > 0) ? "#ff4444" : "#888";
        ctx.fillText("NUKES (SPACE): " + (typeof nukes !== 'undefined' ? nukes : 0), canvas.width - 10, 35);

        // Flash Red on Hit
        if (typeof flashTimer !== 'undefined' && flashTimer > 0) {
            ctx.fillStyle = "rgba(255, 0, 0, " + (flashTimer) + ")";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Nuke Effect
        if (typeof nukeEffectTimer !== 'undefined' && nukeEffectTimer > 0) {
            ctx.fillStyle = "rgba(255, 200, 0, " + (nukeEffectTimer / 1.5) + ")";
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = "white";
            ctx.font = "bold 60px Impact";
            ctx.textAlign = "center";
            ctx.fillText("TACTICAL NUKE!", canvas.width / 2, canvas.height / 2);
        }
    }

    /* This function is called by the render function and is called on each game
     * tick. Its purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /* Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        player.render();
    }

    /* This function does nothing but it could have been a good place to
     * handle game reset states - maybe a new game menu or a game over screen
     * those sorts of things. It's only called once by the init() method.
     */
    function reset() {
        // noop
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/stone-block.png',
        'images/water-block.png',
        'images/grass-block.png',
        'images/enemy-bug.png',
        'images/char-boy.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developers can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);
