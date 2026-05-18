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
    // EXTINDERE STATE PENTRU COMPARTIMENTUL BLACK MARKET
    bmUpgrades: {
        icebreaker: { lvl: 0, cost: 1 },
        sniffer: { lvl: 0, cost: 2 },
        miner: { lvl: 0, cost: 3 },
        rootkit: { lvl: 0, cost: 5 }
    },
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
let isOverclockCliActive = false; 
let userSavedCity = "Unknown Sector";
let userSavedCountry = "NET";

if (localStorage.getItem("cyberNetOS_v11_Save")) {
    game = JSON.parse(localStorage.getItem("cyberNetOS_v11_Save"));
    game.activeBoost = null;
    game.boostMultiplier = 1;
    game.isOverheated = false;
    if (!game.bmUpgrades) {
        game.bmUpgrades = { icebreaker: { lvl: 0, cost: 1 }, sniffer: { lvl: 0, cost: 2 }, miner: { lvl: 0, cost: 3 }, rootkit: { lvl: 0, cost: 5 } };
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
const eventTicker = document.getElementById("event-ticker");
const hackerStatusUI = document.getElementById("hacker-status");
const geoDisplayUI = document.getElementById("geo-location-display");
const cliConsole = document.getElementById("cli-console");
const termInput = document.getElementById("term-input");

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

function printCli(text, type = "") {
    const el = document.createElement("div");
    el.className = `cli-log ${type}`;
    el.textContent = `> ${text}`;
    cliConsole.appendChild(el);
    cliConsole.scrollTop = cliConsole.scrollHeight;
}

// 🌐 TRACING GEOLOCAȚIE
function initUserTracker() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                let lat = position.coords.latitude.toFixed(2);
                let lon = position.coords.longitude.toFixed(2);
                try {
                    let response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
                    let data = await response.json();
                    userSavedCity = data.address.city || data.address.town || data.address.village || "Unknown Sector";
                    userSavedCountry = data.address.country_code ? data.address.country_code.toUpperCase() : "NET";
                    geoDisplayUI.textContent = `📍 SAFE_HOUSE: ${userSavedCity}, ${userSavedCountry}`;
                    geoDisplayUI.classList.add("safe");
                } catch (err) {
                    geoDisplayUI.textContent = `📍 SAFE_HOUSE: COORDS_[${lat}, ${lon}]`;
                    geoDisplayUI.classList.add("safe");
                }
            },
            (error) => {
                geoDisplayUI.textContent = `📍 LOCATION: PROXY_MASK_ACTIVE`;
                geoDisplayUI.classList.add("masked");
            },
            { timeout: 7000 }
        );
    } else {
        geoDisplayUI.textContent = `📍 LOCATION: UNTRACEABLE_NODE`;
        geoDisplayUI.classList.add("masked");
    }
}

// INTERFAȚĂ INTELIGENTĂ CLI INTERACTIVĂ
termInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        let rawInput = termInput.value.trim();
        termInput.value = "";
        if (!rawInput) return;

        printCli(`guest@cybernet_os: ${rawInput}`);
        executeCliCommand(rawInput.toLowerCase());
    }
});

