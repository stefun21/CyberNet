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
    falseButtonSpam: 0,
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
        firstOverheat: false, survival: false, firstPrestige: false,
        buttonSpam: false
    }
};

const achDetails = {
    firstClick: { title: "First Injection", desc: "1 data packet.", icon: "🖱️" },
    hundredClicks: { title: "Clicker Squire", desc: "15 clicks.", icon: "⚡" },
    thousandClicks: { title: "Clicker Overlord", desc: "50 clicks.", icon: "🖲️" },
    tenBots: { title: "Botnet Initiated", desc: "3 scripts.", icon: "🤖" },
    gpuArmy: { title: "Nuclear Rig", desc: "2 GPU Rigs.", icon: "☢️" },
    clickMaster: { title: "Hyper Needle", desc: "5 upgrades.", icon: "💉" },
    dysonCore: { title: "Cosmic Hijacker", desc: "1 Dyson Cluster.", icon: "🌌" },
    rich: { title: "Net Infiltrated", desc: "500 BC held.", icon: "💰" },
    millionaire: { title: "Cyber Tycoon", desc: "25,000 BC held.", icon: "💎" },
    anomalyRed: { title: "Red Core", desc: "Caught Red.", icon: "🔴" },
    anomalyBlue: { title: "Matrix Glitcher", desc: "Caught Blue.", icon: "🔵" },
    anomalyGold: { title: "Jackpot Inbound", desc: "Caught Gold.", icon: "🟡" },
    firstOverheat: { title: "Meltdown Warning", desc: "Core > 100°C.", icon: "🔥" },
    survival: { title: "System Engineer", desc: "3 recoveries.", icon: "🛡️" },
    firstPrestige: { title: "Transcended", desc: "Reboot Core.", icon: "🌀" },
    buttonSpam: { title: "Ghost In The Shell", desc: "Spammed controls.", icon: "🕹️" }
};

