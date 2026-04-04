# Cashback Optimizer

An algorithms course project that finds the optimal assignment of spending categories to credit cards in order to maximize total cashback. Compares Brute Force and Greedy approaches side-by-side.

![Preview](preview.png)

---

## Tech Stack

- **Language:** `Java`, `JavaScript`
- **Frontend:** `HTML`, `CSS`, `JavaScript`
- **Build (Java):** Single-file compilation (`javac`)
- **Libraries:** AOS (scroll animations)
---

## Features

- **Brute Force Algorithm**: Tries every possible category-to-card assignment to guarantee the optimal solution. Skips automatically if the search space exceeds 10 million.
- **Greedy Algorithm**: Assigns categories largest-spend-first to the card with the best rate, running in polynomial time.
- **Interactive Web Demo**: Enter your own cards, categories, and rates in the browser and run both algorithms side-by-side in real time.
- **Side-by-side comparison**: Formatted results tables for both algorithms with a comparison summary highlighting differences.

---

## Process

1. Defined the problem: given N cards, M spending categories, per-card limits, and a rates matrix, maximize total cashback.
2. Implemented Brute Force by enumerating all base-N assignments and Greedy by sorting categories by spend and picking the best available card.
3. Added a hard cap to Brute Force to prevent blowout on large inputs.
4. Re-implemented both algorithms in JavaScript and built an interactive web demo with editable inputs and side-by-side results.

---

## Running the Project

### Web Demo

Open `docs/index.html` in a browser; no build step required.

### Java Console App

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
- Cashback rates matrix (cards x categories)

Both Brute Force and Greedy results will be printed automatically.

Live at: [khaliddosari.github.io/3ajib](https://cashback-optimizer.khalidaldosari.workers.dev/)

---

## Team

- Khalid Al Dosari
- Zeyad bin Nazir
- Abdulellah Altowaijri
