// Константы и настройки
const SAVE_VERSION = 2; // Увеличиваем версию из-за новых полей
const SAVE_KEY = 'clickerProState';
const AUTOSAVE_INTERVAL = 5 * 60 * 1000; // 5 минут

// Игровые переменные
let gameState = {
    score: 0,
    clickMultiplier: 1,
    prestigeMultiplier: 1,
    energy: 100,
    maxEnergy: 100,
    totalCps: 0,
    autoclickerMultiplier: 1,
    playerLevel: 1,
    exp: 0,
    expNeeded: 60,
    expMultiplier: 1,
    energyRegenRate: 2,
    lastSavedTime: Date.now(),
    offlineScoreTotal: 0,
    offlineExpTotal: 0,
    totalClicks: 0,
    totalScoreEarned: 0,
    itemsBought: 0,
    playTime: 0,
    activeBoosts: [],
    autoclickers: [
        { name: "Мини-бот", cost: 30, baseCps: 0.1, owned: 0, totalCps: 0 },
        { name: "Средний бот", cost: 250, baseCps: 1, owned: 0, totalCps: 0 },
        { name: "Мега-бот", cost: 2000, baseCps: 10, owned: 0, totalCps: 0 },
        { name: "Гига-бот", cost: 10000, baseCps: 50, owned: 0, totalCps: 0 },
        { name: "Легендарный бот", cost: 50000, baseCps: 200, owned: 0, totalCps: 0 }
    ],
    clickUpgrades: [
        { name: "Усиленный клик", cost: 150, multiplier: 2 },
        { name: "Мега-клик", cost: 750, multiplier: 5 },
        { name: "Гипер-клик", cost: 3000, multiplier: 10 },
        { name: "Квантовый клик", cost: 15000, multiplier: 25 }
    ],
    passiveUpgrades: [
        { name: "Эффективность ботов +10%", cost: 1000, cpsBoost: 1.1 },
        { name: "Эффективность ботов +25%", cost: 5000, cpsBoost: 1.25 },
        { name: "Супер эффективность", cost: 20000, cpsBoost: 1.5 },
        { name: "Квантовая оптимизация", cost: 75000, cpsBoost: 2.0 }
    ],
    items: [
        { name: "Энергетик", cost: 500, bonusEnergy: 30 },
        { name: "Кристалл опыта", cost: 1500, expBoost: 1.2 },
        { name: "Буст CPS x2", cost: 2000, duration: 30, cpsMultiplier: 2, type: "boost" },
        { name: "+50 энергии", cost: 5000, bonusMaxEnergy: 50 }
    ]
};

// DOM элементы
const elements = {
    scoreDisplay: document.getElementById('score'),
    cpsDisplay: document.getElementById('cps'),
    energyDisplay: document.getElementById('energy'),
    clickButton: document.getElementById('click-button'),
    prestigeButton: document.getElementById('prestige-button'),
    shopContainer: document.getElementById('shop'),
    statsContainer: document.getElementById('stats-sidebar'),
    levelDisplay: document.getElementById('level'),
    expDisplay: document.getElementById('exp'),
    expBar: document.getElementById('exp-bar'),
    notificationsContainer: document.getElementById('notifications'),
    resetModal: document.getElementById('reset-modal'),
    confirmReset: document.getElementById('confirm-reset'),
    cancelReset: document.getElementById('cancel-reset'),
    navButtons: document.querySelectorAll('.nav-btn')
};

// ======================
// Игровые функции
// ======================
function showNotification(message) {
    if (!elements.notificationsContainer) {
        console.warn('Контейнер уведомлений не найден!');
        return;
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    elements.notificationsContainer.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3500);
}

// ======================
// Система сохранения
// ======================
function saveProgress(showNotification = false) {
    try {
        gameState.lastSavedTime = Date.now();
        localStorage.setItem(SAVE_KEY, JSON.stringify({
            version: SAVE_VERSION,
            ...gameState
        }));
        if (showNotification && typeof showNotification === 'function') {
            showNotification('Прогресс сохранён!');
        }
        console.log('Прогресс успешно сохранён:', gameState);
    } catch (e) {
        console.error('Ошибка сохранения:', e);
        if (typeof showNotification === 'function') {
            showNotification('Ошибка сохранения!');
        }
    }
}

