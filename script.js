// Hardcore Scaling state initialization
let game = {
    coins: 0,
    cps: 0,
    totalClicks: 0,
    quantum: 0,
    prestigeMult: 1.0,
    activeBoost: null, // 'red', 'blue', or null
    boostMultiplier: 1,
    upgrades: {
        bot: { count: 0, cost: 20, income: 0.2 },
        gpu: { count: 0, cost: 250, income: 3.5 },
        mainframe: { count: 0, cost: 3200, income: 40.0 },
        quantum: { count: 0, cost: 45000, income: 350.0 }
    },
    achievements: {
        firstClick: false,
        hundredClicks: false,
        tenBots: false,
        gpuArmy: false,
        rich: false,
        anomalyRed: false,
        anomalyBlue: false,
        anomalyGold: false,
        firstPrestige: false
    }
};

const achDetails = {
    firstClick: { title: "First Injection", desc: "Successfully injected 1 data packet.", icon: "🖱️" },
    hundredClicks: { title: "Clicker Overlord", desc: "Manually extracted data 100 times.", icon: "⚡" },
    tenBots: { title: "Botnet Initiated", desc: "Acquired 10 automated scripts.", icon: "🤖" },
    gpuArmy: { title: "Nuclear Rig", desc: "Assembled 5 massive Plutonium GPU rigs.", icon: "☢️" },
    rich: { title: "Net Worth Infiltrated", desc: "Held over 10,000 ByteCoins.", icon: "💰" },
    anomalyRed: { title: "Overclocked Speedster", desc: "Caught a Red Anomaly Core.", icon: "🔴" },
    anomalyBlue: { title: "Matrix Glitcher", desc: "Caught a Blue Anomaly Core.", icon: "🔵" },
    anomalyGold: { title: "Jackpot Found", desc: "Caught a Golden Anomaly Core.", icon: "🟡" },
    firstPrestige: { title: "Transcended Reality", desc: "Triggered a Singularity Reboot.", icon: "🌀" }
};

if (localStorage.getItem("hardcoreCyberOS_Save")) {
    game = JSON.parse(localStorage.getItem("hardcoreCyberOS_Save"));
    game.activeBoost = null;
    game.boostMultiplier = 1;
}

const balanceUI = document.getElementById("balance");
const cpsUI = document.getElementById("cps-display");
const clickBox = document.getElementById("clickBox");
const coreGlow = document.getElementById("core-glow");
const prestigeBtn = document.getElementById("prestigeBtn");
const quantumCountUI = document.getElementById("quantum-count");
const prestigeMultUI = document.getElementById("prestige-multiplier");
const anomalyNode = document.getElementById("anomaly-node");
const achPop = document.getElementById("ach-notification");

// Core spinning rate animation control variable
let currentCpsValue = 0;

function updateUI() {
    balanceUI.textContent = Math.floor(game.coins);
    
    currentCpsValue = game.cps * game.prestigeMult * game.boostMultiplier;
    cpsUI.textContent = `NET_GENERATION: ${currentCpsValue.toFixed(1)} BC/s`;

    // Dynamic animation speed adjustment based on current production load
    let spinSpeed = currentCpsValue > 0 ? Math.max(0.5, 5 - (currentCpsValue / 50)) : 3;
    coreGlow.style.animationDuration = `${spinSpeed}s`;

    for (let key in game.upgrades) {
        document.getElementById(`${key}-cost`).textContent = Math.floor(game.upgrades[key].cost);
        document.getElementById(`${key}-count`).textContent = game.upgrades[key].count;
    }
    if (document.getElementById("quantum-count-item")) {
        document.getElementById("quantum-count-item").textContent = game.upgrades.quantum.count;
    }

    quantumCountUI.textContent = game.quantum;
    prestigeMultUI.textContent = game.prestigeMult.toFixed(2);
    
    // HARDCORE PRESTIGE EQUATION: Requires 25,000 BC minimum to even gain 1 point
    let pendingQuantum = Math.floor(Math.sqrt(game.coins / 25000));
    if (pendingQuantum > 0) {
        prestigeBtn.classList.remove("locked");
        prestigeBtn.textContent = `REBOOT CORE FOR +${pendingQuantum} CHIPS`;
    } else {
        prestigeBtn.classList.add("locked");
        prestigeBtn.textContent = `REBOOT CORE FOR +0 CHIPS`;
    }

    // Toggle grid view unlocks status
    for (let achKey in game.achievements) {
        let card = document.getElementById(`ach-${achKey}`);
        if (card) {
            if (game.achievements[achKey]) card.classList.remove("locked");
            else card.classList.add("locked");
        }
    }
}