if (localStorage.getItem("hardcoreCyberOS_v9_Save")) {
    game = JSON.parse(localStorage.getItem("hardcoreCyberOS_v9_Save"));
    game.activeBoost = null;
    game.boostMultiplier = 1;
    game.isOverheated = false;
    if (game.falseButtonSpam === undefined) game.falseButtonSpam = 0;
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
const clickStabilityUI = document.getElementById("click-efficiency");
const eventTicker = document.getElementById("event-ticker");
const glitchPopup = document.getElementById("glitch-popup");
const popupText = document.getElementById("popup-text");
const fakeLog = document.getElementById("fake-log-output");

let lastFrameTime = performance.now();
let lastClickTime = 0;
let currentEventMultiplier = 1.0;

const glitchMessages = [
    "SYSTEM_ERR: Trace route localized by police.",
    "CRITICAL: Ghost packets in Mainframe sector 7.",
    "MEM_LEAK: Sub-routine 'human_clicker' high RAM.",
    "WARN: AI Core attempted external web access."
];

function updateUI() {
    balanceUI.textContent = Math.floor(game.coins);
    
    let currentCps = game.cps * game.prestigeMult * game.boostMultiplier * currentEventMultiplier;
    cpsUI.textContent = `// CPS: ${currentCps.toFixed(1)}`;
    
    let currentCpc = game.clickValue * game.prestigeMult;
    cpcUI.textContent = `// CPC: ${currentCpc.toFixed(1)} BC`;

    let spinSpeed = currentCps > 0 ? Math.max(0.4, 6 - (currentCps / 60)) : 4;
    coreGlow.style.animationDuration = `${spinSpeed}s`;

    for (let key in game.upgrades) {
        let itemUI = document.getElementById(`upgrade-${key}`);
        let costUI = document.getElementById(`${key}-cost`);
        let countUI = document.getElementById(key === 'quantum' ? 'quantum-count-item' : `${key}-count`);
        
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
        prestigeBtn.textContent = `REBOOT (+${pendingQuantum})`;
    } else {
        prestigeBtn.classList.add("locked");
        prestigeBtn.textContent = `REBOOT CORE`;
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

    achSectionTitle.textContent = `// DECRYPTED_ACHIEVEMENTS (Lvl ${game.masteryLevel})`;
    if (totalUnlocked === 16) masteryBtn.classList.remove("hidden");
    else masteryBtn.classList.add("hidden");

    updateHeatGauge();
}

function updateHeatGauge() {
    tempDisplay.textContent = Math.floor(game.heat);
    if(heatBar) heatBar.style.width = `${game.heat}%`;

    if (game.isOverheated) {
        coreText.textContent = "OVERHEAT REBOOT...";
    } else {
        coreText.textContent = game.activeBoost === 'blue' ? "GLITCH MODE" : "EXTRACT DATA";
    }
}

// Fluid Loop (60 FPS) - MODIFICAT: Cooldown masiv accelerat
function fluidLoop(timestamp) {
    let deltaTime = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    if (game.isOverheated) {
        // Răcire în overheat: de la 66.6 crescut la 180.0 (Recuperare ultra rapidă în ~0.5 secunde)
        game.heat -= 180.0 * deltaTime; 
        if (game.heat <= 0) {
            game.heat = 0;
            game.isOverheated = false;
            document.body.classList.remove("core-overheated");
            updateUI();
            saveGame();
        }
        updateHeatGauge();
    } else if (game.heat > 0) {
        // Răcire normală pasivă: de la 66.6 crescut la 200.0 (Scade instantaneu)
        if (timestamp - lastClickTime > 120) { // Timp de așteptare redus de la 250ms la 120ms
            game.heat -= 200.0 * deltaTime;
            if (game.heat < 0) game.heat = 0;
            updateHeatGauge();
        }
    }

    requestAnimationFrame(fluidLoop);
}
requestAnimationFrame(fluidLoop);

setInterval(() => {
    let output = game.cps * game.prestigeMult * game.boostMultiplier * currentEventMultiplier;
    if (output > 0) {
        game.coins += output;
        updateUI();
        saveGame();
    }
    
    if (Math.random() < 0.008 && glitchPopup.classList.contains("hidden")) {
        popupText.textContent = glitchMessages[Math.floor(Math.random() * glitchMessages.length)];
        glitchPopup.classList.remove("hidden");
    }
}, 1000);

function triggerRandomEvent() {
    if (game.isOverheated) return;
    let roll = Math.random();
    if (roll < 0.35) {
        currentEventMultiplier = 1.5;
        eventTicker.textContent = "// BOOST (+50% CPS)";
        eventTicker.style.color = "var(--neon-blue)";
        setTimeout(resetEvent, 10000);
    } else if (roll < 0.70) {
        currentEventMultiplier = 0.4;
        eventTicker.textContent = "// MITIGATION (-60% CPS)";
        eventTicker.style.color = "var(--neon-red)";
        setTimeout(resetEvent, 8000);
    } else {
        eventTicker.textContent = "// ION STORM (VOLATILE)";
        eventTicker.style.color = "var(--neon-gold)";
        clickStabilityUI.textContent = "// STB: VOLATILE_99%";
        setTimeout(resetEvent, 10000);
    }
    updateUI();
}
function resetEvent() {
    currentEventMultiplier = 1.0;
    eventTicker.textContent = "// SYSTEM_STATUS: RUNNING_OPTIMAL";
    eventTicker.style.color = "var(--neon-gold)";
    clickStabilityUI.textContent = "// STB: 100%";
    updateUI();
}
setInterval(triggerRandomEvent, 45000);

const fakeResponses = {
    "fake-flush": ["DNS cache cleared.", "Purging sockets...", "Tables re-indexed."],
    "fake-bypass": ["Scanning ports...", "AES firewall bypassed.", "Signature masked."],
    "fake-overclock": ["Fan speed altered.", "Nitrogen deployed.", "Sensors nominal."],
    "fake-proxy": ["Hopping to Swiss proxy...", "Obfuscating MAC...", "Tunnel synced."]
};

function handleFakeInteraction(id) {
    game.falseButtonSpam++;
    let options = fakeResponses[id];
    let pick = options[Math.floor(Math.random() * options.length)];
    fakeLog.textContent = `// ${pick}`;
    
    let btn = document.getElementById(id);
    btn.style.color = "var(--neon-gold)";
    setTimeout(() => { btn.style.color = "var(--terminal-bright)"; }, 120);

    if (game.falseButtonSpam >= 25) triggerAchievement("buttonSpam");
    saveGame();
}

document.getElementById("fake-flush").addEventListener("click", () => handleFakeInteraction("fake-flush"));
document.getElementById("fake-bypass").addEventListener("click", () => handleFakeInteraction("fake-bypass"));
document.getElementById("fake-overclock").addEventListener("click", () => handleFakeInteraction("fake-overclock"));
document.getElementById("fake-proxy").addEventListener("click", () => handleFakeInteraction("fake-proxy"));
document.getElementById("close-popup-btn").addEventListener("click", () => glitchPopup.classList.add("hidden"));

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
    document.getElementById("ach-pop-title").textContent = achDetails[key].title;
    document.getElementById("ach-pop-desc").textContent = achDetails[key].desc;
    
    achPop.classList.remove("hidden");
    setTimeout(() => achPop.classList.add("hidden"), 3000);
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
    setTimeout(() => el.remove(), 500);
}

// Click Trigger - MODIFICAT: Permite mai multe click-uri până la overheat
clickBox.addEventListener("click", (e) => {
    if (game.isOverheated) return;

    lastClickTime = performance.now();

    // Redus acumularea de căldură per click de la 6.0 la 5.8 (Necesită ~17 click-uri rapide pentru Overheat)
    game.heat += 5.8; 
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
        if (Math.random() < 0.12) {
            earned = currentCpcBase * 6;
            type = 'critic';
        }
    }

    if (game.activeBoost === 'red') earned *= 4;
    game.coins += earned;
    
    let floatText = type === 'critic' ? `+${Math.floor(earned)} CRIT!` : `+${earned.toFixed(1)}`;
    createFloatingNumber(e.clientX, e.clientY, floatText, type);
    
    updateUI();
});

