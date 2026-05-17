let game = {
    coins: 0,
    cps: 0,
    clickValue: 1.0,
    totalClicks: 0,
    quantum: 0,
    prestigeMult: 1.0,
    activeBoost: null,
    boostMultiplier: 1,
    heat: 0,
    isOverheated: false,
    overheatCycles: 0,
    masteryLevel: 1, 
    upgrades: {
        click: { count: 0, cost: 50, income: 1.0 },
        bot: { count: 0, cost: 20, income: 0.2 },
        gpu: { count: 0, cost: 250, income: 3.5 },
        mainframe: { count: 0, cost: 3200, income: 40.0 },
        quantum: { count: 0, cost: 45000, income: 350.0 },
        dyson: { count: 0, cost: 950000, income: 4200.0 }
    },
    achievements: {
        firstClick: false, hundredClicks: false, thousandClicks: false,
        tenBots: false, gpuArmy: false, clickMaster: false, dysonCore: false,
        rich: false, millionaire: false,
        anomalyRed: false, anomalyBlue: false, anomalyGold: false,
        firstOverheat: false, survival: false, firstPrestige: false
    }
};

const achDetails = {
    firstClick: { title: "First Injection", desc: "Injected 1 structural data packet.", icon: "🖱️" },
    hundredClicks: { title: "Clicker Squire", desc: "Manually extracted data 15 times.", icon: "⚡" },
    thousandClicks: { title: "Clicker Overlord", desc: "Extracted data 50 times manually.", icon: "🖲️" },
    tenBots: { title: "Botnet Initiated", desc: "Acquired 3 automated network scripts.", icon: "🤖" },
    gpuArmy: { title: "Nuclear Rig Assembly", desc: "Assembled 2 structural Plutonium GPU rigs.", icon: "☢️" },
    clickMaster: { title: "Hyper Needle", desc: "Upgraded manual click injector 5 times.", icon: "💉" },
    dysonCore: { title: "Cosmic Hijacker", desc: "Captured an entire Dyson Data Cluster.", icon: "🌌" },
    rich: { title: "Net Worth Infiltrated", desc: "Held over 500 active ByteCoins.", icon: "💰" },
    millionaire: { title: "Cyber Tycoon", desc: "Stored over 25,000 native ByteCoins.", icon: "💎" },
    anomalyRed: { title: "Overclocked Speedster", desc: "Caught a Red Anomaly Core.", icon: "🔴" },
    anomalyBlue: { title: "Matrix Glitcher", desc: "Caught a Blue Anomaly Core.", icon: "🔵" },
    anomalyGold: { title: "Jackpot Inbound", desc: "Caught a Gold Fortune Anomaly.", icon: "🟡" },
    firstOverheat: { title: "Meltdown Warning", desc: "Pushed the core array past 100°C.", icon: "🔥" },
    survival: { title: "System Engineer", desc: "Recovered from 3 overheat system states.", icon: "🛡️" },
    firstPrestige: { title: "Transcended Reality", desc: "Triggered a Singularity Core Reboot.", icon: "🌀" }
};

// State pentru stadiul barelor de progres (0% la 100%)
let shopProgress = { bot: 0, gpu: 0, mainframe: 0, quantum: 0, dyson: 0, click: 0 };

if (localStorage.getItem("hardcoreCyberOS_v9_Save")) {
    game = JSON.parse(localStorage.getItem("hardcoreCyberOS_v9_Save"));
    game.activeBoost = null;
    game.boostMultiplier = 1;
    game.isOverheated = false;
}

const balanceUI = document.getElementById("balance");
const cpsUI = document.getElementById("cps-display");
const cpcUI = document.getElementById("cpc-display");
const clickBox = document.getElementById("clickBox");
const coreText = document.getElementById("core-text");
const coreGlow = document.getElementById("core-glow");
const prestigeBtn = document.getElementById("prestigeBtn");
const quantumCountUI = document.getElementById("quantum-count");
const prestigeMultUI = document.getElementById("prestige-multiplier");
const anomalyNode = document.getElementById("anomaly-node");
const achPop = document.getElementById("ach-notification");
const heatBar = document.getElementById("heat-bar");
const tempDisplay = document.getElementById("temp-display");
const masteryBtn = document.getElementById("masteryBtn");
const achSectionTitle = document.getElementById("ach-section-title");

let lastFrameTime = performance.now();
let lastClickTime = 0;

