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
        // AM ELIMINAT anomalyGold din baza de date
        firstClick: false, hundredClicks: false, thousandClicks: false,
        tenBots: false, gpuArmy: false, clickMaster: false, dysonCore: false,
        rich: false, millionaire: false,
        anomalyRed: false, anomalyBlue: false,
        firstOverheat: false, survival: false, firstPrestige: false,
        buttonSpam: false
    }
};

const achDetails = {
    firstClick: { title: "First Injection", icon: "🖱️" },
    hundredClicks: { title: "Squire Link", icon: "⚡" },
    thousandClicks: { title: "Overlord Node", icon: "🖲️" },
    tenBots: { title: "Botnet Online", icon: "🤖" },
    gpuArmy: { title: "Thermonuclear", icon: "☢️" },
    clickMaster: { title: "Hyper Needle", icon: "💉" },
    dysonCore: { title: "Star Swarm", icon: "🌌" },
    rich: { title: "Secured Vault", icon: "💰" },
    millionaire: { title: "Cyber Asset", icon: "💎" },
    anomalyRed: { title: "Breached Red", icon: "🔴" },
    anomalyBlue: { title: "Glitch Hunter", icon: "🔵" },
    firstOverheat: { title: "Core Meltdown", icon: "🔥" },
    survival: { title: "Lead Engineer", icon: "🛡️" },
    firstPrestige: { title: "Hard Reboot", icon: "🌀" },
    buttonSpam: { title: "Ghost Protocol", icon: "🕹️" }
};

let cheatActive = false;
let autoClickInterval = null;
let isMouseDownOnCore = false;
let lastCoreClickEvent = null; 
let inputBuffer = "";

if (localStorage.getItem("cyberNetOS_v10_Save")) {
    game = JSON.parse(localStorage.getItem("cyberNetOS_v10_Save"));
    game.activeBoost = null;
    game.boostMultiplier = 1;
    game.isOverheated = false;
    if (game.falseButtonSpam === undefined) game.falseButtonSpam = 0;
    if (game.masteryLevel === undefined) game.masteryLevel = 1;
    
    // Curățare sigură în caz că vechea salvare conținea vechiul achievement eliminat
    if (game.achievements.anomalyGold !== undefined) {
        delete game.achievements.anomalyGold;
    }
}

const balanceUI = document.getElementById("balance");
const cpsUI = document.getElementById("cps-display");
const cpcUI = document.getElementById("cpc-display");
const clickBox = document.getElementById("clickBox");
const coreText = document.getElementById("core-text");
const prestigeBtn = document.getElementById("prestigeBtn");
const quantumCountUI = document.getElementById("quantum-count");
const prestigeMultUI = document.getElementById("prestige-multiplier");
const anomalyNode = document.getElementById("anomaly-node");
const achPop = document.getElementById("ach-notification");
const heatFill = document.getElementById("heat-fill");
const tempDisplay = document.getElementById("temp-display");
const masteryBtn = document.getElementById("masteryBtn");
const glitchPopup = document.getElementById("glitch-popup");
const fakeLog = document.getElementById("fake-log-output");
const eventTicker = document.getElementById("event-ticker");
const hackerStatusUI = document.getElementById("hacker-status");
const geoDisplayUI = document.getElementById("geo-location-display");

let lastFrameTime = performance.now();
let lastClickTime = 0;
let currentEventMultiplier = 1.0;

function formatNumber(num) {
    if (num === null || isNaN(num)) return "0";
    let absNum = Math.abs(num);
    if (absNum >= 1e12) return (num / 1e12).toFixed(1) + 'T';
    if (absNum >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (absNum >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (absNum >= 1e3) return (num / 1e3).toFixed(1) + 'k';
    return Math.floor(num).toString();
}

// INTEGRARE MODUL GEOLOCATION API & REVERSED IP FALLBACK
function initUserTracker() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                let lat = position.coords.latitude.toFixed(2);
                let lon = position.coords.longitude.toFixed(2);
                
                try {
                    // Reverse Geocoding API gratuit, fără token (OpenStreetMap Nominatim)
                    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    let data = await response.json();
                    let city = data.address.city || data.address.town || data.address.village || "Unknown Sector";
                    let country = data.address.country_code ? data.address.country_code.toUpperCase() : "NET";
                    
                    geoDisplayUI.textContent = `📍 SAFE_HOUSE: ${city}, ${country}`;
                    geoDisplayUI.classList.add("safe");
                } catch (err) {
                    // Fallback simplu în caz de eroare de rețea API
                    geoDisplayUI.textContent = `📍 SAFE_HOUSE: COORDS_[${lat}, ${lon}]`;
                    geoDisplayUI.classList.add("safe");
                }
            },
            (error) => {
                // Dacă utilizatorul dă REJECT/DENIED sau apare o eroare de rețea
                geoDisplayUI.textContent = `📍 LOCATION: PROXY_MASK_ACTIVE`;
                geoDisplayUI.classList.add("masked");
                console.log("Location access denied or timed out by user.");
            },
            { timeout: 7000 }
        );
    } else {
        geoDisplayUI.textContent = `📍 LOCATION: UNTRACEABLE_NODE`;
        geoDisplayUI.classList.add("masked");
    }
}

