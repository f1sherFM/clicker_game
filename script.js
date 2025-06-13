let score = 0;
let clickMultiplier = 1;
let prestigeMultiplier = 1;
let energy = 100;
let maxEnergy = 100;
let totalCps = 0;
let autoclickerMultiplier = 1;
let playerLevel = 1;
let exp = 0;
let expNeeded = 60; // Начальный порог для уровня 2
let expMultiplier = 1; // Множитель опыта
let totalClicks = 0;
let totalScoreEarned = 0;
let itemsBought = 0;
let playTime = 0; // в секундах

let autoclickers = [
    { name: "Мини-бот", cost: 15, baseCps: 0.1, owned: 0, totalCps: 0 },
    { name: "Средний бот", cost: 100, baseCps: 1, owned: 0, totalCps: 0 },
    { name: "Мега-бот", cost: 1000, baseCps: 10, owned: 0, totalCps: 0 }
];

let clickUpgrades = [
    { name: "Усиленный клик", cost: 50, multiplier: 2 },
    { name: "Мега-клик", cost: 200, multiplier: 5 },
    { name: "Гипер-клик", cost: 1000, multiplier: 10 }
];

let passiveUpgrades = [
    { name: "Эффективность ботов +10%", cost: 300, cpsBoost: 1.1 },
    { name: "Эффективность ботов +25%", cost: 1500, cpsBoost: 1.25 },
    { name: "Супер эффективность", cost: 5000, cpsBoost: 1.5 }
];

let items = [
    { name: "Энергетик", cost: 250, bonusEnergy: 30 },
    { name: "Кристалл опыта", cost: 500, expBoost: 1.2 }
];

const scoreDisplay = document.getElementById('score');
const cpsDisplay = document.getElementById('cps');
const energyDisplay = document.getElementById('energy');
const clickButton = document.getElementById('click-button');
const prestigeButton = document.getElementById('prestige-button');
const shopContainer = document.getElementById('shop');
const statsContainer = document.getElementById('stats-sidebar');
const levelDisplay = document.getElementById('level');
const expDisplay = document.getElementById('exp');
const expBar = document.getElementById('exp-bar');

function saveProgress() {
    try {
        const gameState = {
            score, clickMultiplier, prestigeMultiplier, energy, maxEnergy,
            totalCps, autoclickerMultiplier, playerLevel, exp, expNeeded,
            expMultiplier, totalClicks, totalScoreEarned, itemsBought, playTime,
            autoclickers, clickUpgrades, passiveUpgrades, items
        };
        localStorage.setItem('clickerGameState', JSON.stringify(gameState));
    } catch (e) {
        console.error('Ошибка сохранения прогресса:', e);
        alert('Не удалось сохранить прогресс. Проверьте настройки браузера.');
    }
}

function loadProgress() {
    try {
        const savedState = localStorage.getItem('clickerGameState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            score = Number(gameState.score) || 0;
            clickMultiplier = Number(gameState.clickMultiplier) || 1;
            prestigeMultiplier = Number(gameState.prestigeMultiplier) || 1;
            energy = Number(gameState.energy) || 100;
            maxEnergy = Number(gameState.maxEnergy) || 100;
            totalCps = Number(gameState.totalCps) || 0;
            autoclickerMultiplier = Number(gameState.autoclickerMultiplier) || 1;
            playerLevel = Number(gameState.playerLevel) || 1;
            exp = Number(gameState.exp) || 0;
            expNeeded = Number(gameState.expNeeded) || 60;
            expMultiplier = Number(gameState.expMultiplier) || 1;
            totalClicks = Number(gameState.totalClicks) || 0;
            totalScoreEarned = Number(gameState.totalScoreEarned) || 0;
            itemsBought = Number(gameState.itemsBought) || 0;
            playTime = Number(gameState.playTime) || 0;
            autoclickers = gameState.autoclickers || [
                { name: "Мини-бот", cost: 15, baseCps: 0.1, owned: 0, totalCps: 0 },
                { name: "Средний бот", cost: 100, baseCps: 1, owned: 0, totalCps: 0 },
                { name: "Мега-бот", cost: 1000, baseCps: 10, owned: 0, totalCps: 0 }
            ];
            clickUpgrades = gameState.clickUpgrades || [
                { name: "Усиленный клик", cost: 50, multiplier: 2 },
                { name: "Мега-клик", cost: 200, multiplier: 5 },
                { name: "Гипер-клик", cost: 1000, multiplier: 10 }
            ];
            passiveUpgrades = gameState.passiveUpgrades || [
                { name: "Эффективность ботов +10%", cost: 300, cpsBoost: 1.1 },
                { name: "Эффективность ботов +25%", cost: 1500, cpsBoost: 1.25 },
                { name: "Супер эффективность", cost: 5000, cpsBoost: 1.5 }
            ];
            items = gameState.items || [
                { name: "Энергетик", cost: 250, bonusEnergy: 30 },
                { name: "Кристалл опыта", cost: 500, expBoost: 1.2 }
            ];
        }
    } catch (e) {
        console.error('Ошибка загрузки прогресса:', e);
        alert('Не удалось загрузить прогресс. Начинаем новую игру.');
    }
}

