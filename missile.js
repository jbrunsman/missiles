/*
This game uses these sounds from freesound:
dropthabomb by ice9ine ( http://freesound.org/people/ice9ine/sounds/22503/ )
CinematicBoomNorm by HerbertBoland ( http://freesound.org/people/HerbertBoland/sounds/33637/ )
Boom_C_06 by cabled_mess ( http://freesound.org/people/cabled_mess/sounds/350977/ )
Spacey 1up by GameAudio ( http://freesound.org/people/GameAudio/sounds/220173/ )
Explode001 by mitchelk ( http://freesound.org/people/mitchelk/sounds/136765/ )
explosion flangered by destro_94 ( http://freesound.org/people/destro_94/sounds/84521/ )
*/

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// percentages originally pixels at 1000px canvas width
var fifty = canvas.width * 0.05,
    forty = canvas.width * 0.04,
    thirtyfive = canvas.width * 0.035,
    thirty = canvas.width * 0.03,
    twentyfive = canvas.width * 0.025,
    twenty = canvas.width * 0.02,
    fifteen = canvas.width * 0.015,
    ten = canvas.width * 0.01;

var missileArray = [],
    boomArray = [],
    cityArray = [],
    boomRadius = thirtyfive,
    centerX = canvas.width / 2,
    centerY = canvas.height / 2,
    earth = canvas.height - fifty,
    aimer = earth - thirtyfive;

var missiles = 20,
    score = 0,
    roundTimer = 20;

var clock = 0,
    clockNew = 0,
    roundCount = 5,
    missileTimer = 0;

var isPlaying = false;

