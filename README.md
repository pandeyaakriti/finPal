# finPal

finPal is a financial intelligence system that helps users understand spending habits, track budgets, and forecast future financial trends.
Upload transaction data, get automatic expense categorization, visualize insights, and receive predictive analysis for smarter financial decisions.

---

## Features

* **CSV Transaction Upload** — Import bank statements easily
* **AI Expense Categorization** — Automatically classifies spending
* **Interactive Dashboards** — Visual breakdown of expenses by category
* **Budget Tracking** — Set limits and monitor progress
* **Spending Insights** — Understand where your money actually goes
* **Forecasting Module** — Predict short-term financial trends (ML-based)
* **Modular Architecture** — Separate frontend, backend, and AI services

---


## Tech Stack

| Layer         | Technology                        |
| ------------- | --------------------------------- |
| Frontend      | Next.js, TypeScript, Tailwind CSS |
| Backend       | Node.js, Express, PostgreSQL      |
| AI Service    | FastAPI, Python, Scikit-learn     |
| Data Flow     | REST APIs                         |
| Visualization | Chart Libraries                   |
| Database      | PostgreSQL                        |

---

## How It Works ?

1. User uploads a CSV of transactions.
2. Backend parses and stores structured data.
3. AI service categorizes each transaction using trained logic.
4. Results are visualized in dashboards.
5. Users define budgets and track progress.
6. Forecast module predicts spending trends.

---

## Local Setup Guide

### 1. Clone the Repository

```
git clone https://github.com/pandeyaakriti/finPal.git
cd finPal
```

---

### 2. Start Frontend

```
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:3000
```

---

### 3. Start Backend

```
cd backend
npm install
npm run dev
```

Backend runs at:

```
http://localhost:5000
```

---

### 4. Start AI Service

```
cd ai/service
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

AI service runs at:

```
http://localhost:8000
```

---

## Future Improvements

* Bank API integration (no manual CSV upload)
* Personalized financial recommendations
* Advanced forecasting models
* Mobile version
* Multi-user collaboration dashboards

---


Give it a star. Or better — use it to understand your spending before your wallet judges you.
