// ==================== INIT ====================
// Scroll position memory: restore on reload, start at top on fresh navigation
if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
}

window.addEventListener('load', () => {
    const navEntry = performance.getEntriesByType('navigation')[0];
    if (navEntry && navEntry.type === 'reload') {
        const scrollPos = sessionStorage.getItem('scrollPos');
        if (scrollPos) {
            window.scrollTo(0, parseInt(scrollPos));
            sessionStorage.removeItem('scrollPos');
        }
    } else {
        window.scrollTo(0, 0);
    }
});

window.addEventListener('beforeunload', () => {
    sessionStorage.setItem('scrollPos', window.scrollY);
});

AOS.init({
    duration: 700,
    easing: 'ease-out',
    once: true,
    offset: 80,
    startEvent: 'load'
});

// ==================== NAVBAR ====================
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
});

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
});

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
    });
});

// Active nav link highlighting
const sections = document.querySelectorAll('.section, .hero');
const navItems = navLinks.querySelectorAll('a');

function setActiveLink() {
    let current = '';
    sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 100) {
            current = section.getAttribute('id');
        }
    });
    navItems.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
}

window.addEventListener('scroll', setActiveLink);
setActiveLink();

// ==================== DEMO LOGIC ====================
const MAX_BRUTE_FORCE = 10_000_000;

const givenExample = {
    cards: 4,
    categories: 6,
    amounts: [600, 400, 100, 300, 500, 800],
    rates: [
        [6.0, 2.0, 3.0, 1.5, 3.0, 1.5],
        [5.0, 3.0, 2.0, 5.0, 2.0, 1.5],
        [2.0, 5.0, 4.0, 2.0, 5.0, 1.0],
        [1.5, 2.0, 2.0, 4.0, 2.0, 2.0]
    ],
    limits: [1500, 700, 2500, 3500]
};

// Adds placeholder behavior: gray text that clears on focus, restores on blur if empty
function applyPlaceholderBehavior(input, placeholderValue) {
    input.value = placeholderValue;
    input.classList.add('placeholder-mode');
    input.dataset.placeholder = placeholderValue;

    input.addEventListener('focus', () => {
        if (input.classList.contains('placeholder-mode')) {
            input.value = '';
            input.classList.remove('placeholder-mode');
        }
    });

    input.addEventListener('blur', () => {
        if (input.value === '' || input.value === input.dataset.placeholder) {
            input.value = input.dataset.placeholder;
            input.classList.add('placeholder-mode');
        }
    });

    // Remove placeholder styling as soon as user types
    input.addEventListener('input', () => {
        input.classList.remove('placeholder-mode');
    });
}

// Generate input tables
function generateTables() {
    const numCards = parseInt(document.getElementById('numCards').value);
    const numCats = parseInt(document.getElementById('numCategories').value);

    // Spending table
    let html = '<table><tr>';
    for (let i = 0; i < numCats; i++) html += `<th>Cat ${i + 1}</th>`;
    html += '</tr><tr>';
    for (let i = 0; i < numCats; i++) html += `<td><input type="number" id="amt_${i}" min="0" step="50"></td>`;
    html += '</tr></table>';
    document.getElementById('spendingTable').innerHTML = html;

    // Limits table
    html = '<table><tr>';
    for (let i = 0; i < numCards; i++) html += `<th>Card ${i + 1}</th>`;
    html += '</tr><tr>';
    for (let i = 0; i < numCards; i++) html += `<td><input type="number" id="lim_${i}" min="0" step="100"></td>`;
    html += '</tr></table>';
    document.getElementById('limitsTable').innerHTML = html;

    // Rates table
    html = '<table><tr><th></th>';
    for (let j = 0; j < numCats; j++) html += `<th>Cat ${j + 1}</th>`;
    html += '</tr>';
    for (let i = 0; i < numCards; i++) {
        html += `<tr><td><label>Card ${i + 1}</label></td>`;
        for (let j = 0; j < numCats; j++) {
            html += `<td><input type="number" id="rate_${i}_${j}" min="0" max="100" step="0.5"></td>`;
        }
        html += '</tr>';
    }
    html += '</table>';
    document.getElementById('ratesTable').innerHTML = html;

    document.getElementById('resultsContainer').style.display = 'none';
}

function getInputValue(el) {
    return parseFloat(el.value) || 0;
}

