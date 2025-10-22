# SaaS Data Visualizer

A full-stack app that lets you explore the Top 100 SaaS companies (2025) using natural-language prompts.  
Ask for charts or tables like:

- “Create a pie chart representing industry breakdown”
- “Create a scatter plot of founded year and valuation”
- “Create a table to see which investors appear most frequently”
- “Give me the best representation of data if I want to understand the correlation of ARR and Valuation”
- “Change the color of the chart to light blue”
- “Make the header bold”

The app generates visualizations and lets you **tweak an existing chart** by selecting it and sending a follow-up prompt.

---

## Tech Stack

- **Frontend:** React + Vite + TailwindCSS + Recharts  
- **Backend:** Python (Flask) + Pandas  
- **LLM (optional):** OpenAI (falls back to rules if no key / quota)

---

## Setup

### 1. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
````

Dataset should be located in:

```
backend/data/saas_data.csv
```

If you want to enable LLM support, create a `.env` file:

```
OPENAI_API_KEY=your_key_here
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

Backend defaults to:

```
http://127.0.0.1:5000
```

---

## How to Use

1. Start backend (`python app.py`) and frontend (`npm run dev`).
2. In the app, type a prompt (e.g., “Create a pie chart representing industry breakdown”).
3. To **tweak** a chart:

   * Click a chart to select it (you’ll see a blue ring around it).
   * Send a prompt like “change color to blue” or “make header bold”.
4. You can add multiple visualizationsM tweaks only update the selected (or most recent) one.

**Color behavior:**
Charts use multi-color defaults for readability. If you specify a color (e.g. “color to red”), it will override the default.

---

## Endpoints

* `GET /health` → Health check & dataset info
* `GET /api/dataset-info` → Columns, shape, sample
* `POST /api/query` → Accepts `{ query, current_viz }` and returns a JSON spec + data


## Scripts

**Backend**

```bash
cd backend
python app.py
```

**Frontend**

```bash
cd frontend
npm run dev
```