function updateUI() {
    balanceUI.textContent = Math.floor(game.coins);
    
    let currentCps = game.cps * game.prestigeMult * game.boostMultiplier;
    cpsUI.textContent = `// NET_GENERATION: ${currentCps.toFixed(1)} BC/s`;
    
    let currentCpc = game.clickValue * game.prestigeMult;
    cpcUI.textContent = `// CLICK_VALUE: ${currentCpc.toFixed(1)} BC`;

    let spinSpeed = currentCps > 0 ? Math.max(0.4, 6 - (currentCps / 60)) : 4;
    coreGlow.style.animationDuration = `${spinSpeed}s`;

    for (let key in game.upgrades) {
        let itemUI = document.getElementById(`upgrade-${key}`);
        let costUI = document.getElementById(`${key}-cost`);
        let countUI = document.getElementById(`${key}-count-item` === `${key}-count` ? `${key}-count-item` : `${key}-count`);
        
        if(costUI) costUI.textContent = Math.floor(game.upgrades[key].cost);
        if(countUI) countUI.textContent = game.upgrades[key].count;
        
        if (game.coins < game.upgrades[key].cost) {
            if(itemUI) itemUI.classList.add("disabled");
        } else {
            if(itemUI) itemUI.classList.remove("disabled");
        }
    }

    quantumCountUI.textContent = game.quantum;
    prestigeMultUI.textContent = game.prestigeMult.toFixed(2);
    
    let pendingQuantum = Math.floor(Math.sqrt(game.coins / 35000));
    if (pendingQuantum > 0) {
        prestigeBtn.classList.remove("locked");
        prestigeBtn.textContent = `REBOOT CORE FOR +${pendingQuantum} CHIPS`;
    } else {
        prestigeBtn.classList.add("locked");
        prestigeBtn.textContent = `REBOOT CORE FOR +0 CHIPS`;
    }

    let totalUnlocked = 0;
    for (let achKey in game.achievements) {
        let card = document.getElementById(`ach-${achKey}`);
        if (card) {
            if (game.achievements[achKey]) {
                card.classList.remove("locked");
                if (game.masteryLevel > 1) card.classList.add("mastered");
                totalUnlocked++;
            } else {
                card.classList.add("locked");
                card.classList.remove("mastered");
            }
        }
    }

    achSectionTitle.textContent = `// DECRYPTED ACHIEVEMENTS INDEX (Lvl ${game.masteryLevel})`;

    if (totalUnlocked === 15) {
        masteryBtn.classList.remove("hidden");
    } else {
        masteryBtn.classList.add("hidden");
    }

    updateHeatGauge();
}

function updateHeatGauge() {
    tempDisplay.textContent = Math.floor(game.heat);
    if(heatBar) {
        heatBar.style.width = `${game.heat}%`;
    }

    if (game.isOverheated) {
        coreText.textContent = "OVERHEAT: REBOOTING...";
    } else {
        coreText.textContent = game.activeBoost === 'blue' ? "GLITCH ENGINE INTENSE" : "EXTRACT DATA";
    }
}

// 60FPS Fluid Rendering Engine - Gestionează răcirea și barele de progres ale magazinului în timp real
function fluidCoolingLoop(timestamp) {
    let deltaTime = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    // 1. Managementul Termodinamic (Răcire)
    if (game.isOverheated) {
        game.heat -= 66.6 * deltaTime; 
        if (game.heat <= 0) {
            game.heat = 0;
            game.isOverheated = false;
            document.body.classList.remove("core-overheated");
            updateUI();
            saveGame();
        }
        updateHeatGauge();
    } else if (game.heat > 0) {
        if (timestamp - lastClickTime > 250) {
            game.heat -= 66.6 * deltaTime;
            if (game.heat < 0) game.heat = 0;
            updateHeatGauge();
        }
    }

    // 2. Livrare de resurse în timp real bazată pe Progresul Barelor (60 FPS)
    let globalMult = game.prestigeMult * game.boostMultiplier;
    let coinsEarnedThisFrame = 0;

    for (let key in shopProgress) {
        if (key === 'click') {
            // Bara de click scade singură fluid înapoi spre 0 pentru un efect de feedback vizual optim
            if (shopProgress.click > 0) {
                shopProgress.click -= 300 * deltaTime;
                if (shopProgress.click < 0) shopProgress.click = 0;
                document.getElementById("progress-bar-click").style.width = `${shopProgress.click}%`;
            }
            continue;
        }

        let upgrade = game.upgrades[key];
        if (upgrade && upgrade.count > 0) {
            // Viteza de deplasare a barei este direct proporțională cu structura modulului
            // Toate barele efectuează o rotație completă la 1 secundă pentru regularitate tactică
            shopProgress[key] += 100 * deltaTime; 

            if (shopProgress[key] >= 100) {
                shopProgress[key] -= 100; // Resetează ciclul barei păstrând restul de milisecunde
                
                // Adăugăm suma totală generată de clădire într-o secundă
                coinsEarnedThisFrame += (upgrade.count * upgrade.income) * globalMult;
            }
            
            // Actualizare stil bară în timp real
            let barEl = document.getElementById(`progress-bar-${key}`);
            if (barEl) barEl.style.width = `${shopProgress[key]}%`;
        }
    }

    if (coinsEarnedThisFrame > 0) {
        game.coins += coinsEarnedThisFrame;
        updateUI();
    }

    requestAnimationFrame(fluidCoolingLoop);
}
requestAnimationFrame(fluidCoolingLoop);