function readInputs() {
    const numCards = parseInt(document.getElementById('numCards').value);
    const numCats = parseInt(document.getElementById('numCategories').value);

    const amounts = [];
    for (let i = 0; i < numCats; i++) {
        amounts.push(getInputValue(document.getElementById(`amt_${i}`)));
    }

    const limits = [];
    for (let i = 0; i < numCards; i++) {
        limits.push(getInputValue(document.getElementById(`lim_${i}`)));
    }

    const rates = [];
    for (let i = 0; i < numCards; i++) {
        rates[i] = [];
        for (let j = 0; j < numCats; j++) {
            rates[i][j] = getInputValue(document.getElementById(`rate_${i}_${j}`));
        }
    }

    return { numCards, numCats, amounts, limits, rates };
}

// ==================== BRUTE FORCE ====================
function bruteForce(numCards, numCats, amounts, limits, rates) {
    const totalAssignments = Math.pow(numCards, numCats);

    if (totalAssignments > MAX_BRUTE_FORCE) {
        return { skipped: true, total: totalAssignments };
    }

    let bestCashback = -1;
    let bestAssignment = null;

    for (let i = 0; i < totalAssignments; i++) {
        // Decode assignment
        const assignment = [];
        let temp = i;
        for (let j = numCats - 1; j >= 0; j--) {
            assignment[j] = temp % numCards;
            temp = Math.floor(temp / numCards);
        }

        // Check limits
        const cardSpend = new Array(numCards).fill(0);
        let valid = true;
        for (let j = 0; j < numCats; j++) {
            cardSpend[assignment[j]] += amounts[j];
        }
        for (let c = 0; c < numCards; c++) {
            if (cardSpend[c] > limits[c]) { valid = false; break; }
        }
        if (!valid) continue;

        // Calculate cashback
        let cashback = 0;
        for (let j = 0; j < numCats; j++) {
            cashback += amounts[j] * (rates[assignment[j]][j] / 100);
        }

        if (cashback > bestCashback) {
            bestCashback = cashback;
            bestAssignment = [...assignment];
        }
    }

    if (!bestAssignment) {
        return { error: true };
    }

    return { assignment: bestAssignment, cashback: bestCashback };
}

// ==================== GREEDY ====================
function greedy(numCards, numCats, amounts, limits, rates) {
    const currentSpent = new Array(numCards).fill(0);
    const chosenCards = new Array(numCats).fill(-1);
    let totalCashback = 0;

    // Sort category indices by spending amount descending
    const sortedIndices = Array.from({ length: numCats }, (_, i) => i);
    sortedIndices.sort((a, b) => amounts[b] - amounts[a]);

    for (const i of sortedIndices) {
        let bestCard = -1;
        let bestRate = -1;

        for (let j = 0; j < numCards; j++) {
            if (currentSpent[j] + amounts[i] <= limits[j] && rates[j][i] > bestRate) {
                bestRate = rates[j][i];
                bestCard = j;
            }
        }

        if (bestCard === -1) {
            return { error: true, failedCategory: i + 1 };
        }

        chosenCards[i] = bestCard;
        currentSpent[bestCard] += amounts[i];
        totalCashback += amounts[i] * (rates[bestCard][i] / 100);
    }

    return { assignment: chosenCards, cashback: totalCashback };
}

// ==================== RENDER RESULTS ====================
function renderResult(containerId, result, numCats, amounts, rates) {
    const body = document.getElementById(containerId);

    if (result.skipped) {
        body.innerHTML = `
            <div class="result-skipped">
                <i class="fas fa-exclamation-triangle"></i>
                Skipped: too many assignments (${result.total.toLocaleString()}).<br>
                Max allowed: ${MAX_BRUTE_FORCE.toLocaleString()}
            </div>`;
        return;
    }

    if (result.error) {
        const msg = result.failedCategory
            ? `No card can fit Category ${result.failedCategory} within limits.`
            : 'No valid assignment found within card limits.';
        body.innerHTML = `<div class="result-error"><i class="fas fa-times-circle"></i> ${msg}</div>`;
        return;
    }

    let html = '<table><tr><th>Category</th><th>Amount</th><th>Card</th><th>Rate</th><th>Cashback</th></tr>';
    for (let i = 0; i < numCats; i++) {
        const card = result.assignment[i];
        const rate = rates[card][i];
        const cashback = amounts[i] * (rate / 100);
        html += `<tr>
            <td>Cat ${i + 1}</td>
            <td>$${amounts[i].toFixed(2)}</td>
            <td>Card ${card + 1}</td>
            <td>${rate.toFixed(2)}%</td>
            <td>$${cashback.toFixed(2)}</td>
        </tr>`;
    }
    html += '</table>';
    html += `<div class="result-total">Total: <span>$${result.cashback.toFixed(2)}</span></div>`;
    body.innerHTML = html;
}

