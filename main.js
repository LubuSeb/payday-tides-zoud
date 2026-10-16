import { levels } from './levels.js';
import { billWindow, evaluate, grade, initialPlan } from './engine.js';

const money = (amount) => `${amount < 0 ? '−' : ''}$${Math.abs(amount)}`;
const $ = (selector) => document.querySelector(selector);
const storeKey = 'payday-tides-progress-v1';
let soundEnabled = false;
let audioContext;
function sound(success) {
  if (!soundEnabled) return;
  try {
    audioContext ||= new AudioContext();
    const notes = success ? [392, 494, 587] : [392, 330];
    notes.forEach((frequency, index) => {
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();
      const start = audioContext.currentTime + index * 0.105;
      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.055, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.23);
      oscillator.connect(gain).connect(audioContext.destination);
      oscillator.start(start);
      oscillator.stop(start + 0.24);
    });
  } catch { /* Visual results remain complete without audio. */ }
}
const saved = (() => {
  try { return JSON.parse(localStorage.getItem(storeKey) || '{}'); }
  catch { return {}; }
})();

let levelIndex = 0;
let plan = initialPlan(levels[levelIndex]);

function saveProgress(level, stars) {
  saved[level.id] = Math.max(stars, saved[level.id] || 0);
  try { localStorage.setItem(storeKey, JSON.stringify(saved)); }
  catch { /* The game still works when local storage is disabled. */ }
}

function selectLevel(index) {
  levelIndex = index;
  plan = initialPlan(levels[index]);
  render();
  document.querySelector('#story-title').focus({ preventScroll: true });
}

function renderNav() {
  $('#level-nav').innerHTML = levels.map((level, index) => {
    const stars = saved[level.id] || 0;
    return `<button type="button" class="level-tab ${index === levelIndex ? 'active' : ''}" data-level="${index}" aria-current="${index === levelIndex ? 'step' : 'false'}">
      <span class="level-tab-num">${level.number}</span>
      <span class="level-tab-text">${level.title}</span>
      <span class="level-tab-stars" aria-label="${stars} of 3 stars">${stars ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '· · ·'}</span>
    </button>`;
  }).join('');
  $('#level-nav').querySelectorAll('[data-level]').forEach((button) => {
    button.addEventListener('click', () => selectLevel(Number(button.dataset.level)));
  });
}

function renderStory(level) {
  $('#story-number').textContent = `STORY ${level.number} / ${levels.length.toString().padStart(2, '0')}`;
  $('#story-title').textContent = level.title;
  $('#story-title').setAttribute('tabindex', '-1');
  $('#story-description').textContent = level.story;
  $('#income-strip').innerHTML = `<span class="income-heading">MONEY ARRIVING</span>${level.income.map((item) => `<span class="income-item"><strong>Day ${item.day}</strong> ${item.label}: ${money(item.amount)}${item.stressAmount == null ? '' : ` <em>(short shift: ${money(item.stressAmount)})</em>`}</span>`).join('')}`;
  $('#story-lesson').textContent = level.lesson;
  $('#opening-balance').textContent = money(level.opening);
  $('#forecast-title').textContent = `The ${level.days}-day crossing`;
  $('#forecast-placeholder').innerHTML = Array.from({ length: level.days }, (_, index) => `<span>${String(index + 1).padStart(2, '0')}</span>`).join('');
  $('#forecast-placeholder').style.gridTemplateColumns = `repeat(${level.days}, 1fr)`;
}

function renderBills(level) {
  const move = level.moves.find((item) => item.id === plan.moveId);
  $('#bill-list').innerHTML = level.bills.map((bill, index) => {
    const window = billWindow(bill, move);
    const dates = Array.from({ length: window.last - window.first + 1 }, (_, i) => window.first + i);
    return `<article class="bill-card">
      <div class="bill-symbol" aria-hidden="true">${bill.icon}</div>
      <div class="bill-body">
        <div class="bill-top"><span class="bill-name">${bill.label}</span><strong>${money(bill.amount)}</strong></div>
        <p>${bill.note}</p>
        <div class="date-control" role="group" aria-label="Pay ${bill.label} on day">
          <span class="date-label">PAY ON</span>
          ${dates.map((day) => `<button type="button" class="day-choice ${plan.schedule[bill.id] === day ? 'chosen' : ''}" data-bill="${bill.id}" data-day="${day}" aria-pressed="${plan.schedule[bill.id] === day}">${day}</button>`).join('')}
        </div>
      </div>
      <span class="bill-index" aria-hidden="true">0${index + 1}</span>
    </article>`;
  }).join('');
  $('#bill-list').querySelectorAll('[data-bill]').forEach((button) => {
    button.addEventListener('click', () => {
      plan.schedule[button.dataset.bill] = Number(button.dataset.day);
      renderBills(level);
      $('#schedule-note').textContent = '';
      hideResult();
      const equivalent = Array.from(document.querySelectorAll('[data-bill]')).find((item) => item.dataset.bill === button.dataset.bill && item.dataset.day === button.dataset.day);
      equivalent?.focus();
    });
  });
}