function executeCliCommand(cmd) {
    let args = cmd.split(" ");
    let baseCmd = args[0];

    switch(baseCmd) {
        case "help":
            printCli("Available core commands:", "system");
            printCli("  help                   - Shows this protocol directory.");
            printCli("  clear                  - Flushes visible CLI log logs.");
            printCli("  status                 - Fetches operational data arrays.");
            printCli("  location               - Pings physical geolocation node.");
            printCli("  overclock <on/off>     - Toggle hyper-clocking engine states.");
            printCli("  scan network           - [Req Rootkit] Searches vulnerable BC lines.");
            printCli("  inject crypto          - [Req Rootkit] Force injector breach (Coold: 30s).");
            break;
        case "clear":
            cliConsole.innerHTML = "";
            break;
        case "status":
            printCli("SYSTEM MATRIX INTEGRITY ANALYSIS:", "system");
            printCli(`  Balance Ledger : ${formatNumber(game.coins)} BitCoins`);
            printCli(`  Core Clock Rate: ${formatNumber(game.cps * game.prestigeMult)} BC/sec`);
            printCli(`  Terminal Master Level: ${game.masteryLevel}`);
            printCli(`  Quantum Vault  : ${game.quantum} QC accumulated`);
            break;
        case "location":
            if (geoDisplayUI.classList.contains("safe")) {
                printCli(`SAFEHOUSE VERIFIED: Hacking shielded from ${userSavedCity.toUpperCase()}, ${userSavedCountry}. Telemetry secure.`, "succ");
            } else {
                printCli("WARNING: Location is masked via proxy tunnel PROXY_MASK_ACTIVE. Nodes untraceable.", "err");
            }
            break;
        case "overclock":
            if (args[1] === "on") {
                isOverclockCliActive = true;
                printCli("CORE COUPLING ALTERED: Overclock active! Production +100%, Core heat rising!", "succ");
            } else if (args[1] === "off") {
                isOverclockCliActive = false;
                printCli("Overclock suspended. Thermals cooling down.", "system");
            } else {
                printCli("SYNTAX EXCEPTION. Use: overclock on / overclock off", "err");
            }
            break;
        case "scan":
            if (args[1] === "network") {
                if (game.bmUpgrades.rootkit.lvl < 1) {
                    printCli("SECURITY EXCEPTION: Operation requires 'Rootkit_Bypass.dll' modules installed.", "err");
                    return;
                }
                printCli("Scanning network arrays for loose connections...", "system");
                setTimeout(() => {
                    let found = Math.floor(Math.random() * 200 * game.prestigeMult) + 10;
                    game.coins += found;
                    printCli(`BREACH COMPLETED: Intercepted +${found} BC from insecure pipeline!`, "succ");
                    updateUI();
                }, 1500);
            } else {
                printCli("Unknown scanning sub-command. Try: scan network", "err");
            }
            break;
        case "inject":
            if (args[1] === "crypto") {
                if (game.bmUpgrades.rootkit.lvl < 1) {
                    printCli("SECURITY EXCEPTION: Injection pipeline locked. Requires 'Rootkit_Bypass.dll'.", "err");
                    return;
                }
                if (window.lastInjectTime && Date.now() - window.lastInjectTime < 30000) {
                    let remaining = Math.ceil((30000 - (Date.now() - window.lastInjectTime)) / 1000);
                    printCli(`PIPELINE COOLING DOWN: Anti-flood lock active. Wait ${remaining}s.`, "err");
                    return;
                }
                window.lastInjectTime = Date.now();
                let injectionYield = (game.cps * game.prestigeMult * 60) + 100;
                game.coins += injectionYield;
                printCli(`MALWARE INJECTED: Cryptographic siphon pulled +${formatNumber(injectionYield)} BC instantly!`, "succ");
                updateUI();
            } else {
                printCli("Unknown injection format. Try: inject crypto", "err");
            }
            break;
        default:
            printCli(`COMMAND NOT RECOGNIZED: '${baseCmd}'. Type 'help' for directory rules.`, "err");
    }
}

function updateUI() {
    balanceUI.textContent = formatNumber(game.coins);
    
    let overclockBonus = isOverclockCliActive ? 2.0 : 1.0;
    let currentCps = game.cps * game.prestigeMult * game.boostMultiplier * currentEventMultiplier * overclockBonus;
    cpsUI.textContent = `GENERATION: ${formatNumber(currentCps)} BC/s`;
    
    let currentCpc = game.clickValue * game.prestigeMult;
    cpcUI.textContent = `CLICK_VAL: ${formatNumber(currentCpc)} BC`;

    for (let key in game.upgrades) {
        let itemUI = document.getElementById(`upgrade-${key}`);
        let costUI = document.getElementById(`${key}-cost`);
        let countUI = document.getElementById(key === 'quantum' ? 'quantum-count-item' : `${key}-count`);
        if(costUI) costUI.textContent = formatNumber(game.upgrades[key].cost);
        if(countUI) countUI.textContent = game.upgrades[key].count;
        if (game.coins < game.upgrades[key].cost) { if(itemUI) itemUI.classList.add("disabled"); } 
        else { if(itemUI) itemUI.classList.remove("disabled"); }
    }

    // UPDATE LOGICĂ BLACK MARKET
    quantumCountUI.textContent = formatNumber(game.quantum);
    prestigeMultUI.textContent = game.prestigeMult.toFixed(1);
    
    document.getElementById("bm-ice-lvl").textContent = game.bmUpgrades.icebreaker.lvl;
    document.getElementById("bm-ice-cost").textContent = game.bmUpgrades.icebreaker.cost;
    document.getElementById("buy-icebreaker").disabled = game.quantum < game.bmUpgrades.icebreaker.cost;

    document.getElementById("bm-snif-lvl").textContent = game.bmUpgrades.sniffer.lvl;
    document.getElementById("bm-snif-cost").textContent = game.bmUpgrades.sniffer.cost;
    document.getElementById("buy-sniffer").disabled = game.quantum < game.bmUpgrades.sniffer.cost;

    document.getElementById("bm-mine-lvl").textContent = game.bmUpgrades.miner.lvl;
    document.getElementById("bm-mine-cost").textContent = game.bmUpgrades.miner.cost;
    document.getElementById("buy-miner").disabled = game.quantum < game.bmUpgrades.miner.cost;

    document.getElementById("bm-root-lvl").textContent = game.bmUpgrades.rootkit.lvl;
    document.getElementById("bm-root-cost").textContent = game.bmUpgrades.rootkit.cost;
    document.getElementById("buy-rootkit").disabled = game.quantum < game.bmUpgrades.rootkit.cost;

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
    for (let achKey in game.achievements) {
        let card = document.getElementById(`ach-${achKey}`);
        if (card && game.achievements[achKey]) { card.classList.remove("locked"); totalUnlocked++; }
    }

    masteryBtn.textContent = `▲ ACTIVATE MASTERY PROTOCOL (LVL ${game.masteryLevel}) ▲`;
    if (totalUnlocked === 15) masteryBtn.classList.remove("hidden");
    else masteryBtn.classList.add("hidden");

    updateHeatGauge();
}

