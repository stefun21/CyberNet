// Starea inițială a jocului
let gameData = {
    coins: 0,
    cps: 0, // Coins Per Second
    upgrades: {
        bot: { count: 0, cost: 15, income: 1 },
        gpu: { count: 0, cost: 100, income: 10 },
        mainframe: { count: 0, cost: 1100, income: 80 }
    }
};

// Încărcăm datele salvate dacă ele există în browser
if (localStorage.getItem("cryptoClickerSave")) {
    gameData = JSON.parse(localStorage.getItem("cryptoClickerSave"));
}

// Elemente DOM
const balanceDisplay = document.getElementById("balance");
const cpsDisplay = document.getElementById("cps-display");
const clickBox = document.getElementById("clickBox");

// Actualizează textul de pe ecran cu datele curente
function updateUI() {
    balanceDisplay.textContent = Math.floor(gameData.coins);
    cpsDisplay.textContent = `Generare automată: ${gameData.cps} BC/secundă`;

    // Actualizăm fiecare card de upgrade în parte
    for (let key in gameData.upgrades) {
        document.getElementById(`${key}-cost`).textContent = Math.floor(gameData.upgrades[key].cost);
        const countDiv = document.getElementById(`${key}-count`);
        countDiv.textContent = gameData.upgrades[key].count;
        
        // Dacă avem cel puțin un upgrade cumpărat, îi colorăm numărul albastru
        if (gameData.upgrades[key].count > 0) {
            document.getElementById(`upgrade-${key}`).classList.add("active-count");
        } else {
            document.getElementById(`upgrade-${key}`).classList.remove("active-count");
        }
    }
}

// Salvare automată în LocalStorage
function saveGame() {
    localStorage.setItem("cryptoClickerSave", JSON.stringify(gameData));
}

// Mecanica de Click Manual (+1 monedă per click)
clickBox.addEventListener("click", () => {
    gameData.coins += 1;
    updateUI();
});

// Mecanica de cumpărare a upgrade-urilor
function buyUpgrade(type) {
    const upgrade = gameData.upgrades[type];
    
    // Verificăm dacă jucătorul are suficienți bani
    if (gameData.coins >= upgrade.cost) {
        gameData.coins -= upgrade.cost; // Scădem banii
        upgrade.count++; // Creștem numărul de dețineri
        
        // Formula clasică din idle games: prețul crește cu 15% (factor de 1.15)
        upgrade.cost = Math.floor(upgrade.cost * 1.15); 
        
        // Recalculăm producția totală pe secundă (CPS)
        recalculateCPS();
        updateUI();
        saveGame();
    } else {
        alert("Nu ai destui ByteCoins!");
    }
}

function recalculateCPS() {
    let totalCPS = 0;
    for (let key in gameData.upgrades) {
        const upgrade = gameData.upgrades[key];
        totalCPS += upgrade.count * upgrade.income;
    }
    gameData.cps = totalCPS;
}

// Legăm click-urile pe carduri de funcția de cumpărare
document.getElementById("upgrade-bot").addEventListener("click", () => buyUpgrade("bot"));
document.getElementById("upgrade-gpu").addEventListener("click", () => buyUpgrade("gpu"));
document.getElementById("upgrade-mainframe").addEventListener("click", () => buyUpgrade("mainframe"));

// LOOP-UL PRINCIPAL AL JOCULUI: Rulează în fiecare secundă (1000 milisecunde)
setInterval(() => {
    gameData.coins += gameData.cps; // Adăugăm producția automată
    updateUI();
    saveGame(); // Salvează progresul la fiecare secundă
}, 1000);

// Butonul de Reset
document.getElementById("resetBtn").addEventListener("click", () => {
    if (confirm("Ești sigur că vrei să ștergi tot progresul?")) {
        localStorage.removeItem("cryptoClickerSave");
        location.reload(); // Reîncărcăm pagina pentru a reveni la starea inițială
    }
});

// Pornirea inițială a interfeței
recalculateCPS();
updateUI();