function checkAchievementConditions() {
    let scalar = game.masteryLevel; 

    if (game.totalClicks >= 1) triggerAchievement("firstClick");
    if (game.totalClicks >= 15 * scalar) triggerAchievement("hundredClicks");
    if (game.totalClicks >= 50 * scalar) triggerAchievement("thousandClicks");
    
    if (game.upgrades.bot.count >= 3 * scalar) triggerAchievement("tenBots");
    if (game.upgrades.gpu.count >= 2 * scalar) triggerAchievement("gpuArmy");
    if (game.upgrades.click.count >= 5 * scalar) triggerAchievement("clickMaster");
    if (game.upgrades.dyson.count >= 1 * scalar) triggerAchievement("dysonCore");

    if (game.coins >= 500 * scalar) triggerAchievement("rich");
    if (game.coins >= 25000 * scalar) triggerAchievement("millionaire");
}

function triggerAchievement(key) {
    if (game.achievements[key]) return;
    game.achievements[key] = true;
    updateUI();
    saveGame();

    document.getElementById("ach-pop-icon").textContent = achDetails[key].icon;
    document.getElementById("ach-pop-title").textContent = achDetails[key].title + (game.masteryLevel > 1 ? ` M${game.masteryLevel}` : '');
    document.getElementById("ach-pop-desc").textContent = achDetails[key].desc;
    
    achPop.classList.remove("hidden");
    setTimeout(() => achPop.classList.add("hidden"), 4000);
}

function saveGame() {
    localStorage.setItem("hardcoreCyberOS_v9_Save", JSON.stringify(game));
}

function createFloatingNumber(x, y, text, type) {
    const el = document.createElement("div");
    el.className = `floating-number ${type || ''}`;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 550);
}

// Click Trigger Logic
clickBox.addEventListener("click", (e) => {
    if (game.isOverheated) return;

    lastClickTime = performance.now();
    shopProgress.click = 100; // Impulsionează instant bara albastră a injectorului manual la maxim

    game.heat += 6.0;
    if (game.heat >= 100) {
        game.heat = 100;
        game.isOverheated = true;
        document.body.classList.add("core-overheated");
        triggerAchievement("firstOverheat");
        game.overheatCycles++;
        if (game.overheatCycles >= 3) triggerAchievement("survival");
        updateUI();
        return;
    }

    game.totalClicks++;
    checkAchievementConditions();

    let currentCpcBase = game.clickValue * game.prestigeMult;
    let earned = currentCpcBase;
    let type = '';

    if (game.activeBoost === 'blue') {
        let glitchBonus = (game.cps * game.prestigeMult) * 0.06;
        earned = (currentCpcBase * 12) + glitchBonus;
        type = 'glitch-float';
    } else {
        let isCritic = Math.random() < 0.12;
        if (isCritic) {
            earned = currentCpcBase * 6;
            type = 'critic';
        }
    }

    if (game.activeBoost === 'red') earned *= 4;
    game.coins += earned;
    
    let floatText = type === 'critic' ? `+${Math.floor(earned)} CRIT!` : `+${earned.toFixed(1)}`;
    createFloatingNumber(e.clientX, e.clientY, floatText, type);
    
    checkAchievementConditions();
    updateUI();
});

function buyUpgrade(type) {
    const up = game.upgrades[type];
    if (game.coins >= up.cost) {
        game.coins -= up.cost;
        up.count++;
        up.cost = Math.floor(up.cost * 1.22);
        
        if (type === 'click') {
            game.clickValue += up.income;
        }

        recalculateCPS();
        checkAchievementConditions();
        updateUI();
        saveGame();
    }
}

function recalculateCPS() {
    let baseCPS = 0;
    for (let key in game.upgrades) {
        if (key !== 'click') {
            baseCPS += game.upgrades[key].count * game.upgrades[key].income;
        }
    }
    game.cps = baseCPS;
}

document.getElementById("upgrade-click").addEventListener("click", () => buyUpgrade("click"));
document.getElementById("upgrade-bot").addEventListener("click", () => buyUpgrade("bot"));
document.getElementById("upgrade-gpu").addEventListener("click", () => buyUpgrade("gpu"));
document.getElementById("upgrade-mainframe").addEventListener("click", () => buyUpgrade("mainframe"));
document.getElementById("upgrade-quantum").addEventListener("click", () => buyUpgrade("quantum"));
document.getElementById("upgrade-dyson").addEventListener("click", () => buyUpgrade("dyson"));

