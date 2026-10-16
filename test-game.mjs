import assert from 'node:assert/strict';
import { levels } from './levels.js';
import { billWindow, evaluate, grade, initialPlan } from './engine.js';

function enumerate(level) {
  const solutions = [];
  for (const move of level.moves) {
    const schedule = {};
    function visit(index) {
      if (index === level.bills.length) {
        const plan = { moveId: move.id, schedule: { ...schedule } };
        const normal = evaluate(level, plan);
        const stress = evaluate(level, plan, true);
        solutions.push({ plan, normal, stress, stars: grade(normal, stress) });
        return;
      }
      const bill = level.bills[index];
      const window = billWindow(bill, move);
      for (let day = window.first; day <= window.last; day += 1) {
        schedule[bill.id] = day;
        visit(index + 1);
      }
    }
    visit(0);
  }
  return solutions;
}

for (const level of levels) {
  assert(level.checkpoint?.question && level.checkpoint.choices.length === 3, `${level.title} needs a complete knowledge check`);
  assert.equal(level.checkpoint.choices.filter((choice) => choice.correct).length, 1, `${level.title} needs one unambiguous answer`);
  assert(level.checkpoint.choices.every((choice) => choice.feedback), `${level.title} needs feedback for every answer`);
  const all = enumerate(level);
  const best = all.filter(({ stars }) => stars === Math.max(...all.map((item) => item.stars)));
  const defaultPlan = initialPlan(level);
  const initial = evaluate(level, defaultPlan);
  const maxStars = best[0].stars;
  assert.equal(maxStars, 3, `${level.title} must have a three-star solution`);
  assert.equal(grade(initial, evaluate(level, defaultPlan, true)), 0, `${level.title} should need a change`);
  assert.equal(level.bills.reduce((n, bill) => n + bill.amount, 0) > 0, true);
  console.log(JSON.stringify({ level: level.id, attempts: all.length, maxStars, threeStarCount: best.length, sample: best[0].plan, defaultLowest: initial.lowest }));
}

const trial = levels.find((level) => level.id === 'the-trial');
const trialRuns = enumerate(trial);
assert(trialRuns.some(({ plan, stars }) => plan.moveId === 'cancel' && stars === 2), 'cancellation should be viable but have a non-cash tradeoff');
assert(trialRuns.every(({ plan, stars }) => plan.moveId !== 'cancel' || stars < 3), 'giving up the valued service should not be the top-ranked life choice');
assert(trialRuns.some(({ plan, stars }) => plan.moveId === 'keep' && stars === 0), 'poor timing should make the kept service unaffordable');
assert(trialRuns.some(({ plan, stars }) => plan.moveId === 'keep' && stars === 3), 'careful timing should preserve the valued service and a cash buffer');
assert(trialRuns.some(({ plan, stars }) => plan.moveId === 'cancel' && stars === 0), 'cancellation alone should not solve every timing problem');
const shift = levels.find((level) => level.id === 'short-shift');
assert(enumerate(shift).some(({ plan, normal, stress, stars }) => plan.moveId === 'none' && stars === 3 && normal.lowest > stress.lowest), 'good timing should protect both pay scenarios without forcing extra work');
assert(enumerate(shift).every(({ plan, stars }) => plan.moveId !== 'shift' || stars < 3), 'an extra shift should remain a valid tradeoff, not a required top-ranked move');
const care = levels.find((level) => level.id === 'ask-early');
assert(enumerate(care).some(({ plan, stars }) => plan.moveId === 'extend' && stars === 3), 'extension should solve childcare gap');
assert(enumerate(care).every(({ plan, stars }) => plan.moveId !== 'loan' || stars < 3), 'fee-bearing loan should not be top-ranked');
const extensionRoute = evaluate(care, { moveId: 'extend', schedule: { ...initialPlan(care).schedule, care: 5, food: 12 } }, true);
const loanRoute = evaluate(care, { moveId: 'loan', schedule: { ...initialPlan(care).schedule, care: 2, food: 12 } }, true);
assert(extensionRoute.success && loanRoute.success, 'both compared childcare routes must actually cover every bill');
assert(loanRoute.lowest > extensionRoute.lowest && loanRoute.closing < extensionRoute.closing, 'the loan should buy a short-term buffer but leave less cash after repayment');
assert.equal(extensionRoute.closing - loanRoute.closing, loanRoute.fee, 'the stated long-term difference should match the borrowing fee');
console.log('All game logic checks passed.');