function loadProgress() {
    try {
        const savedData = localStorage.getItem(SAVE_KEY);
        if (!savedData) return false;

        const parsed = JSON.parse(savedData);
        if (!parsed || parsed.version !== SAVE_VERSION) return false;

        Object.assign(gameState, parsed);

        // Оффлайн прогресс
        const offlineTime = Math.min(
            (Date.now() - gameState.lastSavedTime) / 1000,
            7200 + gameState.playerLevel * 600
        );
        
        if (offlineTime > 0) {
            const offlineScore = gameState.totalCps * gameState.prestigeMultiplier * offlineTime;
            const offlineExp = (gameState.totalCps / 10) * gameState.expMultiplier * offlineTime;
            const offlineEnergy = Math.min(
                gameState.maxEnergy,
                gameState.energy + gameState.energyRegenRate * offlineTime
            ) - gameState.energy;
            
            gameState.score += offlineScore;
            gameState.totalScoreEarned += offlineScore;
            gameState.offlineScoreTotal += offlineScore;
            gameState.exp += offlineExp;
            gameState.offlineExpTotal += offlineExp;
            gameState.energy += offlineEnergy;
            
            if (typeof showNotification === 'function') {
                showNotification(`Оффлайн: +${Math.floor(offlineScore)} очков, +${Math.floor(offlineExp)} EXP, +${Math.floor(offlineEnergy)} энергии`);
            }
        }

        return true;
    } catch (e) {
        console.error('Ошибка загрузки:', e);
        return false;
    }
}

function handleClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    elements.clickButton.classList.add('active');
    setTimeout(() => elements.clickButton.classList.remove('active'), 100);
    
    if (gameState.energy >= 1) {
        const pointsEarned = gameState.clickMultiplier * gameState.prestigeMultiplier;
        gameState.score += pointsEarned;
        gameState.totalScoreEarned += pointsEarned;
        gameState.energy -= 1;
        gameState.totalClicks += 1;
        gameState.expbios += 1 * gameState.expMultiplier;
        checkLevelUp();
        updateScore();
    } else {
        if (typeof showNotification === 'function') {
            showNotification("Недостаточно энергии!");
        }
    }
}

function buyAutoclicker(index) {
    const ac = gameState.autoclickers[index];
    if (gameState.score >= ac.cost) {
        gameState.score -= ac.cost;
        ac.owned += 1;
        ac.totalCps = ac.owned * ac.baseCps * gameState.autoclickerMultiplier;
        ac.cost = Math.round(ac.cost * 1.15);
        gameState.totalCps = gameState.autoclickers.reduce((sum, a) => sum + a.totalCps, 0);
        gameState.itemsBought += 1;
        updateScore();
        if (typeof showNotification === 'function') {
            showNotification(`Куплен ${ac.name}! (+${ac.baseCps} CPS)`);
        }
    } else {
        if (typeof showNotification === 'function') {
            showNotification(`Нужно ещё ${Math.ceil(ac.cost - gameState.score)} очков`);
        }
    }
}

function buyUpgrade(type, index) {
    let upgrade;
    if (type === 'click') {
        upgrade = gameState.clickUpgrades[index];
        if (gameState.score >= upgrade.cost) {
            gameState.score -= upgrade.cost;
            gameState.clickMultiplier = upgrade.multiplier;
            gameState.clickUpgrades.splice(index, 1);
            gameState.itemsBought += 1;
            updateScore();
            if (typeof showNotification === 'function') {
                showNotification(`Улучшено: ${upgrade.name}!`);
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification(`Нужно ещё ${Math.ceil(upgrade.cost - gameState.score)} очков`);
            }
        }
    } else if (type === 'passive') {
        upgrade = gameState.passiveUpgrades[index];
        if (gameState.score >= upgrade.cost) {
            gameState.score -= upgrade.cost;
            gameState.autoclickerMultiplier *= upgrade.cpsBoost;
            gameState.autoclickers.forEach(a => {
                a.totalCps = a.owned * a.baseCps * gameState.autoclickerMultiplier;
            });
            gameState.totalCps = gameState.autoclickers.reduce((sum, a) => sum + a.totalCps, 0);
            gameState.passiveUpgrades.splice(index, 1);
            gameState.itemsBought += 1;
            updateScore();
            if (typeof showNotification === 'function') {
                showNotification(`Улучшено: ${upgrade.name}!`);
            }
        } else {
            if (typeof showNotification === 'function') {
                showNotification(`Нужно ещё ${Math.ceil(upgrade.cost - gameState.score)} очков`);
            }
        }
    }
}