// ACHIZIȚIONARE MODUL DE PE PIAȚA NEAGRĂ
function buyBlackMarket(item) {
    let up = game.bmUpgrades[item];
    if (game.quantum >= up.cost) {
        game.quantum -= up.cost;
        up.lvl++;
        up.cost = Math.floor(up.cost * 1.8) + 1;
        printCli(`BLACK MARKET DOWNLOAD SUCCESSFUL: Installed ${item}.exe patches.`, "succ");
        updateUI();
        saveGame();
    }
}

document.getElementById("buy-icebreaker").addEventListener("click", () => buyBlackMarket("icebreaker"));
document.getElementById("buy-sniffer").addEventListener("click", () => buyBlackMarket("sniffer"));
document.getElementById("buy-miner").addEventListener("click", () => buyBlackMarket("miner"));
document.getElementById("buy-rootkit").addEventListener("click", () => buyBlackMarket("rootkit"));

function updateHeatGauge() {
    tempDisplay.textContent = Math.floor(game.heat);
    if(heatFill) heatFill.style.width = `${game.heat}%`;
}

function fluidLoop(timestamp) {
    let deltaTime = (timestamp - lastFrameTime) / 1000;
    lastFrameTime = timestamp;

    // Reducere coeficient de căldură pe baza upgrade-ului Icebreaker
    let iceReduction = 1.0 + (game.bmUpgrades.icebreaker.lvl * 0.20);

    if (game.isOverheated) {
        game.heat -= 180.0 * deltaTime * iceReduction; 
        if (game.heat <= 0) {
            game.heat = 0; game.isOverheated = false;
            document.body.classList.remove("core-overheated");
            coreText.textContent = "EXTRACT";
            updateUI(); saveGame();
        }
        updateHeatGauge();
    } else {
        // Dacă modul Overclock CLI este pornit, nucleul generează căldură automat în timp secundar
        if (isOverclockCliActive) {
            game.heat += 15.0 * deltaTime;
            if (game.heat >= 100) { game.heat = 100; game.isOverheated = true; document.body.classList.add("core-overheated"); coreText.textContent = "OVERHEAT"; }
            updateHeatGauge();
        }
        if (game.heat > 0 && timestamp - lastClickTime > 120) {
            game.heat -= 200.0 * deltaTime * iceReduction;
            if (game.heat < 0) game.heat = 0;
            updateHeatGauge();
        }
    }
    requestAnimationFrame(fluidLoop);
}
requestAnimationFrame(fluidLoop);

setInterval(() => {
    let overclockBonus = isOverclockCliActive ? 2.0 : 1.0;
    let output = game.cps * game.prestigeMult * game.boostMultiplier * currentEventMultiplier * overclockBonus;
    if (output > 0) { game.coins += output; updateUI(); saveGame(); }
}, 1000);

function executeCoreExtraction(clientX, clientY) {
    if (game.isOverheated) return;
    lastClickTime = performance.now();

    if (!cheatActive) {
        // Calcul generare căldură modificată de upgrade-ul Icebreaker
        let heatFactor = 5.8 / (1.0 + (game.bmUpgrades.icebreaker.lvl * 0.15));
        game.heat += heatFactor; 
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
    
    // ANCORĂ DE SHANSA DE EXTRACȚIE QC DIN DEEPWEB MINER
    if (game.bmUpgrades.miner.lvl > 0) {
        let chance = game.bmUpgrades.miner.lvl * 0.02; // 2% pe nivel
        if (Math.random() < chance) {
            game.quantum += 1;
            printCli("DEEP_MINER DETECTED: Intercepted 1 Quantum Chip from background computing blocks!", "succ");
        }
    }

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
    isMouseDownOnCore = true; lastCoreClickEvent = e;
    executeCoreExtraction(e.clientX, e.clientY);
    if (cheatActive) {
        if (autoClickInterval) clearInterval(autoClickInterval);
        autoClickInterval = setInterval(() => { if (isMouseDownOnCore) executeCoreExtraction(lastCoreClickEvent.clientX, lastCoreClickEvent.clientY); }, 50);
    }
});