function renderMoves(level) {
  $('#move-list').innerHTML = level.moves.map((move) => `<label class="move-card ${move.id === plan.moveId ? 'selected' : ''}">
    <input type="radio" name="move" value="${move.id}" ${move.id === plan.moveId ? 'checked' : ''} />
    <span class="move-radio" aria-hidden="true"></span>
    <span><strong>${move.title}</strong><small>${move.detail}</small></span>
  </label>`).join('');
  $('#move-list').querySelectorAll('input').forEach((input) => {
    input.addEventListener('change', () => {
      plan.moveId = input.value;
      const move = level.moves.find((item) => item.id === plan.moveId);
      const changedDates = [];
      for (const bill of level.bills) {
        const window = billWindow(bill, move);
        if (plan.schedule[bill.id] < window.first || plan.schedule[bill.id] > window.last) {
          changedDates.push(`${bill.label} from day ${plan.schedule[bill.id]} to day ${window.first}`);
          plan.schedule[bill.id] = window.first;
        }
      }
      renderMoves(level);
      renderBills(level);
      $('#schedule-note').textContent = changedDates.length ? `The chosen move changed the allowed payment window, so ${changedDates.join('; ')}. Check the dates before running your plan.` : '';
      hideResult();
    });
  });
}

function hideResult() {
  $('#forecast-result').hidden = true;
  $('#forecast-placeholder').hidden = false;
  $('#forecast-intro').hidden = false;
}

function render() {
  const level = levels[levelIndex];
  renderNav();
  renderStory(level);
  renderMoves(level);
  renderBills(level);
  $('#schedule-note').textContent = '';
  hideResult();
}

