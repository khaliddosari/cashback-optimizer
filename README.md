# Cashback Optimizer

> An algorithms course project that finds the optimal assignment of spending categories to credit cards in order to maximize total cashback. Compares Brute Force and Greedy approaches side-by-side.

---

## Tech Stack

- **Language:** Java (pure, no frameworks)
- **Build:** Single-file compilation (`javac`)
- **I/O:** Console / Scanner

---

## Features

- **Brute Force Algorithm** — Enumerates all possible category-to-card assignments (base-N combinatorics) and selects the one that maximizes cashback while respecting per-card spending limits. Skips automatically if the search space exceeds 10,000,000 assignments.
- **Greedy Algorithm** — Sorts categories by spending amount (descending) and assigns each to the card offering the best cashback rate without exceeding its limit.
- **Side-by-side comparison** — Both algorithms run on the same input and print formatted results tables.
- **Input validation** — Handles edge cases like no valid assignment found or a category that can't fit any card.
- **Formatted output** — Clean tabular display of category, amount spent, rate, assigned card, and cashback per category + total.

---

## Process

1. Defined the problem: given N cards, M spending categories, per-card limits, and a rates matrix, maximize total cashback.
2. Modeled Brute Force by converting assignment indices to base-N representations, enumerating all valid permutations.
3. Modeled Greedy by sorting categories by spend (high to low) and greedily picking the best available card per category.
4. Added a hard cap to Brute Force to prevent memory/time blowout on large inputs.
5. Wrote formatted result printers for easy output comparison.
6. Submitted as a group project (3 members) for the Algorithms course.

---

## Running the Project

```bash
# Compile
javac Algorithms_Cashback_Project.java

# Run
java Algorithms_Cashback_Project
```

Follow the console prompts to enter:
- Number of cards and categories
- Spending amounts per category
- Per-card spending limits
- Cashback rates matrix (cards × categories)

Both Brute Force and Greedy results will be printed automatically.