function updateUI() {
    balanceUI.textContent = formatNumber(game.coins);
    
    let currentCps = game.cps * game.prestigeMult * game.boostMultiplier * currentEventMultiplier;
    cpsUI.textContent = `GENERATION: ${formatNumber(currentCps)} BC/s`;
    
    let currentCpc = game.clickValue * game.prestigeMult;
    cpcUI.textContent = `CLICK_VAL: ${formatNumber(currentCpc)} BC`;

    for (let key in game.upgrades) {
        let itemUI = document.getElementById(`upgrade-${key}`);
        let costUI = document.getElementById(`${key}-cost`);
        let countUI = document.getElementById(key === 'quantum' ? 'quantum-count-item' : `${key}-count`);
        
        if(costUI) costUI.textContent = formatNumber(game.upgrades[key].cost);
        if(countUI) countUI.textContent = game.upgrades[key].count;
        
        if (game.coins < game.upgrades[key].cost) {
            if(itemUI) itemUI.classList.add("disabled");
        } else {
            if(itemUI) itemUI.classList.remove("disabled");
        }
    }

    quantumCountUI.textContent = formatNumber(game.quantum);
    prestigeMultUI.textContent = game.prestigeMult.toFixed(1);
    
    let pendingQuantum = Math.floor(Math.sqrt(game.coins / 35000));
    if (pendingQuantum > 0) {
        prestigeBtn.classList.remove("locked");
        prestigeBtn.textContent = `REBOOT (+${formatNumber(pendingQuantum)})`;
    } else {
        prestigeBtn.classList.add("locked");
        prestigeBtn.textContent = `REBOOT CORE`;
    }

    let totalUnlocked = 0;
    let scalar = game.masteryLevel;
    
    document.getElementById("ach-hundredClicks").setAttribute("title", `${15 * scalar} clicks`);
    document.getElementById("ach-thousandClicks").setAttribute("title", `${50 * scalar} clicks`);
    document.getElementById("ach-tenBots").setAttribute("title", `${3 * scalar} botnets`);
    document.getElementById("ach-gpuArmy").setAttribute("title", `${2 * scalar} GPUs`);
    document.getElementById("ach-clickMaster").setAttribute("title", `${5 * scalar} injectors`);
    document.getElementById("ach-rich").setAttribute("title", `${formatNumber(500 * scalar)} BC held`);
    document.getElementById("ach-millionaire").setAttribute("title", `${formatNumber(25000 * scalar)} BC held`);

    for (let achKey in game.achievements) {
        let card = document.getElementById(`ach-${achKey}`);
        if (card) {
            if (game.achievements[achKey]) {
                card.classList.remove("locked");
                totalUnlocked++;
            } else { 
                card.classList.add("locked"); 
            }
        }
    }

    masteryBtn.textContent = `▲ ACTIVATE MASTERY PROTOCOL (LVL ${game.masteryLevel}) ▲`;
    // ACUM SUNT DOAR 15 REALIZĂRI (fără jackpot data)
    if (totalUnlocked === 15) {
        masteryBtn.classList.remove("hidden");
    } else {
        masteryBtn.classList.add("hidden");
    }

    updateHeatGauge();
}

function updateHeatGauge() {
    tempDisplay.textContent = Math.floor(game.heat);
    if(heatFill) heatFill.style.width = `${game.heat}%`;
}