function activateBoost(boost) {
    const originalMultiplier = gameState.autoclickerMultiplier;
    gameState.autoclickerMultiplier *= boost.cpsMultiplier;
    gameState.activeBoosts.push({
        type: "cps",
        endTime: Date.now() + boost.duration * 1000
    });

    // Обновляем CPS
    gameState.autoclickers.forEach(a => {
        a.totalCps = a.owned * a.baseCps * gameState.autoclickerMultiplier;
    });
    gameState.totalCps = gameState.autoclickers.reduce((sum, a) => sum + a.totalCps, 0);

    // Визуальный эффект
    document.querySelectorAll('.shop-btn').forEach(btn => {
        if (btn.textContent.includes("Буст")) {
            btn.classList.add('boost-active');
        }
    });

    setTimeout(() => {
        gameState.autoclickerMultiplier = originalMultiplier;
        gameState.activeBoosts = gameState.activeBoosts.filter(b => b.type !== "cps");
        gameState.autoclickers.forEach(a => {
            a.totalCps = a.owned * a.baseCps * gameState.autoclickerMultiplier;
        });
        gameState.totalCps = gameState.autoclickers.reduce((sum, a) => sum + a.totalCps, 0);
        updateScore();
        
        document.querySelectorAll('.shop-btn').forEach(btn => {
            btn.classList.remove('boost-active');
        });
    }, boost.duration * 1000);
}

function buyItem(index) {
    const item = gameState.items[index];
    if (gameState.score >= item.cost) {
        gameState.score -= item.cost;
        if (item.bonusEnergy) {
            gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + item.bonusEnergy);
            if (typeof showNotification === 'function') {
                showNotification(`Использован ${item.name}! +${item.bonusEnergy} энергии`);
            }
        }
        if (item.expBoost) {
            gameState.expMultiplier *= item.expBoost;
            gameState.items.splice(index, 1);
            if (typeof showNotification === 'function') {
                showNotification(`Использован ${item.name}! Множитель опыта: x${gameState.expMultiplier.toFixed(1)}`);
            }
        }
        if (item.cpsMultiplier) {
            activateBoost(item);
            if (typeof showNotification === 'function') {
                showNotification(`Активирован ${item.name}! CPS x${item.cpsMultiplier} на ${item.duration} сек`);
            }
        }
        if (item.bonusMaxEnergy) {
            gameState.maxEnergy += item.bonusMaxEnergy;
            gameState.items.splice(index, 1);
            if (typeof showNotification === 'function') {
                showNotification(`Использован ${item.name}! Макс. энергия: ${gameState.maxEnergy}`);
            }
        }
        gameState.itemsBought += 1;
        updateScore();
    } else {
        if (typeof showNotification === 'function') {
            showNotification(`Нужно ещё ${Math.ceil(item.cost - gameState.score)} очков`);
        }
    }
}

function prestige() {
    const requiredScore = 10000 * Math.pow(1.5, gameState.prestigeMultiplier - 1);
    
    if (gameState.score >= requiredScore) {
        const oldMultiplier = gameState.prestigeMultiplier;
        const prestigeBonus = 0.1 + (gameState.playerLevel * 0.01);
        
        gameState = {
            ...gameState,
            score: 0,
            clickMultiplier: 1,
            autoclickerMultiplier: 1,
            energy: 100,
            energyRegenRate: 2,
            totalCps: 0,
            autoclickers: gameState.autoclickers.map(a => ({
                ...a,
                owned: 0,
                totalCps: 0,
                cost: Math.round(a.cost * 0.9)
            })),
            clickUpgrades: [
                { name: "Усиленный клик", cost: 150, multiplier: 2 },
                { name: "Мега-клик", cost: 750, multiplier: 5 },
                { name: "Гипер-клик", cost: 3000, multiplier: 10 },
                { name: "Квантовый клик", cost: 15000, multiplier: 25 }
            ],
            passiveUpgrades: [
                { name: "Эффективность ботов +10%", cost: 1000, cpsBoost: 1.1 },
                { name: "Эффективность ботов +25%", cost: 5000, cpsBoost: 1.25 },
                { name: "Супер эффективность", cost: 20000, cpsBoost: 1.5 },
                { name: "Квантовая оптимизация", cost: 75000, cpsBoost: 2.0 }
            ],
            items: [
                { name: "Энергетик", cost: 500, bonusEnergy: 30 },
                { name: "Кристалл опыта", cost: 1500, expBoost: 1.2 },
                { name: "Буст CPS x2", cost: 2000, duration: 30, cpsMultiplier: 2, type: "boost" },
                { name: "+50 энергии", cost: 5000, bonusMaxEnergy: 50 }
            ],
            prestigeMultiplier: gameState.prestigeMultiplier + prestigeBonus,
            playerLevel: 1,
            exp: 0,
            expNeeded: 60,
            activeBoosts: []
        };
        
        updateScore();
        if (typeof showNotification === 'function') {
            showNotification(`Престиж ${Math.floor(oldMultiplier)}! Множитель: ${oldMultiplier.toFixed(1)} → ${gameState.prestigeMultiplier.toFixed(1)}`);
        }
    } else {
        if (typeof showNotification === 'function') {
            showNotification(`Нужно ${Math.floor(requiredScore)} очков (ещё ${Math.floor(requiredScore - gameState.score)})`);
        }
    }
}