window.addEventListener("mouseup", () => { isMouseDownOnCore = false; if (autoClickInterval) { clearInterval(autoClickInterval); autoClickInterval = null; } });
clickBox.addEventListener("click", (e) => e.preventDefault());

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
    for (let key in game.upgrades) { if (key !== 'click') baseCPS += game.upgrades[key].count * game.upgrades[key].income; }
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
        printCli("HARD RESET INITIATED: Appending quantum encryption blocks.", "system");
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

function checkAchievementConditions() {
    if (cheatActive) return; let scalar = game.masteryLevel; 
    if (game.totalClicks >= 1) triggerAchievement("firstClick");
}

function triggerAchievement(key) {
    if (game.achievements[key]) return;
    game.achievements[key] = true; updateUI(); saveGame();
    const titleEl = document.getElementById("ach-pop-title");
    titleEl.textContent = `${achDetails[key].icon} ${achDetails[key].title}`;
    achPop.classList.remove("hidden"); setTimeout(() => achPop.classList.add("hidden"), 3000);
}

function saveGame() { if (!cheatActive) localStorage.setItem("cyberNetOS_v11_Save", JSON.stringify(game)); }
function createFloatingNumber(x, y, text, type) {
    const el = document.createElement("div"); el.className = `floating-number ${type || ''}`;
    el.style.left = `${x}px`; el.style.top = `${y}px`; el.textContent = text;
    document.body.appendChild(el); setTimeout(() => el.remove(), 450);
}

let currentAnomalyType = 'red';
function spawnAnomaly() {
    if (game.activeBoost || game.isOverheated || cheatActive) return;
    currentAnomalyType = Math.random() < 0.50 ? 'red' : 'blue';
    anomalyNode.style.backgroundColor = currentAnomalyType === 'red' ? '#ff0044' : '#0099ff';
    anomalyNode.style.boxShadow = `0 0 15px ${anomalyNode.style.backgroundColor}`;
    anomalyNode.style.left = `${Math.random() * (window.innerWidth - 40)}px`;
    anomalyNode.style.top = `${Math.random() * (window.innerHeight - 40)}px`;
    anomalyNode.classList.remove("hidden");

    // Timpul de expunere crește cu 2 secunde per nivel de Sniffer
    let anomalyLife = 6500 + (game.bmUpgrades.sniffer.lvl * 2000);
    setTimeout(() => anomalyNode.classList.add("hidden"), anomalyLife);
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

function endBoost() { game.activeBoost = null; game.boostMultiplier = 1; document.body.classList.remove("boost-red", "boost-blue"); updateUI(); }

// Viteza de spawn a anomaliilor crește cu 10% per nivel de Sniffer
let baseSpawnInterval = 38000;
let actualSpawnInterval = baseSpawnInterval / (1.0 + (game.bmUpgrades.sniffer.lvl * 0.10));
setInterval(spawnAnomaly, actualSpawnInterval);

// CLASIC MASTER HACK ENGINE (I AM THE HACKER)
window.addEventListener("keydown", (e) => {
    // Evităm scrierea în buffer dacă utilizatorul scrie legitim în consolă
    if (document.activeElement === termInput) return;

    let keyPressed = e.key.toLowerCase();
    if (e.code === "Space" || keyPressed === "space") keyPressed = " ";
    if (keyPressed.length > 1) return; 

    inputBuffer += keyPressed;
    if (inputBuffer.length > 30) inputBuffer = inputBuffer.slice(-30);

    if (inputBuffer.endsWith("i am the hacker")) {
        inputBuffer = ""; cheatActive = !cheatActive; 
        if (cheatActive) {
            document.body.classList.add("hacker-mode-active"); hackerStatusUI.textContent = "BYPASS: ON"; hackerStatusUI.classList.add("hacker-tagged");
            for (let achKey in game.achievements) game.achievements[achKey] = true;
            game.heat = 0; game.isOverheated = false; document.body.classList.remove("core-overheated"); coreText.textContent = "EXTRACT"; updateUI();
        } else {
            document.body.classList.remove("hacker-mode-active"); hackerStatusUI.textContent = "SEC: MAX"; hackerStatusUI.classList.remove("hacker-tagged");
            if (autoClickInterval) { clearInterval(autoClickInterval); autoClickInterval = null; }
            if (localStorage.getItem("cyberNetOS_v11_Save")) game = JSON.parse(localStorage.getItem("cyberNetOS_v11_Save"));
            updateUI();
        }
    }
});

document.getElementById("resetBtn").addEventListener("click", () => { if (confirm("Clear profile cache?")) { localStorage.removeItem("cyberNetOS_v11_Save"); location.reload(); } });

recalculateCPS(); updateUI(); initUserTracker();