function fluidLoop(timestamp) {
    let deltaTime = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    if (game.isOverheated) {
        game.heat -= 180.0 * deltaTime; 
        if (game.heat <= 0) {
            game.heat = 0;
            game.isOverheated = false;
            document.body.classList.remove("core-overheated");
            coreText.textContent = "EXTRACT";
            updateUI();
            saveGame();
        }
        updateHeatGauge();
    } else if (game.heat > 0) {
        if (timestamp - lastClickTime > 120) {
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
    if (Math.random() < 0.006 && glitchPopup.classList.contains("hidden") && !cheatActive) {
        glitchPopup.classList.remove("hidden");
    }
}, 1000);

function triggerRandomEvent() {
    if (game.isOverheated || cheatActive) return;
    let roll = Math.random();
    if (roll < 0.50) {
        currentEventMultiplier = 1.5;
        eventTicker.textContent = "// BOOST (+50% CPS)";
        setTimeout(resetEvent, 10000);
    } else {
        currentEventMultiplier = 0.4;
        eventTicker.textContent = "// MITIGATION (-60% CPS)";
        setTimeout(resetEvent, 8000);
    }
    updateUI();
}
function resetEvent() {
    currentEventMultiplier = 1.0;
    eventTicker.textContent = "// STATUS: NOMINAL";
    updateUI();
}
setInterval(triggerRandomEvent, 45000);

const fakeResponses = {
    "fake-flush": "Cache flushed.", "fake-bypass": "Ports bypassed.",
    "fake-overclock": "N2 injected.", "fake-proxy": "Tunnels masked."
};

function handleFakeInteraction(id) {
    game.falseButtonSpam++;
    fakeLog.textContent = `// ${fakeResponses[id]}`;
    if (game.falseButtonSpam >= 25) triggerAchievement("buttonSpam");
    saveGame();
}

document.getElementById("fake-flush").addEventListener("click", () => handleFakeInteraction("fake-flush"));
document.getElementById("fake-bypass").addEventListener("click", () => handleFakeInteraction("fake-bypass"));
document.getElementById("fake-overclock").addEventListener("click", () => handleFakeInteraction("fake-overclock"));
document.getElementById("fake-proxy").addEventListener("click", () => handleFakeInteraction("fake-proxy"));
document.getElementById("close-popup-btn").addEventListener("click", () => glitchPopup.classList.add("hidden"));

function checkAchievementConditions() {
    if (cheatActive) return; 
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

    const titleEl = document.getElementById("ach-pop-title");
    titleEl.textContent = `${achDetails[key].icon} ${achDetails[key].title}`;
    achPop.classList.remove("hidden");
    setTimeout(() => achPop.classList.add("hidden"), 3000);
}

function saveGame() {
    if (cheatActive) return; 
    localStorage.setItem("cyberNetOS_v10_Save", JSON.stringify(game));
}

function createFloatingNumber(x, y, text, type) {
    const el = document.createElement("div");
    el.className = `floating-number ${type || ''}`;
    el.style.left = `${x}px`; el.style.top = `${y}px`;
    el.textContent = text;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 450);
}

function executeCoreExtraction(clientX, clientY) {
    if (game.isOverheated) return;
    lastClickTime = performance.now();

    if (!cheatActive) {
        game.heat += 5.8; 
        if (game.heat >= 100) {
            game.heat = 100; game.isOverheated = true;
            document.body.classList.add("core-overheated");
            coreText.textContent = "OVERHEAT";
            triggerAchievement("firstOverheat");
            game.overheatCycles++;
            if (game.overheatCycles >= 3) triggerAchievement("survival");
            updateUI(); return;
        }
    }

    game.totalClicks++;
    checkAchievementConditions();

    let currentCpcBase = game.clickValue * game.prestigeMult;
    let earned = currentCpcBase;
    let type = '';

    if (game.activeBoost === 'blue') {
        earned = (currentCpcBase * 12) + ((game.cps * game.prestigeMult) * 0.06);
        type = 'glitch-float';
    } else if (Math.random() < 0.12) {
        earned = currentCpcBase * 6; type = 'critic';
    }

    if (game.activeBoost === 'red') earned *= 4;
    game.coins += earned;
    
    createFloatingNumber(clientX || window.innerWidth / 2, clientY || window.innerHeight / 2 - 100, `+${formatNumber(earned)}`, type);
    updateUI();
}

clickBox.addEventListener("mousedown", (e) => {
    isMouseDownOnCore = true;
    lastCoreClickEvent = e;
    executeCoreExtraction(e.clientX, e.clientY);

    if (cheatActive) {
        if (autoClickInterval) clearInterval(autoClickInterval);
        autoClickInterval = setInterval(() => {
            if (isMouseDownOnCore) {
                executeCoreExtraction(lastCoreClickEvent.clientX, lastCoreClickEvent.clientY);
            }
        }, 50);
    }
});

window.addEventListener("mouseup", () => {
    isMouseDownOnCore = false;
    if (autoClickInterval) {
        clearInterval(autoClickInterval);
        autoClickInterval = null;
    }
});

clickBox.addEventListener("click", (e) => {
    e.preventDefault();
});