// ======================
// Вспомогательные функции
// ======================
function grantLevelReward() {
    const rewards = [
        {
            apply: () => {
                const points = Math.floor(Math.random() * 151) + 50;
                gameState.score += points;
                gameState.totalScoreEarned += points;
                return `+${points} очков`;
            }
        },
        {
            apply: () => {
                gameState.energy = Math.min(gameState.maxEnergy, gameState.energy + 20);
                return "+20 энергии";
            }
        },
        {
            apply: () => {
                const original = gameState.autoclickerMultiplier;
                gameState.autoclickerMultiplier *= 1.1;
                gameState.autoclickers.forEach(a => {
                    a.totalCps = a.owned * a.baseCps * gameState.autoclickerMultiplier;
                });
                gameState.totalCps = gameState.autoclickers.reduce((sum, a) => sum + a.totalCps, 0);
                
                setTimeout(() => {
                    gameState.autoclickerMultiplier = original;
                    gameState.autoclickers.forEach(a => {
                        a.totalCps = a.owned * a.baseCps * gameState.autoclickerMultiplier;
                    });
                    gameState.totalCps = gameState.autoclickers.reduce((sum, a) => sum + a.totalCps, 0);
                    updateScore();
                }, 30000);
                
                return "+10% CPS на 30 сек";
            }
        }
    ];
    
    return rewards[Math.floor(Math.random() * rewards.length)].apply();
}

function checkLevelUp() {
    while (gameState.exp >= gameState.expNeeded) {
        gameState.exp -= gameState.expNeeded;
        gameState.playerLevel += 1;
        gameState.prestigeMultiplier *= 1.1;
        gameState.expNeeded = Math.round(gameState.expNeeded * 1.75);
        const rewardText = grantLevelReward();
        if (typeof showNotification === 'function') {
            showNotification(`Уровень ${gameState.playerLevel}! +10% множитель. Награда: ${rewardText}`);
        }
    }
}

function updateShop() {
    if (!elements.shopContainer) return;
    
    elements.shopContainer.innerHTML = `
        <h2>Магазин</h2>
        <h3>Автокликеры</h3>
        ${gameState.autoclickers.map((ac, i) => `
            <div class="shop-item">
                <h4>${ac.name}</h4>
                <p>CPS: ${(ac.baseCps * gameState.autoclickerMultiplier).toFixed(1)}</p>
                <p>Стоимость: ${ac.cost}</p>
                <p>Куплено: ${ac.owned}</p>
                <button class="shop-btn" data-type="autoclicker" data-index="${i}">Купить</button>
            </div>
        `).join('')}
        
        ${gameState.clickUpgrades.length > 0 ? `
            <h3>Улучшения кликов</h3>
            ${gameState.clickUpgrades.map((up, i) => `
                <div class="shop-item">
                    <h4>${up.name}</h4>
                    <p>Множитель: x${up.multiplier}</p>
                    <p>Стоимость: ${up.cost}</p>
                    <button class="shop-btn" data-type="click" data-index="${i}">Купить</button>
                </div>
            `).join('')}
        ` : ''}
        
        ${gameState.passiveUpgrades.length > 0 ? `
            <h3>Пассивные улучшения</h3>
            ${gameState.passiveUpgrades.map((up, i) => `
                <div class="shop-item">
                    <h4>${up.name}</h4>
                    <p>Буст: x${up.cpsBoost}</p>
                    <p>Стоимость: ${up.cost}</p>
                    <button class="shop-btn" data-type="passive" data-index="${i}">Купить</button>
                </div>
            `).join('')}
        ` : ''}
        
        ${gameState.items.length > 0 ? `
            <h3>Предметы</h3>
            ${gameState.items.map((item, i) => `
                <div class="shop-item">
                    <h4>${item.name}</h4>
                    <p>Эффект: ${item.bonusEnergy ? `+${item.bonusEnergy} энергии` : 
                      item.expBoost ? `+20% к опыту` : 
                      item.cpsMultiplier ? `CPS x${item.cpsMultiplier} на ${item.duration} сек` : 
                      `+${item.bonusMaxEnergy} макс. энергии`}</p>
                    <p>Стоимость: ${item.cost}</p>
                    <button class="shop-btn ${item.type === 'boost' ? 'boost' : ''}" 
                            data-type="item" data-index="${i}">Купить</button>
                </div>
            `).join('')}
        ` : ''}
    `;
}