function balanceChart(result, label) {
  const positiveMax = Math.max(1, ...result.entries.map((entry) => entry.balance));
  const negativeMax = Math.max(0, ...result.entries.map((entry) => -entry.balance));
  const zero = 100 * positiveMax / (positiveMax + negativeMax);
  return `<div class="chart-block">
    <div class="chart-caption"><strong>${label}</strong><span>lowest ${money(result.lowest)} · end ${money(result.closing)}</span></div>
    <div class="chart" role="img" aria-label="${label}: ${result.entries.map((entry) => `day ${entry.day}, ${money(entry.balance)}`).join('; ')}">
      <span class="chart-zero" style="top:${zero}%" aria-hidden="true"></span>
      ${result.entries.map((entry) => {
        const negative = entry.balance < 0;
        const height = negative ? -entry.balance / negativeMax * (100 - zero) : entry.balance / positiveMax * zero;
        const top = negative ? zero : zero - height;
        return `<div class="chart-day ${negative ? 'under' : ''}" title="Day ${entry.day}: ${money(entry.balance)}">
          <span class="chart-bar" style="top:${top}%;height:${Math.max(1,height)}%"></span><span class="chart-tick">${entry.day}</span>
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

function scoreExplanation(result, stars) {
  if (!stars) return '';
  if (stars === 3) return `Three stars: every day stays funded, the lowest balance is ${money(result.lowest)}, and this plan has no borrowing fee or stated personal sacrifice.`;
  if (stars === 1) return `One star: every day stays funded, but the ${money(result.fee)} borrowing fee reduces what you keep.`;
  const reasons = [];
  if (result.lowest < 10) reasons.push(`the lowest balance is only ${money(result.lowest)}`);
  if (result.tradeoff) reasons.push(`you give up ${result.tradeoff}`);
  return `Two stars: every day stays funded without a fee, but ${reasons.join(' and ')}.`;
}

function planComparison(level, plan, result) {
  const startingPlan = initialPlan(level);
  const startingResult = evaluate(level, startingPlan, true);
  const changes = level.bills
    .filter((bill) => plan.schedule[bill.id] !== startingPlan.schedule[bill.id])
    .map((bill) => `${bill.label} from day ${startingPlan.schedule[bill.id]} to ${plan.schedule[bill.id]}`);
  if (plan.moveId !== startingPlan.moveId) {
    changes.push(level.moves.find((move) => move.id === plan.moveId).title.toLowerCase());
  }
  if (!changes.length) return '';
  const baseline = startingResult.lowest < 0 ? `a ${money(startingResult.lowest)} shortfall` : `a ${money(startingResult.lowest)} low point`;
  const firstGapBefore = startingResult.shortDays[0];
  const firstGapAfter = result.shortDays[0];
  const gapMoved = firstGapBefore != null && firstGapAfter != null && firstGapBefore !== firstGapAfter
    ? ` The first shortfall moves from day ${firstGapBefore} to day ${firstGapAfter}; that gap still needs a plan.`
    : '';
  return `<p class="plan-comparison"><strong>Your change:</strong> ${changes.join('; ')}. The starting plan reached ${baseline}; your plan's low point is ${money(result.lowest)}${result.success ? ' with every payment covered' : ''}.${gapMoved}</p>`;
}

function firstShortfall(result) {
  const day = result.shortDays[0];
  if (day == null) return '';
  const entry = result.entries[day - 1];
  const before = day === 1 ? result.opening : result.entries[day - 2].balance;
  const deposits = entry.transactions.filter((item) => item.amount > 0);
  const payments = entry.transactions.filter((item) => item.amount < 0);
  const list = (items) => items.length
    ? items.map((item) => `${item.label} ${money(item.amount)}`).join(' · ')
    : 'none';
  return `<section class="shortfall-card" aria-label="First shortfall explained">
    <p class="section-kicker">REWIND TO DAY ${day}</p>
    <h4>The first gap happens here.</h4>
    <p>You started the day with ${money(before)}. Money arriving: ${list(deposits)}. Payments: ${list(payments)}. The day ends at <strong>${money(entry.balance)}</strong>.</p>
    <p class="shortfall-hint">Look for a payment with an allowed later date, or compare the full cost of a different move. The bill still has to be covered.</p>
  </section>`;
}

function checkpointCard(level) {
  const check = level.checkpoint;
  return `<section class="checkpoint-card" aria-labelledby="checkpoint-title">
    <p class="section-kicker">ONE THING TO KEEP</p>
    <h4 id="checkpoint-title">${check.question}</h4>
    <div class="checkpoint-choices">${check.choices.map((choice, index) => `<button type="button" class="checkpoint-choice" data-checkpoint-choice="${index}">${choice.text}</button>`).join('')}</div>
    <p class="checkpoint-feedback" id="checkpoint-feedback" role="status" aria-live="polite">Choose an answer to check your reasoning.</p>
  </section>`;
}

function decisionComparison(level) {
  if (level.id !== 'ask-early') return '';
  const schedule = { ...initialPlan(level).schedule, food: 12 };
  const extension = evaluate(level, { schedule: { ...schedule, care: 5 }, moveId: 'extend' }, true);
  const loan = evaluate(level, { schedule: { ...schedule, care: 2 }, moveId: 'loan' }, true);
  return `<section class="decision-comparison" aria-labelledby="decision-title">
    <p class="section-kicker">THE SAME BILLS, TWO ROUTES</p>
    <h4 id="decision-title">A wider buffer today can cost you later.</h4>
    <p>In both routes, the food shop moves to day 12. The extension route assumes the childcare provider has confirmed day 5. The loan route pays childcare on day 2 and repays the loan on day 12.</p>
    <div class="results-grid">${balanceChart(extension, 'Confirmed extension')}${balanceChart(loan, 'Short loan')}</div>
    <p class="decision-takeaway">The loan keeps ${money(loan.lowest - extension.lowest)} more at the lowest point, but its ${money(loan.fee)} fee leaves ${money(extension.closing - loan.closing)} less at the end. Which buffer matters depends on the next real expense; a provider may refuse or charge for an extension.</p>
  </section>`;
}

function run() {
  const level = levels[levelIndex];
  const normal = evaluate(level, plan, false);
  const stress = evaluate(level, plan, true);
  const stars = grade(normal, stress);
  const firstGap = stress.shortDays[0] ?? normal.shortDays[0];
  const unresolved = stress.violations[0] ?? normal.violations[0];
  if (stars) saveProgress(level, stars);
  renderNav();
  const success = stars > 0;
  sound(success);
  const message = success
    ? `You kept every essential covered${level.income.some((item) => item.stressAmount != null) ? ' in both versions of Friday' : ''}. ${level.takeaway}`
    : unresolved || `Day ${firstGap} dips below zero. The month may add up, but something arrives too early. Move a payment, compare another move, and run it again.`;
  const hasStress = level.income.some((item) => item.stressAmount != null);
  const failureResult = stress.shortDays.length ? stress : normal;
  const diagnostic = success ? '' : firstShortfall(failureResult);
  const uncertaintyNote = hasStress && success ? `<p class="uncertainty-note">The short-shift low point is ${money(stress.lowest)} versus ${money(normal.lowest)} with full hours. ${stress.lowest === normal.lowest ? `The low points match, but short-shift pay leaves ${money(normal.closing - stress.closing)} less by the end.` : 'The lower low point shows where reduced hours put pressure on the plan.'}</p>` : '';
  const tradeoffNote = success ? `<p class="uncertainty-note">${scoreExplanation(stress, stars)} Stars describe this fictional plan; they do not decide what is right for a real person.</p>` : '';
  const allCompleted = levels.every((item) => (saved[item.id] || 0) > 0);
  const completion = success && levelIndex === levels.length - 1 ? `<div class="completion-card"><p class="section-kicker">THE LAST CROSSING</p><h3>${allCompleted ? 'You made it through all four.' : 'You made it through this crossing.'}</h3><p>Timing kept the bills visible. Comparing a short paycheck, a valued service and the full cost of borrowing kept the choices honest.</p><p>${allCompleted ? 'You can replay any story to try for a wider buffer, or carry the habit into your own calendar: check dates, ask about options, and count the full cost.' : 'Explore the other stories above to see how the same money behaves under different timing pressures.'}</p></div>` : '';
  const rows = stress.entries.map((entry) => `<tr class="${entry.balance < 0 ? 'negative-row' : ''}"><th scope="row">${entry.day}</th><td>${entry.transactions.length ? entry.transactions.map((transaction) => `${transaction.label} ${money(transaction.amount)}`).join(' · ') : '—'}</td><td>${money(entry.balance)}</td></tr>`).join('');
  $('#forecast-result').innerHTML = `<div class="result-banner ${success ? 'won' : 'try-again'}">
      <div><p class="section-kicker">${success ? 'THE TIDE STAYS OUT' : 'A WAVE CAME IN'}</p><h3>${success ? 'Your plan holds.' : 'Your plan needs a change.'}</h3><p>${message}</p></div>
      <span class="result-stars" aria-label="${stars} of 3 stars">${success ? '★'.repeat(stars) + '☆'.repeat(3 - stars) : '↺'}</span>
    </div>
    ${diagnostic}${planComparison(level, plan, stress)}${uncertaintyNote}${tradeoffNote}<div class="results-grid">${balanceChart(normal, 'Expected income')}${hasStress ? balanceChart(stress, 'Short-shift income') : ''}</div>
    ${success ? decisionComparison(level) : ''}
    ${success ? checkpointCard(level) : ''}
    <details class="ledger-details"><summary>See every day in the ledger <span aria-hidden="true">↘</span></summary>
      <p>Deposits clear before same-day payments. This is a fictional exercise; no overdraft fees are modeled.</p>
      <div class="table-wrap"><table><thead><tr><th scope="col">Day</th><th scope="col">Changes</th><th scope="col">End balance${hasStress ? ' · short shift' : ''}</th></tr></thead><tbody>${rows}</tbody></table></div>
    </details>
    ${success && levelIndex < levels.length - 1 ? '<button type="button" class="next-button" id="next-level">Next story <span aria-hidden="true">→</span></button>' : ''}${completion}`;
  $('#forecast-placeholder').hidden = true;
  $('#forecast-intro').hidden = true;
  $('#forecast-result').hidden = false;
  $('#forecast-result').querySelectorAll('[data-checkpoint-choice]').forEach((button) => {
    button.addEventListener('click', () => {
      const choice = level.checkpoint.choices[Number(button.dataset.checkpointChoice)];
      const feedback = $('#checkpoint-feedback');
      feedback.textContent = choice.feedback;
      feedback.classList.toggle('correct', Boolean(choice.correct));
      button.classList.toggle('correct', Boolean(choice.correct));
      button.classList.toggle('try-again', !choice.correct);
      if (choice.correct) {
        $('#forecast-result').querySelectorAll('[data-checkpoint-choice]').forEach((item) => { item.disabled = true; });
      }
    });
  });
  $('#next-level')?.addEventListener('click', () => {
    selectLevel(levelIndex + 1);
    $('#story-title').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  $('#forecast-result').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

$('#run-button').addEventListener('click', run);
$('#sound-toggle').addEventListener('click', () => {
  soundEnabled = !soundEnabled;
  $('#sound-toggle').setAttribute('aria-pressed', String(soundEnabled));
  $('#sound-toggle').textContent = soundEnabled ? 'Sound on' : 'Sound off';
});
render();