function buyUpgrade(type) {
    const up = game.upgrades[type];
    if (game.coins >= up.cost) {
        game.coins -= up.cost; up.count++;
        up.cost = Math.floor(up.cost * 1.22);
        if (type === 'click') game.clickValue += up.income;
        recalculateCPS(); checkAchievementConditions(); updateUI(); saveGame();
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
        game.coins = 0; game.cps = 0;
        game.clickValue = 1.0 + (game.upgrades.click.count * game.upgrades.click.income); 
        game.heat = 0; game.isOverheated = false;
        recalculateCostsAndIncomes(); triggerAchievement("firstPrestige"); recalculateCPS(); updateUI(); saveGame();
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
    recalculateCostsAndIncomes(); recalculateCPS(); updateUI(); saveGame();
    alert(`PROFIL ACTUALIZAT: Ai avansat la Mastery Level ${game.masteryLevel}!`);
});

let currentAnomalyType = 'red';
function spawnAnomaly() {
    if (game.activeBoost || game.isOverheated || cheatActive) return;
    let rand = Math.random();
    // Doar anomalie Roșie sau Albastră acum
    currentAnomalyType = rand < 0.50 ? 'red' : 'blue';
    anomalyNode.style.backgroundColor = currentAnomalyType === 'red' ? '#ff0044' : '#0099ff';
    anomalyNode.style.boxShadow = `0 0 15px ${anomalyNode.style.backgroundColor}`;
    anomalyNode.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
    anomalyNode.style.top = `${Math.random() * (window.innerHeight - 40)}px`;
    anomalyNode.classList.remove("hidden");
    setTimeout(() => anomalyNode.classList.add("hidden"), 6500);
}

anomalyNode.addEventListener("click", () => {
    anomalyNode.classList.add("hidden");
    if (currentAnomalyType === 'red') {
        triggerAchievement("anomalyRed"); game.activeBoost = 'red'; game.boostMultiplier = 4;
        document.body.classList.add("boost-red"); setTimeout(endBoost, 15000);
    } else if (currentAnomalyType === 'blue') {
        triggerAchievement("anomalyBlue"); game.activeBoost = 'blue';
        document.body.classList.add("boost-blue"); setTimeout(endBoost, 12000);
    }
    updateUI();
});

function endBoost() {
    game.activeBoost = null; game.boostMultiplier = 1;
    document.body.classList.remove("boost-red", "boost-blue"); updateUI();
}
setInterval(spawnAnomaly, 38000);

// CORE HACK SYSTEM (FIXED SPACE DETECTION)
window.addEventListener("keydown", (e) => {
    let keyPressed = e.key.toLowerCase();
    if (e.code === "Space" || keyPressed === "space") {
        keyPressed = " ";
    }
    if (keyPressed.length > 1) return; 

    inputBuffer += keyPressed;
    if (inputBuffer.length > 30) inputBuffer = inputBuffer.slice(-30);

    if (inputBuffer.endsWith("i am the hacker")) {
        inputBuffer = ""; 
        cheatActive = !cheatActive; 

        if (cheatActive) {
            document.body.classList.add("hacker-mode-active");
            hackerStatusUI.textContent = "BYPASS: ON";
            hackerStatusUI.classList.add("hacker-tagged");
            fakeLog.textContent = "// MATRIX COMPROMISED: OVERHEAT DEACTIVATED. AUTOCLICK READY.";
            
            for (let achKey in game.achievements) {
                game.achievements[achKey] = true;
            }
            
            game.heat = 0;
            game.isOverheated = false;
            document.body.classList.remove("core-overheated");
            coreText.textContent = "EXTRACT";
            
            updateUI();
        } else {
            document.body.classList.remove("hacker-mode-active");
            hackerStatusUI.textContent = "SEC: MAX";
            hackerStatusUI.classList.remove("hacker-tagged");
            fakeLog.textContent = "// ENCRYPTION RESTORED. PROTOCOLS ONLINE.";
            
            if (autoClickInterval) {
                clearInterval(autoClickInterval);
                autoClickInterval = null;
            }

            if (localStorage.getItem("cyberNetOS_v10_Save")) {
                game = JSON.parse(localStorage.getItem("cyberNetOS_v10_Save"));
            } else {
                for (let achKey in game.achievements) game.achievements[achKey] = false;
            }
            
            updateUI();
        }
    }
});

document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Clear profile cache?")) { localStorage.removeItem("cyberNetOS_v10_Save"); location.reload(); }
});

// Pornim tracking-ul la deschiderea jocului
recalculateCPS(); 
updateUI();
initUserTracker();