function renderComparison(bf, gr) {
    const bar = document.getElementById('comparisonBar');

    if (bf.skipped) {
        bar.innerHTML = `<div class="diff"><i class="fas fa-info-circle"></i> Brute Force skipped — only Greedy result available</div>`;
        return;
    }
    if (bf.error && gr.error) {
        bar.innerHTML = `<div class="result-error">Both algorithms failed to find a valid assignment.</div>`;
        return;
    }
    if (bf.error || gr.error) {
        bar.innerHTML = `<div class="diff"><i class="fas fa-info-circle"></i> One algorithm failed — comparison not available</div>`;
        return;
    }

    const diff = Math.abs(bf.cashback - gr.cashback);
    if (diff < 0.005) {
        bar.innerHTML = `
            <div class="match"><i class="fas fa-check-circle"></i> Both algorithms found the same optimal cashback: $${bf.cashback.toFixed(2)}</div>
            <div class="detail">The Greedy heuristic matched the Brute Force optimal in this case.</div>`;
    } else {
        const better = bf.cashback > gr.cashback ? 'Brute Force' : 'Greedy';
        const worse = bf.cashback > gr.cashback ? 'Greedy' : 'Brute Force';
        const best = Math.max(bf.cashback, gr.cashback);
        bar.innerHTML = `
            <div class="diff"><i class="fas fa-not-equal"></i> ${better} found a better solution: $${best.toFixed(2)} (+$${diff.toFixed(2)} over ${worse})</div>
            <div class="detail">This demonstrates that the Greedy approach does not always find the global optimum.</div>`;
    }
}

function runAlgorithms() {
    const { numCards, numCats, amounts, limits, rates } = readInputs();

    const bfResult = bruteForce(numCards, numCats, amounts, limits, rates);
    const grResult = greedy(numCards, numCats, amounts, limits, rates);

    renderResult('bruteForceBody', bfResult, numCats, amounts, rates);
    renderResult('greedyBody', grResult, numCats, amounts, rates);
    renderComparison(bfResult, grResult);

    const container = document.getElementById('resultsContainer');
    container.style.display = 'block';
    setTimeout(() => container.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
}

// ==================== LOAD EXAMPLE ====================
function loadExample() {
    document.getElementById('numCards').value = givenExample.cards;
    document.getElementById('numCategories').value = givenExample.categories;
    generateTables();

    givenExample.amounts.forEach((v, i) => {
        applyPlaceholderBehavior(document.getElementById(`amt_${i}`), v);
    });
    givenExample.limits.forEach((v, i) => {
        applyPlaceholderBehavior(document.getElementById(`lim_${i}`), v);
    });
    givenExample.rates.forEach((row, i) => {
        row.forEach((v, j) => {
            applyPlaceholderBehavior(document.getElementById(`rate_${i}_${j}`), v);
        });
    });
}

// ==================== RANDOMIZE ====================
function randomize() {
    const numCards = parseInt(document.getElementById('numCards').value);
    const numCats = parseInt(document.getElementById('numCategories').value);
    generateTables();

    for (let i = 0; i < numCats; i++) {
        document.getElementById(`amt_${i}`).value = Math.round((Math.random() * 900 + 100) / 50) * 50;
    }
    for (let i = 0; i < numCards; i++) {
        document.getElementById(`lim_${i}`).value = Math.round((Math.random() * 2000 + 500) / 100) * 100;
    }
    for (let i = 0; i < numCards; i++) {
        for (let j = 0; j < numCats; j++) {
            document.getElementById(`rate_${i}_${j}`).value = (1 + Math.random() * 5).toFixed(1);
        }
    }
}

// ==================== EVENT LISTENERS ====================
document.getElementById('btnGenerate').addEventListener('click', generateTables);
document.getElementById('btnRun').addEventListener('click', runAlgorithms);
document.getElementById('btnLoadExample').addEventListener('click', loadExample);
document.getElementById('btnRandom').addEventListener('click', randomize);

// Initialize with example on load
window.addEventListener('load', loadExample);