function buyUpgrade(type) {
    const up = game.upgrades[type];
    if (game.coins >= up.cost) {
        game.coins -= up.cost;
        up.count++;
        up.cost = Math.floor(up.cost * 1.22);
        if (type === 'click') game.clickValue += up.income;
        recalculateCPS();
        checkAchievementConditions();
        updateUI();
        saveGame();
    }
}

function recalculateCPS() {
    let baseCPS = 0;
    for (let key in game.upgrades) {
        if (key !== 'click') baseCPS += game.upgrades[key].count * game.upgrades[key].income;
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
    for (let achKey in game.achievements) game.achievements[achKey] = false;
    for (let key in game.upgrades) game.upgrades[key].count += 5;
    game.clickValue += (5 * game.upgrades.click.income);
    recalculateCostsAndIncomes();
    recalculateCPS();
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

    const maxX = window.innerWidth - 45;
    const maxY = window.innerHeight - 45;
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
    } else if (currentAnomalyType === 'blue') {
        triggerAchievement("anomalyBlue");
        game.activeBoost = 'blue';
        document.body.classList.add("boost-blue");
        setTimeout(endBoost, 12000);
    } else if (currentAnomalyType === 'gold') {
        triggerAchievement("anomalyGold");
        game.coins += Math.max(150, (game.cps * game.prestigeMult) * 250);
    }
    updateUI();
});

function endBoost() {
    game.activeBoost = null; game.boostMultiplier = 1;
    document.body.classList.remove("boost-red", "boost-blue");
    updateUI();
}

setInterval(spawnAnomaly, 38000);

document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Clear profile cache?")) {
        localStorage.removeItem("hardcoreCyberOS_v9_Save");
        location.reload();
    }
});

recalculateCPS();
updateUI();