prestigeBtn.addEventListener("click", () => {
    let pendingQuantum = Math.floor(Math.sqrt(game.coins / 35000));
    if (pendingQuantum > 0) {
        game.quantum += pendingQuantum;
        game.prestigeMult = 1.0 + (game.quantum * 0.12);
        
        game.coins = 0;
        game.cps = 0;
        game.clickValue = 1.0 + (game.upgrades.click.count * game.upgrades.click.income); 
        game.heat = 0;
        game.isOverheated = false;
        
        // Resetare bare magazin la repornire
        for(let k in shopProgress) shopProgress[k] = 0;
        
        recalculateCostsAndIncomes();
        triggerAchievement("firstPrestige");
        recalculateCPS();
        updateUI();
        saveGame();
    }
});

function recalculateCostsAndIncomes() {
    game.upgrades.click.cost = Math.floor(50 * Math.pow(1.22, game.upgrades.click.count));
    game.upgrades.bot.cost = Math.floor(20 * Math.pow(1.22, game.upgrades.bot.count));
    game.upgrades.gpu.cost = Math.floor(250 * Math.pow(1.22, game.upgrades.gpu.count));
    game.upgrades.mainframe.cost = Math.floor(3200 * Math.pow(1.22, game.upgrades.mainframe.count));
    game.upgrades.quantum.cost = Math.floor(45000 * Math.pow(1.22, game.upgrades.quantum.count));
    game.upgrades.dyson.cost = Math.floor(950000 * Math.pow(1.22, game.upgrades.dyson.count));
}

masteryBtn.addEventListener("click", () => {
    game.masteryLevel++;
    
    for (let achKey in game.achievements) {
        game.achievements[achKey] = false;
    }

    for (let key in game.upgrades) {
        game.upgrades[key].count += 5;
    }

    game.clickValue += (5 * game.upgrades.click.income);
    recalculateCostsAndIncomes();
    recalculateCPS();
    
    document.body.classList.add("flash-gold");
    setTimeout(() => document.body.classList.remove("flash-gold"), 300);

    updateUI();
    saveGame();
});

let currentAnomalyType = 'red';
function spawnAnomaly() {
    if (game.activeBoost || game.isOverheated) return;

    let rand = Math.random();
    if (rand < 0.45) currentAnomalyType = 'red';
    else if (rand < 0.85) currentAnomalyType = 'blue';
    else currentAnomalyType = 'gold';

    if (currentAnomalyType === 'red') { anomalyNode.style.backgroundColor = '#ff0055'; anomalyNode.style.boxShadow = '0 0 25px #ff0055'; }
    else if (currentAnomalyType === 'blue') { anomalyNode.style.backgroundColor = '#00aaff'; anomalyNode.style.boxShadow = '0 0 25px #00aaff'; }
    else { anomalyNode.style.backgroundColor = '#ffcc00'; anomalyNode.style.boxShadow = '0 0 25px #ffcc00'; }

    const maxX = window.innerWidth - 70;
    const maxY = window.innerHeight - 70;
    anomalyNode.style.left = `${Math.random() * maxX}px`;
    anomalyNode.style.top = `${Math.random() * maxY}px`;
    anomalyNode.classList.remove("hidden");

    setTimeout(() => anomalyNode.classList.add("hidden"), 6500);
}

anomalyNode.addEventListener("click", () => {
    anomalyNode.classList.add("hidden");
    
    if (currentAnomalyType === 'red') {
        triggerAchievement("anomalyRed");
        game.activeBoost = 'red'; game.boostMultiplier = 4;
        document.body.classList.add("boost-red");
        setTimeout(endBoost, 15000);
    } 
    else if (currentAnomalyType === 'blue') {
        triggerAchievement("anomalyBlue");
        game.activeBoost = 'blue';
        document.body.classList.add("boost-blue");
        setTimeout(endBoost, 12000);
    } 
    else if (currentAnomalyType === 'gold') {
        triggerAchievement("anomalyGold");
        let payout = Math.max(150, (game.cps * game.prestigeMult) * 250);
        game.coins += payout;
        document.body.classList.add("flash-gold");
        setTimeout(() => document.body.classList.remove("flash-gold"), 150);
    }
    updateUI();
});

function endBoost() {
    game.activeBoost = null; game.boostMultiplier = 1;
    document.body.classList.remove("boost-red", "boost-blue");
    updateUI();
}

setInterval(spawnAnomaly, 38000);

// Notă: Vechiul interval secvențial de adăugare monede a fost complet șters! 
// Toate resursele sunt acum procesate direct în loop-ul de animație 60FPS de mai sus.

document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("WARNING: Clear all master profile cache databases records?")) {
        localStorage.removeItem("hardcoreCyberOS_v9_Save");
        location.reload();
    }
});

recalculateCPS();
updateUI();
