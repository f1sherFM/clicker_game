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
let energyRegenRate = 2; // Скорость восстановления энергии
let lastSavedTime = Date.now(); // Время последнего сохранения
let offlineScoreTotal = 0; // Всего оффлайн-очков
let offlineExpTotal = 0; // Всего оффлайн-EXP
let totalClicks = 0;
let totalScoreEarned = 0;
let itemsBought = 0;
let playTime = 0; // в секундах
let isMobile = false;

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
const notificationsContainer = document.getElementById('notifications');
const resetModal = document.getElementById('reset-modal');
const confirmReset = document.getElementById('confirm-reset');
const cancelReset = document.getElementById('cancel-reset');
const mobileToggle = document.getElementById('mobile-toggle');

function showNotification(message) {
    if (notificationsContainer) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        notificationsContainer.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    } else {
        console.warn('Контейнер уведомлений не найден, использую alert.');
        alert(message);
    }
}

function showResetModal() {
    if (resetModal) {
        resetModal.style.display = 'flex';
    }
}

function hideResetModal() {
    if (resetModal) {
        resetModal.style.display = 'none';
    }
}

function saveProgress() {
    try {
        const gameState = {
            score, clickMultiplier, prestigeMultiplier, energy, maxEnergy,
            totalCps, autoclickerMultiplier, playerLevel, exp, expNeeded,
            expMultiplier, energyRegenRate, lastSavedTime, offlineScoreTotal,
            offlineExpTotal, totalClicks, totalScoreEarned, itemsBought, playTime,
            autoclickers, clickUpgrades, passiveUpgrades, items, isMobile
        };
        localStorage.setItem('clickerGameState', JSON.stringify(gameState));
        lastSavedTime = Date.now();
    } catch (e) {
        console.error('Ошибка сохранения прогресса:', e);
        showNotification('Не удалось сохранить прогресс. Проверьте настройки браузера.');
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
            energyRegenRate = Number(gameState.energyRegenRate) || 2;
            lastSavedTime = Number(gameState.lastSavedTime) || Date.now();
            offlineScoreTotal = Number(gameState.offlineScoreTotal) || 0;
            offlineExpTotal = Number(gameState.offlineExpTotal) || 0;
            totalClicks = Number(gameState.totalClicks) || 0;
            totalScoreEarned = Number(gameState.totalScoreEarned) || 0;
            itemsBought = Number(gameState.itemsBought) || 0;
            playTime = Number(gameState.playTime) || 0;
            isMobile = Boolean(gameState.isMobile) || false;
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
            // Оффлайн-прогресс
            if (gameState.lastSavedTime) {
                const maxOfflineTime = 7200 + playerLevel * 600; // 2 часа + 10 мин/уровень
                const offlineTime = Math.min((Date.now() - gameState.lastSavedTime) / 1000, maxOfflineTime);
                if (offlineTime > 0) {
                    const offlineScore = totalCps * prestigeMultiplier * offlineTime;
                    const offlineExp = (totalCps / 10) * expMultiplier * offlineTime;
                    const offlineEnergy = Math.min(maxEnergy, energy + energyRegenRate * offlineTime) - energy;
                    score += offlineScore;
                    totalScoreEarned += offlineScore;
                    offlineScoreTotal += offlineScore;
                    exp += offlineExp;
                    offlineExpTotal += offlineExp;
                    energy += offlineEnergy;
                    checkLevelUp();
                    if (offlineScore > 0 || offlineExp > 0 || offlineEnergy > 0) {
                        showNotification(`Пока вас не было, вы заработали ${Math.floor(offlineScore)} очков, ${Math.floor(offlineExp)} EXP и ${Math.floor(offlineEnergy)} энергии!`);
                    }
                }
            }
        }
    } catch (e) {
        console.error('Ошибка загрузки прогресса:', e);
        showNotification('Не удалось загрузить прогресс. Начинаем новую игру.');
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
        showNotification(`Поздравляем! Вы достигли уровня ${playerLevel}! Бонус: +10% к множителю престижа. Награда: ${rewardText}.`);
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
        showNotification("Недостаточно энергии!");
    }
}

function buyAutoclicker(index) {
    console.log('Попытка покупки автокликера', index, 'Текущий score:', score);
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
        showNotification(`Куплен ${autoclicker.name}! Теперь вы зарабатываете ${autoclicker.totalCps.toFixed(1)} очков/сек.`);
    } else {
        showNotification(`Недостаточно очков! Нужно ${autoclicker.cost}.`);
    }
}