function updateStatsAndLevel() {
    if (elements.statsContainer) {
        const timeToNextLevel = (gameState.expNeeded - gameState.exp) / (gameState.totalCps * gameState.expMultiplier / 10);
        const activeBoostsText = gameState.activeBoosts.length > 0 ? 
            `Активные бусты: ${gameState.activeBoosts.length}` : "";
        
        elements.statsContainer.innerHTML = `
            <h2>Статистика</h2>
            <p>Кликов: ${gameState.totalClicks}</p>
            <p>Всего очков: ${Math.floor(gameState.totalScoreEarned)}</p>
            <p>Оффлайн очки: ${Math.floor(gameState.offlineScoreTotal)}</p>
            <p>Оффлайн EXP: ${Math.floor(gameState.offlineExpTotal)}</p>
            <p>Предметов куплено: ${gameState.itemsBought}</p>
            <p>Время игры: ${Math.floor(gameState.playTime / 60)} мин</p>
            <p>Текущий CPS: ${(gameState.totalCps * gameState.prestigeMultiplier).toFixed(1)}</p>
            <p>Время до повышения уровня: ${timeToNextLevel > 0 ? timeToNextLevel.toFixed(1) + " сек" : "Макс. уровень"}</p>
            ${activeBoostsText}
            <canvas id="statsChart" width="300" height="150"></canvas>
            <button class="reset-btn" id="reset-button">Сбросить прогресс</button>
            <button class="save-btn" id="save-button">Сохранить</button>
        `;

        // Отрисовка графика
        if (typeof Chart !== 'undefined') {
            const ctx = document.getElementById('statsChart').getContext('2d');
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: Array(10).fill(0).map((_, i) => `${i * 10} сек`),
                    datasets: [{
                        label: 'Рост очков',
                        data: Array(10).fill(0).map((_, i) => i * gameState.totalCps * 10),
                        borderColor: '#4caf50',
                        tension: 0.1
                    }]
                },
                options: { responsive: false }
            });
        }
        
        // Добавляем обработчики для кнопок "Сбросить" и "Сохранить"
        const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const resetButton = document.getElementById('reset-button');
        const saveButton = document.getElementById('save-button');

        if (resetButton) {
            if (isTouchDevice) {
                resetButton.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    showResetModal();
                }, { passive: false });
            } else {
                resetButton.addEventListener('mousedown', showResetModal);
            }
        }

        if (saveButton) {
            if (isTouchDevice) {
                saveButton.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    saveProgress(true);
                }, { passive: false });
            } else {
                saveButton.addEventListener('mousedown', () => saveProgress(true));
            }
        }
    }
    
    if (elements.levelDisplay && elements.expDisplay && elements.expBar) {
        elements.levelDisplay.textContent = `Уровень: ${gameState.playerLevel}`;
        elements.expDisplay.textContent = `EXP: ${Math.floor(gameState.exp)}/${gameState.expNeeded}`;
        elements.expBar.style.width = `${(gameState.exp / gameState.expNeeded) * 100}%`;
    }
}

function updateScore() {
    if (elements.scoreDisplay && elements.cpsDisplay && elements.energyDisplay && elements.prestigeButton) {
        elements.scoreDisplay.textContent = `Очки: ${Math.floor(gameState.score)}`;
        elements.cpsDisplay.textContent = `CPS: ${(gameState.totalCps * gameState.prestigeMultiplier).toFixed(1)}`;
        elements.energyDisplay.textContent = `Энергия: ${Math.floor(gameState.energy)}/${gameState.maxEnergy}`;
        const requiredScore = 10000 * Math.pow(1.5, gameState.prestigeMultiplier - 1);
        elements.prestigeButton.textContent = `Престиж (x${(gameState.prestigeMultiplier + 0.1).toFixed(1)}) за ${Math.floor(requiredScore)}`;
        updateShop();
        updateStatsAndLevel();
    }
}