function grantLevelReward() {
    const rewards = [
        {
            name: "Очки",
            apply: () => {
                const points = Math.floor(Math.random() * 151) + 50; // 50–200
                score += points;
                totalScoreEarned += points;
                return `+${points} очков`;
            }
        },
        {
            name: "Энергия",
            apply: () => {
                energy = Math.min(maxEnergy, energy + 20);
                return "+20 энергии";
            }
        },
        {
            name: "Буст CPS",
            apply: () => {
                const originalMultiplier = autoclickerMultiplier;
                autoclickerMultiplier *= 1.1;
                autoclickers.forEach(ac => {
                    ac.totalCps = ac.owned * ac.baseCps * autoclickerMultiplier;
                });
                totalCps = autoclickers.reduce((sum, ac) => sum + ac.totalCps, 0);
                setTimeout(() => {
                    autoclickerMultiplier = originalMultiplier;
                    autoclickers.forEach(ac => {
                        ac.totalCps = ac.owned * ac.baseCps * autoclickerMultiplier;
                    });
                    totalCps = autoclickers.reduce((sum, ac) => sum + ac.totalCps, 0);
                    updateScore();
                }, 30000); // 30 секунд
                return "+10% к CPS на 30 секунд";
            }
        }
    ];
    const reward = rewards[Math.floor(Math.random() * rewards.length)];
    const rewardText = reward.apply();
    return rewardText;
}

function checkLevelUp() {
    while (exp >= expNeeded) {
        exp -= expNeeded;
        playerLevel += 1;
        prestigeMultiplier *= 1.1; // +10% к множителю престижа
        expNeeded = Math.round(expNeeded * 1.75); // Новый порог: x1.75
        const rewardText = grantLevelReward();
        alert(`Поздравляем! Вы достигли уровня ${playerLevel}! Бонус: +10% к множителю престижа. Награда: ${rewardText}.`);
    }
}

function handleClick() {
    if (energy >= 1) {
        const pointsEarned = clickMultiplier * prestigeMultiplier;
        score += pointsEarned;
        totalScoreEarned += pointsEarned;
        energy -= 1;
        totalClicks += 1;
        exp += 1 * expMultiplier; // +1 EXP с учётом множителя
        checkLevelUp();
        updateScore();
        saveProgress();
    } else {
        alert("Недостаточно энергии!");
    }
}

function buyAutoclicker(index) {
    const autoclicker = autoclickers[index];
    if (score >= autoclicker.cost) {
        score -= autoclicker.cost;
        autoclicker.owned += 1;
        autoclicker.totalCps = autoclicker.owned * autoclicker.baseCps * autoclickerMultiplier;
        autoclicker.cost = Math.round(autoclicker.cost * 1.2);
        totalCps = autoclickers.reduce((sum, ac) => sum + ac.totalCps, 0);
        itemsBought += 1;
        updateScore();
        saveProgress();
    } else {
        alert(`Недостаточно очков! Нужно ${autoclicker.cost}.`);
    }
}