function triggerAchievement(key) {
    if (game.achievements[key]) return; // Already unlocked
    game.achievements[key] = true;
    updateUI();
    saveGame();

    // Display sliding Pop-up alert
    document.getElementById("ach-pop-icon").textContent = achDetails[key].icon;
    document.getElementById("ach-pop-title").textContent = achDetails[key].title;
    document.getElementById("ach-pop-desc").textContent = achDetails[key].desc;
    
    achPop.classList.remove("hidden");
    
    setTimeout(() => {
        achPop.classList.add("hidden");
    }, 4000);
}

function saveGame() {
    localStorage.setItem("hardcoreCyberOS_Save", JSON.stringify(game));
}

function createFloatingNumber(x, y, text, type) {
    const el = document.createElement("div");
    el.className = `floating-number ${type || ''}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 600);
}

// User Action Infiltration
clickBox.addEventListener("click", (e) => {
    game.totalClicks++;
    triggerAchievement("firstClick");
    if (game.totalClicks >= 100) triggerAchievement("hundredClicks");

    let baseClickValue = 1 * game.prestigeMult;
    let earned = baseClickValue;
    let type = '';

    if (game.activeBoost === 'blue') {
        // BLUE GLITCH ANOMALY ACTIVE ACTION: Earns 5% of total CPS value per click!
        let glitchBonus = (game.cps * game.prestigeMult) * 0.05;
        earned = (baseClickValue * 10) + glitchBonus;
        type = 'glitch-float';
    } else {
        // Normal random critical calculation (10% chance)
        let isCritic = Math.random() < 0.10;
        if (isCritic) {
            earned = baseClickValue * 6;
            type = 'critic';
        }
    }

    if (game.activeBoost === 'red') {
        earned *= 4; // Multiplied by the global speed overclock multiplier
    }

    game.coins += earned;
    
    let floatText = type === 'critic' ? `+${Math.floor(earned)} CRIT!` : `+${earned.toFixed(1)}`;
    createFloatingNumber(e.clientX, e.clientY, floatText, type);
    
    if (game.coins >= 10000) triggerAchievement("rich");
    updateUI();
});

// Shop system implementation
function buyUpgrade(type) {
    const up = game.upgrades[type];
    if (game.coins >= up.cost) {
        game.coins -= up.cost;
        up.count++;
        // BRUTAL ECONOMY SCALE: Cost scales exponentially by multiplying with 1.22
        up.cost = Math.floor(up.cost * 1.22); 
        
        if (type === 'bot' && up.count >= 10) triggerAchievement("tenBots");
        if (type === 'gpu' && up.count >= 5) triggerAchievement("gpuArmy");

        recalculateCPS();
        updateUI();
        saveGame();
    }
}

function recalculateCPS() {
    let baseCPS = 0;
    for (let key in game.upgrades) {
        baseCPS += game.upgrades[key].count * game.upgrades[key].income;
    }
    game.cps = baseCPS;
}

document.getElementById("upgrade-bot").addEventListener("click", () => buyUpgrade("bot"));
document.getElementById("upgrade-gpu").addEventListener("click", () => buyUpgrade("gpu"));
document.getElementById("upgrade-mainframe").addEventListener("click", () => buyUpgrade("mainframe"));
if (document.getElementById("upgrade-quantum")) {
    document.getElementById("upgrade-quantum").addEventListener("click", () => buyUpgrade("quantum"));
}

prestigeBtn.addEventListener("click", () => {
    let pendingQuantum = Math.floor(Math.sqrt(game.coins / 25000));
    if (pendingQuantum > 0) {
        game.quantum += pendingQuantum;
        // HARDCORE PRESTIGE GAIN RATIO: Gives +10% production yield boost permanently per item
        game.prestigeMult = 1.0 + (game.quantum * 0.10);
        
        game.coins = 0;
        game.cps = 0;
        game.upgrades.bot = { count: 0, cost: 20, income: 0.2 };
        game.upgrades.gpu = { count: 0, cost: 250, income: 3.5 };
        game.upgrades.mainframe = { count: 0, cost: 3200, income: 40.0 };
        game.upgrades.quantum = { count: 0, cost: 45000, income: 350.0 };
        
        triggerAchievement("firstPrestige");
        recalculateCPS();
        updateUI();
        saveGame();
    }
});

// ADVANCED ENHANCED ANOMALY GENERATOR
let currentAnomalyType = 'red';

function spawnAnomaly() {
    if (game.activeBoost) return; // Do not spawn nodes during active runtime boosts

    const types = ['red', 'blue', 'gold'];
    // Red: 45%, Blue: 40%, Gold: 15% probability distribution
    let rand = Math.random();
    if (rand < 0.45) currentAnomalyType = 'red';
    else if (rand < 0.85) currentAnomalyType = 'blue';
    else currentAnomalyType = 'gold';

    // Style the Node according to targeted type rules
    if (currentAnomalyType === 'red') {
        anomalyNode.style.backgroundColor = '#ff0055';
        anomalyNode.style.boxShadow = '0 0 25px #ff0055';
    } else if (currentAnomalyType === 'blue') {
        anomalyNode.style.backgroundColor = '#00aaff';
        anomalyNode.style.boxShadow = '0 0 25px #00aaff';
    } else {
        anomalyNode.style.backgroundColor = '#ffcc00';
        anomalyNode.style.boxShadow = '0 0 25px #ffcc00';
    }

    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;
    anomalyNode.style.left = `${Math.random() * maxX}px`;
    anomalyNode.style.top = `${Math.random() * maxY}px`;
    anomalyNode.classList.remove("hidden");

    setTimeout(() => {
        anomalyNode.classList.add("hidden");
    }, 7000); // 7 seconds timeout reaction limits
}

anomalyNode.addEventListener("click", () => {
    anomalyNode.classList.add("hidden");
    
    if (currentAnomalyType === 'red') {
        triggerAchievement("anomalyRed");
        game.activeBoost = 'red';
        game.boostMultiplier = 4; // 4x Automated Engine Overclock
        document.body.className = "boost-red";
        
        setTimeout(() => {
            endBoost();
        }, 15000);
    } 
    else if (currentAnomalyType === 'blue') {
        triggerAchievement("anomalyBlue");
        game.activeBoost = 'blue';
        document.body.className = "boost-active boost-blue";
        
        setTimeout(() => {
            endBoost();
        }, 12000);
    } 
    else if (currentAnomalyType === 'gold') {
        triggerAchievement("anomalyGold");
        // GOLD FORTUNE PAYLOAD: Gives instant money cache up to 4 minutes worth of active automated output
        let payout = Math.max(100, (game.cps * game.prestigeMult) * 240);
        game.coins += payout;
        
        document.body.className = "flash-gold";
        setTimeout(() => {
            document.body.className = "";
        }, 150);
    }

    updateUI();
});

function endBoost() {
    game.activeBoost = null;
    game.boostMultiplier = 1;
    document.body.className = "";
    updateUI();
}

// Spawn ticks checker loop runs once every 40 seconds
setInterval(spawnAnomaly, 40000);

// Core Processing Execution Engine Ticker
setInterval(() => {
    let output = game.cps * game.prestigeMult * game.boostMultiplier;
    game.coins += output;
    updateUI();
    saveGame();
}, 1000);

document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("WARNING: Wipe mainframe logs? This clears everything completely.")) {
        localStorage.removeItem("hardcoreCyberOS_Save");
        location.reload();
    }
});

// Bootloader sequencing initialization
recalculateCPS();
updateUI();