function handleShopInteraction(e) {
    const button = e.target.closest('.shop-btn');
    if (!button) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), 100);
    
    const type = button.dataset.type;
    const index = parseInt(button.dataset.index);
    
    switch (type) {
        case 'autoclicker': buyAutoclicker(index); break;
        case 'click': buyUpgrade('click', index); break;
        case 'passive': buyUpgrade('passive', index); break;
        case 'item': buyItem(index); break;
    }
}

function switchSection(sectionId) {
    document.querySelectorAll('.section').forEach(section => {
        section.classList.toggle('active', section.id === sectionId);
    });
    
    elements.navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.section === sectionId);
    });
}

function showResetModal() {
    if (elements.resetModal) {
        elements.resetModal.style.display = 'flex';
    }
}

function hideResetModal() {
    if (elements.resetModal) {
        elements.resetModal.style.display = 'none';
    }
}

function handleReset() {
    if (confirm("Вы уверены, что хотите сбросить прогресс? Все данные будут потеряны!")) {
        console.log('Сбрасываем прогресс...');
        localStorage.removeItem(SAVE_KEY);
        hideResetModal(); // Закрываем модальное окно перед перезагрузкой
        location.reload();
    }
}

// ======================
// Инициализация игры
// ======================
function setupEventListeners() {
    // Проверяем, поддерживает ли устройство сенсорные события
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Обработчики для кнопки клика
    if (isTouchDevice) {
        elements.clickButton?.addEventListener('touchstart', handleClick, { passive: false });
    } else {
        elements.clickButton?.addEventListener('mousedown', handleClick);
    }

    // Обработчики для кнопки престижа
    if (isTouchDevice) {
        elements.prestigeButton?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            prestige();
        }, { passive: false });
    } else {
        elements.prestigeButton?.addEventListener('mousedown', prestige);
    }

    // Обработчики для навигационных кнопок
    elements.navButtons.forEach(btn => {
        if (isTouchDevice) {
            btn.addEventListener('touchstart', (e) => {
                e.preventDefault();
                switchSection(btn.dataset.section);
            }, { passive: false });
        } else {
            btn.addEventListener('mousedown', () => switchSection(btn.dataset.section));
        }
    });

    // Обработчики для магазина
    if (isTouchDevice) {
        elements.shopContainer?.addEventListener('touchstart', handleShopInteraction, { passive: false });
    } else {
        elements.shopContainer?.addEventListener('mousedown', handleShopInteraction);
    }

    // Обработчики для модального окна сброса
    if (isTouchDevice) {
        elements.confirmReset?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            handleReset();
        }, { passive: false });
        elements.cancelReset?.addEventListener('touchstart', (e) => {
            e.preventDefault();
            hideResetModal();
        }, { passive: false });
    } else {
        elements.confirmReset?.addEventListener('mousedown', handleReset);
        elements.cancelReset?.addEventListener('mousedown', hideResetModal);
    }

    elements.resetModal?.addEventListener('mousedown', (e) => {
        if (e.target === elements.resetModal) hideResetModal();
    });
}

let lastUpdate = 0;
let passiveUpdateAccumulator = 0;

function gameLoop(timestamp) {
    const deltaTime = timestamp - (lastUpdate || timestamp);
    lastUpdate = timestamp;
    
    passiveUpdateAccumulator += deltaTime;
    while (passiveUpdateAccumulator >= 100) {
        gameState.energy = Math.min(
            gameState.maxEnergy, 
            gameState.energy + gameState.energyRegenRate / 10
        );
        gameState.score += (gameState.totalCps * gameState.prestigeMultiplier) / 10;
        gameState.totalScoreEarned += (gameState.totalCps * gameState.prestigeMultiplier) / 10;
        gameState.exp += (gameState.totalCps / 10) * gameState.expMultiplier;
        gameState.playTime += 0.1;
        passiveUpdateAccumulator -= 100;
    }
    
    checkLevelUp();
    updateScore();
    requestAnimationFrame(gameLoop);
}

window.onload = () => {
    loadProgress();
    setupEventListeners();
    switchSection('game-section');
    updateScore();
    
    requestAnimationFrame(gameLoop);
    setInterval(saveProgress, AUTOSAVE_INTERVAL);
    window.addEventListener('beforeunload', () => saveProgress());
};