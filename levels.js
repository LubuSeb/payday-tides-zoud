export const levels = [
  {
    id: 'the-gap',
    number: '01',
    title: 'The three-day gap',
    lesson: 'A bill can be affordable over a month and still arrive before the cash does.',
    story: 'The bus pass is due soon. Your pay lands on day 3. Today’s meals are covered, but the planned bulk food shop can move. Place payments within dates the providers actually allow.',
    opening: 45,
    days: 12,
    income: [
      { day: 3, amount: 145, label: 'Payday' },
      { day: 7, amount: 35, label: 'Weekend shift' },
      { day: 11, amount: 75, label: 'Payday' },
    ],
    bills: [
      { id: 'bus', label: 'Bus pass', amount: 30, first: 1, last: 4, defaultDay: 1, icon: '↗', note: 'Can be paid any time before day 4.' },
      { id: 'rent', label: 'Rent', amount: 120, first: 3, last: 5, defaultDay: 3, icon: '⌂', note: 'Landlord confirms a day 3–5 payment window.' },
      { id: 'food', label: 'Food basket', amount: 55, first: 4, last: 9, defaultDay: 4, icon: '◒', note: 'A planned shop, not an essential meal you can skip.' },
    ],
    moves: [{ id: 'none', title: 'No extra move', detail: 'The calendar is all you need here.', effects: [] }],
    takeaway: 'The amount you earn did not change. Moving a planned payment inside its allowed window can make the same money last through the gap.',
    checkpoint: {
      question: 'Why can moving the food shop solve the gap without earning more?',
      choices: [
        { text: 'It changes when the money leaves, so the next income arrives first.', correct: true, feedback: 'Exactly. The weekend shift arrives before the shop; the total cost stays the same.' },
        { text: 'It reduces the price of the bus pass.', feedback: 'The bus pass still costs the same. Look at which day the food payment leaves.' },
        { text: 'It lets you skip a necessary meal.', feedback: 'Meals are already covered. This is only a planned bulk shop with a flexible date.' },
      ],
    },
  },
  {
    id: 'the-trial',
    number: '02',
    title: 'The quiet renewal',
    lesson: 'An automatic charge and a payment date can both change the room left for surprises.',
    story: 'A learning subscription you use each week renews on day 3. A pharmacy bill appears later. Keep the service, cancel it, or take an advance; then find a schedule that actually holds.',
    opening: 45,
    days: 14,
    income: [
      { day: 4, amount: 150, label: 'Payday' },
      { day: 7, amount: 50, label: 'Weekend shift' },
      { day: 11, amount: 150, label: 'Payday' },
    ],
    bills: [
      { id: 'utility', label: 'Utilities', amount: 145, first: 4, last: 7, defaultDay: 4, icon: '☼', note: 'Due within the provider’s stated window.' },
      { id: 'medicine', label: 'Pharmacy', amount: 55, first: 6, last: 10, defaultDay: 6, icon: '+', note: 'Needs paying in this window.' },
      { id: 'surprise', label: 'Broken lock', amount: 20, first: 8, last: 8, defaultDay: 8, icon: '◇', note: 'The emergency cost cannot move.' },
      { id: 'rent', label: 'Rent', amount: 125, first: 11, last: 12, defaultDay: 11, icon: '⌂', note: 'Due after the second payday.' },
    ],
    moves: [
      { id: 'keep', title: 'Keep the subscription', detail: 'It renews for $10 on day 3. You keep the weekly learning sessions.', effects: [{ day: 3, amount: -10, label: 'Subscription renewal' }] },
      { id: 'cancel', title: 'Cancel before renewal', detail: 'No charge; you give up a service you use weekly.', effects: [], tradeoff: 'learning sessions' },
      { id: 'advance', title: 'Take an advance', detail: 'Get $60 now and repay $68 on day 11. The $8 difference is the cost.', effects: [{ day: 1, amount: 60, label: 'Cash advance' }, { day: 11, amount: -68, label: 'Advance repayment' }], fee: 8 },
    ],
    takeaway: 'The timing of two bills matters as much as their total. Keeping a useful service can still be possible without expensive credit; compare the path you chose with the other options.',
    checkpoint: {
      question: 'Before cancelling a useful service, what should you check?',
      choices: [
        { text: 'Only the end-of-month balance.', feedback: 'A positive final balance can hide an earlier shortfall.' },
        { text: 'The daily balance and what you give up, alongside any borrowing cost.', correct: true, feedback: 'Right. A cheaper-looking plan can still fail on a particular day or carry a personal cost.' },
        { text: 'Whether an advance gives the most cash today.', feedback: 'The advance must be repaid. Compare its full cost and future-day balance.' },
      ],
    },
  },
  {
    id: 'short-shift',
    number: '03',
    title: 'Two possible Fridays',
    lesson: 'A plan that works only if every shift pays in full is fragile.',
    story: 'Friday’s hours are not confirmed. Build a plan that survives both the ordinary paycheck and the short-shift paycheck.',
    opening: 50,
    days: 13,
    income: [
      { day: 3, amount: 150, label: 'Payday' },
      { day: 9, amount: 85, stressAmount: 60, label: 'Variable shift pay' },
    ],
    bills: [
      { id: 'rent', label: 'Rent', amount: 145, first: 3, last: 6, defaultDay: 3, icon: '⌂', note: 'Payment window confirmed.' },
      { id: 'food', label: 'Food basket', amount: 40, first: 5, last: 10, defaultDay: 5, icon: '◒', note: 'Plan the shop when cash is available.' },
      { id: 'utility', label: 'Utilities', amount: 60, first: 7, last: 11, defaultDay: 7, icon: '☼', note: 'Provider gives this payment window.' },
    ],
    moves: [
      { id: 'none', title: 'Rely on Friday', detail: 'No extra income or fees.', effects: [] },
      { id: 'shift', title: 'Take a guaranteed shift', detail: 'Earn $35 on day 8. This costs your free evening, but no money.', effects: [{ day: 8, amount: 35, label: 'Extra shift' }], tradeoff: 'free evening' },
      { id: 'advance', title: 'Take an advance', detail: 'Get $40 on day 1, repay $46 on day 12.', effects: [{ day: 1, amount: 40, label: 'Cash advance' }, { day: 12, amount: -46, label: 'Advance repayment' }], fee: 6 },
    ],
    takeaway: 'The full-hours forecast can hide a later gap. Check the short-shift version before committing, and decide whether a timing change, an extra shift, or a fee is worth the tradeoff.',
    checkpoint: {
      question: 'Which forecast tells you whether this plan survives uncertain hours?',
      choices: [
        { text: 'Only the full-hours forecast.', feedback: 'That misses the risk you are planning for: Friday could pay less.' },
        { text: 'Both forecasts, especially the lower-pay version and its smallest buffer.', correct: true, feedback: 'Yes. The low-pay path is the stress test, not a prediction of what will happen.' },
        { text: 'Only the total income for the month.', feedback: 'Even enough monthly income can arrive after a bill is due.' },
      ],
    },
  },
  {
    id: 'ask-early',
    number: '04',
    title: 'The call before the fee',
    lesson: 'The first response to a timing gap does not have to be expensive credit.',
    story: 'Childcare is due two days before pay. The provider may agree to a one-time extension. A loan also solves the first gap, but it takes money from your next payday.',
    opening: 60,
    days: 14,
    income: [
      { day: 5, amount: 190, label: 'Payday' },
      { day: 12, amount: 120, label: 'Payday' },
    ],
    bills: [
      { id: 'care', label: 'Childcare', amount: 80, first: 2, last: 3, defaultDay: 2, icon: '✳', note: 'Original agreement: day 2–3.' },
      { id: 'rent', label: 'Rent', amount: 150, first: 5, last: 7, defaultDay: 5, icon: '⌂', note: 'Payable after the first payday.' },
      { id: 'food', label: 'Food basket', amount: 55, first: 8, last: 13, defaultDay: 8, icon: '◒', note: 'A planned shop.' },
    ],
    moves: [
      { id: 'none', title: 'Keep the original terms', detail: 'Childcare remains due on day 2–3.', effects: [] },
      { id: 'extend', title: 'Ask for an extension', detail: 'For this fictional level, the provider agrees in writing to day 5–6 at no fee.', effects: [], changeWindow: { bill: 'care', first: 5, last: 6 } },
      { id: 'loan', title: 'Borrow $60', detail: 'Receive $60 on day 1 and repay $70 on day 12.', effects: [{ day: 1, amount: 60, label: 'Short loan' }, { day: 12, amount: -70, label: 'Loan repayment' }], fee: 10 },
    ],
    takeaway: 'A confirmed extension can bridge a gap without a loan, while borrowing can cost more later. Real providers may say no or charge a fee: ask first, get the new date in writing, and compare the full cost.',
    checkpoint: {
      question: 'What must happen before you rely on the childcare payment moving?',
      choices: [
        { text: 'You decide to pay later and assume the provider agrees.', feedback: 'A hoped-for date is not an agreed payment window.' },
        { text: 'The provider confirms the new date and any fee, ideally in writing.', correct: true, feedback: 'Exactly. This story grants an extension, but a real provider may refuse or charge.' },
        { text: 'You take the loan first, without comparing repayment.', feedback: 'Check whether an agreed extension is available and compare the full loan cost.' },
      ],
    },
  },
];