function buyClickUpgrade(index) {
    const upgrade = clickUpgrades[index];
    if (score >= upgrade.cost) {
        score -= upgrade.cost;
        clickMultiplier = upgrade.multiplier;
        clickUpgrades.splice(index, 1);
        itemsBought += 1;
        updateScore();
        saveProgress();
    } else {
        alert(`Недостаточно очков! Нужно ${upgrade.cost}.`);
    }
}

function buyPassiveUpgrade(index) {
    const upgrade = passiveUpgrades[index];
    if (score >= upgrade.cost) {
        score -= upgrade.cost;
        autoclickerMultiplier *= upgrade.cpsBoost;
        autoclickers.forEach(ac => {
            ac.totalCps = ac.owned * ac.baseCps * autoclickerMultiplier;
        });
        totalCps = autoclickers.reduce((sum, ac) => sum + ac.totalCps, 0);
        passiveUpgrades.splice(index, 1);
        itemsBought += 1;
        updateScore();
        saveProgress();
    } else {
        alert(`Недостаточно очков! Нужно ${upgrade.cost}.`);
    }
}

function buyItem(index) {
    const item = items[index];
    if (score >= item.cost) {
        score -= item.cost;
        if (item.bonusEnergy) {
            energy = Math.min(maxEnergy, energy + item.bonusEnergy);
        }
        if (item.expBoost) {
            expMultiplier *= item.expBoost;
            items.splice(index, 1); // Удаляем после покупки
        }
        itemsBought += 1;
        updateScore();
        saveProgress();
    } else {
        alert(`Недостаточно очков! Нужно ${item.cost}.`);
    }
}

function prestige() {
    if (score >= 10000) {
        score = 0;
        clickMultiplier = 1;
        autoclickerMultiplier = 1;
        autoclickers.forEach(ac => {
            ac.owned = 0;
            ac.totalCps = 0;
            ac.cost = [15, 100, 1000][autoclickers.indexOf(ac)];
        });
        clickUpgrades = [
            { name: "Усиленный клик", cost: 50, multiplier: 2 },
            { name: "Мега-клик", cost: 200, multiplier: 5 },
            { name: "Гипер-клик", cost: 1000, multiplier: 10 }
        ];
        passiveUpgrades = [
            { name: "Эффективность ботов +10%", cost: 300, cpsBoost: 1.1 },
            { name: "Эффективность ботов +25%", cost: 1500, cpsBoost: 1.25 },
            { name: "Супер эффективность", cost: 5000, cpsBoost: 1.5 }
        ];
        totalCps = 0;
        items = [
            { name: "Энергетик", cost: 250, bonusEnergy: 30 },
            { name: "Кристалл опыта", cost: 500, expBoost: 1.2 }
        ];
        prestigeMultiplier += 0.1;
        updateScore();
        saveProgress();
    } else {
        alert("Нужно 10,000 очков для престижа!");
    }
}