function main() {

    if (isPlaying) {
        window.requestAnimationFrame(main);
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (clockNew >= clock +1000) {
        roundTimer--;
        
        if (missileTimer >= roundCount) {
            missileTimer = 0;
            launchMissile();
        }
        missileTimer++;
        
        clock = clockNew;
    }
    
    if (roundTimer <= 0) {
        missiles = 20;
        roundTimer = 20;
        score += 100;
        var restock = new Audio('sounds/restock.wav');
        restock.play();
        if (roundCount > 1) { roundCount--; }
    }

    drawMap();
    missileAdvance();
    boomAdvance();
    drawHud();
    clockNew = new Date().getTime();

    if (!isPlaying) {
        gameOver();
    }

}


function launchMissile() {



    function rollDice() {
        min = Math.ceil(0);
        max = Math.floor(canvas.width);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    if (Math.floor((Math.random() * 100) + 1) < 75) {
        var missile_unaimed = new Audio('sounds/missile_unaimed.wav');
        missile_unaimed.play();

        calcMissile(rollDice(), 0, rollDice(), earth);
        
    } else {
    
        var targets = [];
        for (i = 0; i < cityArray.length; i++) {
            if (cityArray[i].alive === true) {
                targets.push(cityArray[i].x);
            }
        }
        targets.push(centerX);
        var missile_aimed = new Audio('sounds/missile_aimed.wav');
        missile_aimed.play();

        var t = Math.floor(Math.random() * targets.length);
       
        calcMissile(rollDice(), 0, targets[t], earth)
    }
}




function calcMissile(xst, yst, xnd, ynd) {

    var segmod = 500 / canvas.width // slow down missiles on a tiny screen, 0.5 for 1000px screen standard
    //try to get the missiles to move a the same-ish speed regardless of angle
    var segs = Math.sqrt(Math.pow(xst - xnd, 2) + Math.pow(yst - ynd, 2)) * segmod;
    
    var missilePlot = {
        progress : 0, segments : segs,
        xstart : xst, ystart : yst,
        xend : xnd, yend : ynd,
        xnow : xst, ynow : yst,
    };
    
    missileArray.push(missilePlot);
}

    
function missileAdvance() {

    var xpos;
    var ypos;
    for (n = missileArray.length - 1; n >= 0; n--) {
        if (missileArray[n].progress >= missileArray.segments) {
            missileArray[n].xnow = missileArray[n].xend;
            missileArray[n].ynow = missileArray[n].yend;
        } else {
            var xratio = (missileArray[n].xend - missileArray[n].xstart) 
                / missileArray[n].segments;
            var yratio = (missileArray[n].yend - missileArray[n].ystart) 
                / missileArray[n].segments;
            
            missileArray[n].xnow = missileArray[n].xstart + xratio * missileArray[n].progress;
            missileArray[n].ynow = missileArray[n].ystart + yratio * missileArray[n].progress;
            
            ctx.beginPath();
            ctx.moveTo(missileArray[n].xstart, missileArray[n].ystart);
            ctx.lineTo(missileArray[n].xnow, missileArray[n].ynow);
            ctx.strokeStyle = "white";
            ctx.stroke();
        
            if (missileArray[n].progress >= missileArray[n].segments) {
                boomArray.push({
                    x : missileArray[n].xnow,
                    y : missileArray[n].ynow,
                    progress : 0,
                });
                missileArray.splice(n, 1);
            } else {
                missileArray[n].progress += 1;
            }
        }
    }
}


function boomAdvance() {

    for (n = boomArray.length - 1; n >= 0; n--) {
        ctx.beginPath();
        ctx.arc(boomArray[n].x, boomArray[n].y, boomArray[n].progress, 0,
            2 * Math.PI);
        ctx.fillStyle = "yellow";
        ctx.fill();

        if (boomArray[n].progress == 0) {
            var boom = new Audio('sounds/boom.wav');
            boom.play();
        }
        
        for (i = missileArray.length - 1; i >= 0; i--) {
            if (Math.pow(missileArray[i].xnow - boomArray[n].x, 2) + Math.pow(
                missileArray[i].ynow - boomArray[n].y, 2) <= Math.pow(
                boomArray[n].progress, 2)) {
                score += 10;
                boomArray.push({
                    x : missileArray[i].xnow,
                    y : missileArray[i].ynow,
                    progress : 0,
                });
                missileArray.splice(i, 1);
            }
        }
        
        for (i = 0; i < cityArray.length; i++) {
            if ((Math.pow(cityArray[i].x - boomArray[n].x, 2) +
                Math.pow(earth - fifteen - boomArray[n].y, 2))
                
                <= Math.pow(boomArray[n].progress, 2)
                
                && cityArray[i].alive === true ) {
                
                cityArray[i].alive = false;
                var boom_city = new Audio('sounds/boom_city.wav');
                boom_city.play();
                deathTest();
                boomArray.push({
                    x : cityArray[i].x,
                    y : earth,
                    progress : twenty,
                });
            }
        }
        
        if (Math.pow(centerX - boomArray[n].x, 2) + Math.pow(earth - fifteen -
            boomArray[n].y, 2) <= Math.pow(boomArray[n].progress, 2)) {
            if (missiles > 0) {
                var boom_base = new Audio('sounds/boom_base.wav');
                boom_base.play();
            }
            missiles = 0;
        }
                
        if (boomArray[n].progress >= boomRadius) {
            boomArray.splice(n, 1);
        } else {
            boomArray[n].progress += canvas.width / 1000; // scale the timing of the explosion to the canvas
        }
    }
}


function drawMap() {
    var earthPlus = earth + 1;

    // draw earth
    ctx.fillStyle = "green";
    ctx.fillRect(0, earth, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo(centerX - forty, earthPlus);
    ctx.quadraticCurveTo(centerX, (earthPlus) - (thirty * 2), centerX + forty, earthPlus);
    ctx.moveTo(centerX - forty, earthPlus);
    ctx.fillStyle = "green";
    ctx.fill();

    // draw cities
    for (i = 0; i < cityArray.length; i++) {
        if (cityArray[i].alive) {
            ctx.beginPath();
            ctx.fillStyle = "dimgray";
            ctx.fillRect(cityArray[i].x - twenty, earthPlus - fifteen, twenty, fifteen);
            ctx.fillStyle = "gray";
            ctx.fillRect(cityArray[i].x - ten, earthPlus - thirty, twenty, thirty);
            ctx.fillStyle = "silver";
            ctx.fillRect(cityArray[i].x, earthPlus - twenty, twenty, twenty);
        } else {
            ctx.beginPath();
            ctx.arc(cityArray[i].x, earth - twenty, boomRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "black";
            ctx.fill();
        }
    }
}


function drawHud() {

    // add the base last (looks better this way when shooting)
    ctx.beginPath();
    ctx.fillStyle = "gray";
    ctx.fillRect(centerX - ten, earth - thirtyfive, twenty, ten);
    ctx.beginPath();
    ctx.arc(centerX, aimer, ten, 0, 2 * Math.PI);
    ctx.fillStyle = "gray";
    ctx.fill();
    
    // add HUD last so it's on top

    var fontHUD = Math.round(twenty);
    var fh = fontHUD.toString() + "px Sans";

    ctx.font = fh;
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(
        missiles > 9 ? missiles : "0" + missiles,
        centerX, earth
    );
    
    ctx.fillText(
        roundTimer > 9 ? "0:" + roundTimer : "0:0" + roundTimer,
        centerX, earth + twentyfive
    );
    
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(score, centerX, fifty);
    
}


function populateCities() {

    //reset everything
    missileArray = [];
    boomArray = [];

    cityArray = [];

    missiles = 20;
    score = 0;
    roundTimer = 20;

    clock = 0;
    clockNew = 0;
    roundCount = 5;
    missileTimer = 0;

    // find the city locations for aiming later
    var citySpace;
    for (i = 0; i < 6; i++) {
        citySpace = canvas.width / 8;
        i < 3 ? citySpace *= (i + 1) : citySpace *= (i + 2); // leave room for the base
        cityArray.push({
            alive : true,
            x : citySpace,
        });
    }
    if (isPlaying) {
        clock = new Date().getTime();
        missiles = 20,
        score = 0,
        roundTimer = 20;
        main();
    }
}

canvas.addEventListener("click", function playerFire(event) {
    var field = canvas.getBoundingClientRect();
    var mouseX = event.clientX - field.left;
    var mouseY = event.clientY - field.top;
    if (isPlaying) {
        if (missiles > 0) {
            calcMissile(centerX, aimer, mouseX, mouseY);
            missiles--;
            var missile_player = new Audio('sounds/missile_player.wav');
            missile_player.play();
        }
    } else {
        isPlaying = true;
        populateCities();
    }
}, false);

function deathTest(){
    var aliveCities = 0;
    for (i = 0; i < cityArray.length; i++){
        aliveCities += cityArray[i].alive;
    }
    if (aliveCities == 0) {
        isPlaying = false;
    }
}

function titleScreen(){
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    populateCities();
    drawMap();
    drawHud();
    titleBox();
}

function gameOver() {
    titleBox();
}

function titleBox() {
    ctx.fillStyle = "black";
    ctx.fillRect(canvas.width / 4, centerY - (canvas.width * 0.11), canvas.width / 2, canvas.height / 4);
    ctx.strokeStyle = "white";
    ctx.strokeRect(canvas.width / 4, centerY - (canvas.width * 0.11), canvas.width / 2, canvas.height / 4);

    var fontOne = Math.round(canvas.width * 0.045);
    var fontTwo = Math.round(canvas.width * 0.025);

    var f1 = fontOne.toString() + "px Sans";
    var f2 = fontTwo.toString() + "px Sans";

    ctx.font = f1;
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Missile Barrage", centerX, centerY - forty);
    ctx.font = f2;
    ctx.fillText("By Jake Brunsman", centerX, centerY - ten);
    ctx.fillStyle = "yellow";
    ctx.fillText("Click to Begin!", centerX, centerY + forty);
}

titleScreen();