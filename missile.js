var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

var missileArray = [],
    boomArray = [],
    boomRadius = 35,
    earth = canvas.height - 50,
    center = canvas.width / 2,
    aimer = earth - 35,
    cityArray = [];

var missiles = 20,
    score = 0,
    roundTimer = 20;

var clock,
    clockNew,
    roundCount = 5,
    missileTimer = 0;


function main() {

    window.requestAnimationFrame(main);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawMap();
    
    if (clockNew >= clock + 1000) {
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
        if (roundCount > 1) { roundCount--; }
    }
    
    missileAdvance();
    boomAdvance();
    
    drawHud();
    clockNew = new Date().getTime();
}


function launchMissile() {

    function rollDice() {
        min = Math.ceil(0);
        max = Math.floor(canvas.width);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    if (Math.floor((Math.random() * 100) + 1) < 75) {

        calcMissile(rollDice(), 0, rollDice(), earth);
        
    } else {
    
        var targets = [];
        for (i = 0; i < cityArray.length; i++) {
            if (cityArray[i].alive === true) {
                targets.push(cityArray[i].x);
            }
        }
        targets.push(center);
        var t = Math.floor(Math.random() * targets.length);
        
        calcMissile(rollDice(), 0, targets[t], earth)
    }
}




function calcMissile(xst, yst, xnd, ynd) {

    var segmod = 0.5;
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
                Math.pow(earth - 15 - boomArray[n].y, 2))
                
                <= Math.pow(boomArray[n].progress, 2)
                
                && cityArray[i].alive === true ) {
                
                cityArray[i].alive = false;
                boomArray.push({
                    x : cityArray[i].x,
                    y : earth,
                    progress : 20,
                });
            }
        }
        
        if (Math.pow(center - boomArray[n].x, 2) + Math.pow(earth - 15 -
            boomArray[n].y, 2) <= Math.pow(boomArray[n].progress, 2)) {
            missiles = 0;
        }
                
        if (boomArray[n].progress === boomRadius) {
            boomArray.splice(n, 1);
        } else {
            boomArray[n].progress += 1;
        }
    }
}


function drawMap() {

    // draw earth
    ctx.fillStyle = "green";
    ctx.fillRect(0, earth, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.moveTo((canvas.width / 2) - 40, earth);
    ctx.quadraticCurveTo(center, earth - 60, center + 40, earth);
    ctx.moveTo((canvas.width / 2) - 40, earth);
    ctx.fillStyle = "green";
    ctx.fill();

    // draw cities
    for (i = 0; i < cityArray.length; i++) {
        if (cityArray[i].alive) {
            ctx.beginPath();
            ctx.fillStyle = "dimgray";
            ctx.fillRect(cityArray[i].x - 20, earth - 15, 20, 15);
            ctx.fillStyle = "gray";
            ctx.fillRect(cityArray[i].x - 10, earth - 30, 20, 30);
            ctx.fillStyle = "silver";
            ctx.fillRect(cityArray[i].x, earth - 20, 20, 20);
        } else {
            ctx.beginPath();
            ctx.arc(cityArray[i].x, earth - 20, boomRadius, 0, 2 * Math.PI);
            ctx.fillStyle = "black";
            ctx.fill();
        }
    }
}


function drawHud() {

    // add the base last (looks better this way when shooting)
    ctx.beginPath();
    ctx.fillStyle = "gray";
    ctx.fillRect(center - 10, earth - 35, 20, 10);
    ctx.beginPath();
    ctx.arc(center, aimer, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "gray";
    ctx.fill();
    
    // add HUD last so it's on top
    ctx.font = "20px Terminal";
    ctx.textAlign = "center";
    ctx.fillStyle = "black";
    ctx.fillText(
        missiles > 9 ? missiles : "0" + missiles,
        center, earth
    );
    
    ctx.fillText(
        roundTimer > 9 ? "0:" + roundTimer : "0:0" + roundTimer,
        center, earth + 25
    );
    
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText(score, center, 50);
    
}


function populate() {
    var citySpace;
    for (i = 0; i < 6; i++) {
        citySpace = canvas.width / 8;
        i < 3 ? citySpace *= (i + 1) : citySpace *= (i + 2); // leave room for the base
        cityArray.push({
            alive : true,
            x : citySpace,
        });
    }
        
    clock = new Date().getTime();
    main();
}




canvas.addEventListener("click", function playerFire(event) {
    var field = canvas.getBoundingClientRect();
    var mouseX = event.clientX - field.left;
    var mouseY = event.clientY - field.top;
    if (missiles > 0) {
        calcMissile(center, aimer, mouseX, mouseY);
        missiles--;
    }
}, false);

populate();