function updateShop() {
    shopContainer.innerHTML = "<h2>Магазин</h2>";
    shopContainer.innerHTML += "<h3>Автокликеры</h3>";
    autoclickers.forEach((autoclicker, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shop-item';
        itemDiv.innerHTML = `
            <h4>${autoclicker.name}</h4>
            <p>Очков/сек: ${autoclicker.totalCps.toFixed(1)}</p>
            <p>Стоимость: ${autoclicker.cost} очков</p>
            <p>Куплено: ${autoclicker.owned}</p>
        `;
        const buyButton = document.createElement('button');
        buyButton.className = 'shop-btn';
        buyButton.textContent = 'Купить';
        buyButton.addEventListener('click', () => buyAutoclicker(index));
        itemDiv.appendChild(buyButton);
        shopContainer.appendChild(itemDiv);
    });

    if (clickUpgrades.length > 0) {
        shopContainer.innerHTML += "<h3>Улучшения кликов</h3>";
        clickUpgrades.forEach((upgrade, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';
            itemDiv.innerHTML = `
                <h4>${upgrade.name}</h4>
                <p>Множитель: x${upgrade.multiplier}</p>
                <p>Стоимость: ${upgrade.cost} очков</p>
            `;
            const buyButton = document.createElement('button');
            buyButton.className = 'shop-btn';
            buyButton.textContent = 'Купить';
            buyButton.addEventListener('click', () => buyClickUpgrade(index));
            itemDiv.appendChild(buyButton);
            shopContainer.appendChild(itemDiv);
        });
    }

    if (passiveUpgrades.length > 0) {
        shopContainer.innerHTML += "<h3>Пассивные улучшения</h3>";
        passiveUpgrades.forEach((upgrade, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';
            itemDiv.innerHTML = `
                <h4>${upgrade.name}</h4>
                <p>Эффект: x${upgrade.cpsBoost}</p>
                <p>Стоимость: ${upgrade.cost} очков</p>
            `;
            const buyButton = document.createElement('button');
            buyButton.className = 'shop-btn';
            buyButton.textContent = 'Купить';
            buyButton.addEventListener('click', () => buyPassiveUpgrade(index));
            itemDiv.appendChild(buyButton);
            itemDiv.appendChild(buyButton);
            shopContainer.appendChild(itemDiv);
        });
    }

    if (items.length > 0) {
        shopContainer.innerHTML += "<h3>Уникальные предметы</h3>";
        items.forEach((item, index) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'shop-item';
            itemDiv.innerHTML = `
                <h4>${item.name}</h4>
                <p>Эффект: ${item.bonusEnergy ? `+${item.bonusEnergy} энергии` : `+20% к опыту`}</p>
                <p>Стоимость: ${item.cost} очков</p>
            `;
            const buyButton = document.createElement('button');
            buyButton.className = 'shop-btn';
            buyButton.textContent = 'Купить';
            buyButton.addEventListener('click', () => buyItem(index));
            itemDiv.appendChild(buyButton);
            shopContainer.appendChild(itemDiv);
        });
    }
}

function updateStatsAndLevel() {
    if (statsContainer) {
        statsContainer.innerHTML = `
            <h2>Статистика</h2>
            <p>Кликов: ${totalClicks}</p>
            <p>Очков заработано: ${Math.floor(totalScoreEarned)}</p>
            <p>Предметов куплено: ${itemsBought}</p>
            <p>Время игры: ${Math.floor(playTime / 60)} минут</p>
        `;
    }
    if (levelDisplay && expDisplay && expBar) {
        levelDisplay.textContent = `Уровень: ${playerLevel}`;
        expDisplay.textContent = `Опыт: ${Math.floor(exp)} / ${expNeeded}`;
        expBar.style.width = `${(exp / expNeeded) * 100}%`;
    }
}

function updateScore() {
    if (scoreDisplay && cpsDisplay && energyDisplay && prestigeButton) {
        scoreDisplay.textContent = `Очки: ${Math.floor(score)}`;
        cpsDisplay.textContent = `Очков/сек: ${(totalCps * prestigeMultiplier).toFixed(1)}`;
        energyDisplay.textContent = `Энергия: ${Math.floor(energy)}/${maxEnergy}`;
        prestigeButton.textContent = `Престиж (x${(prestigeMultiplier + 0.1).toFixed(1)}) за 10,000 очков`;
        updateShop();
        updateStatsAndLevel();
    }
}

setInterval(() => {
    energy = Math.min(maxEnergy, energy + 0.2);
    const pointsEarned = (totalCps * prestigeMultiplier) / 10;
    score += pointsEarned;
    totalScoreEarned += pointsEarned;
    exp += (totalCps / 10) * expMultiplier; // EXP с учётом множителя
    checkLevelUp();
    playTime += 0.1;
    updateScore();
}, 100);

window.onload = () => {
    loadProgress();
    if (clickButton) {
        clickButton.removeEventListener('click', handleClick);
        clickButton.addEventListener('click', handleClick);
    }
    if (prestigeButton) {
        prestigeButton.addEventListener('click', prestige);
    }
    updateScore();
};