function buyClickUpgrade(index) {
    console.log('Попытка покупки улучшения клика', index, 'Текущий score:', score);
    const upgrade = clickUpgrades[index];
    if (score >= upgrade.cost) {
        score -= upgrade.cost;
        clickMultiplier = upgrade.multiplier;
        clickUpgrades.splice(index, 1);
        itemsBought += 1;
        updateScore();
        saveProgress();
        showNotification(`Куплено улучшение ${upgrade.name}! Теперь множитель кликов: x${clickMultiplier}.`);
    } else {
        showNotification(`Недостаточно очков! Нужно ${upgrade.cost}.`);
    }
}

function buyPassiveUpgrade(index) {
    console.log('Попытка покупки пассивного улучшения', index, 'Текущий score:', score);
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
        showNotification(`Куплено улучшение ${upgrade.name}! Теперь общий CPS: ${(totalCps * prestigeMultiplier).toFixed(1)}.`);
    } else {
        showNotification(`Недостаточно очков! Нужно ${upgrade.cost}.`);
    }
}

function buyItem(index) {
    console.log('Попытка покупки предмета', index, 'Текущий score:', score);
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
        showNotification(`Куплен ${item.name}! Энергия: ${Math.floor(energy)}/${maxEnergy}, множитель опыта: x${expMultiplier.toFixed(1)}.`);
    } else {
        showNotification(`Недостаточно очков! Нужно ${item.cost}.`);
    }
}

function prestige() {
    if (score >= 10000) {
        score = 0;
        clickMultiplier = 1;
        autoclickerMultiplier = 1;
        energy = 100;
        energyRegenRate = 2;
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
        showNotification("Нужно 10,000 очков для престижа!");
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
            <p>Очков/сек: ${(autoclicker.baseCps * autoclicker.owned * autoclickerMultiplier).toFixed(1)}</p>
            <p>Стоимость: ${autoclicker.cost} очков</p>
            <p>Куплено: ${autoclicker.owned}</p>
            <button class="shop-btn" data-type="autoclicker" data-index="${index}">Купить</button>
        `;
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
                <button class="shop-btn" data-type="clickupgrade" data-index="${index}">Купить</button>
            `;
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
                <button class="shop-btn" data-type="passiveupgrade" data-index="${index}">Купить</button>
            `;
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
                <button class="shop-btn" data-type="item" data-index="${index}">Купить</button>
            `;
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
            <p>Оффлайн-очки: ${Math.floor(offlineScoreTotal)}</p>
            <p>Оффлайн-EXP: ${Math.floor(offlineExpTotal)}</p>
            <p>Предметов куплено: ${itemsBought}</p>
            <p>Время игры: ${Math.floor(playTime / 60)} минут</p>
            <button class="reset-btn" id="reset-button">Сбросить прогресс</button>
        `;
        const resetButton = document.getElementById('reset-button');
        if (resetButton) {
            resetButton.removeEventListener('click', showResetModal);
            resetButton.addEventListener('click', showResetModal);
        }
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
    document.body.className = isMobile ? 'mobile-mode' : '';
}

shopContainer.addEventListener('click', (e) => {
    const button = e.target.closest('.shop-btn');
    if (!button) return;

    const type = button.getAttribute('data-type');
    const index = parseInt(button.getAttribute('data-index'), 10);

    console.log(`Клик по кнопке: ${type}, индекс: ${index}, score: ${score}`);

    if (type === 'autoclicker') buyAutoclicker(index);
    else if (type === 'clickupgrade') buyClickUpgrade(index);
    else if (type === 'passiveupgrade') buyPassiveUpgrade(index);
    else if (type === 'item') buyItem(index);
});

function toggleMobileMode() {
    isMobile = !isMobile;
    updateScore();
    saveProgress();
    showNotification(`Режим ${isMobile ? 'телефона' : 'десктопа'} активирован!`);
}

setInterval(() => {
    energy = Math.min(maxEnergy, energy + energyRegenRate / 10);
    const pointsEarned = (totalCps * prestigeMultiplier) / 10;
    score += pointsEarned;
    totalScoreEarned += pointsEarned;
    exp += (totalCps / 10) * expMultiplier;
    checkLevelUp();
    playTime += 0.1;
    updateScore();
    saveProgress();
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
    if (confirmReset) {
        confirmReset.addEventListener('click', () => {
            localStorage.removeItem('clickerGameState');
            location.reload();
        });
    }
    if (cancelReset) {
        cancelReset.addEventListener('click', hideResetModal);
    }
    if (resetModal) {
        resetModal.addEventListener('click', (e) => {
            if (e.target === resetModal) {
                hideResetModal();
            }
        });
    }
    if (mobileToggle) {
        mobileToggle.addEventListener('click', toggleMobileMode);
    }
    updateScore();
};