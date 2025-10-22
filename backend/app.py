import os
import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
import pandas as pd
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = Flask(__name__)
CORS(app)

DATA_PATH = "data/saas_data.csv"
SEP = ","

try:
    df = pd.read_csv(DATA_PATH, sep=SEP)
    dataset_loaded = True
except Exception as e:
    print(f"Error loading dataset: {e}")
    dataset_loaded = False
    
def parse_currency(value):
    """Convert currency strings like $500M or $3.5B to numeric values (in billions)."""
    if pd.isna(value) or value == "N/A":
        return None

    value_str = str(value).replace("$", "").replace(",", "").strip().split("(")[0]
    multiplier = 1
    if "T" in value_str:
        multiplier = 1000
        value_str = value_str.replace("T", "")
    elif "B" in value_str:
        multiplier = 1
        value_str = value_str.replace("B", "")
    elif "M" in value_str:
        multiplier = 0.001
        value_str = value_str.replace("M", "")
    elif "K" in value_str:
        multiplier = 0.000001
        value_str = value_str.replace("K", "")
    try:
        return float(value_str) * multiplier
    except:
        return None
    
def interpret_query(query: str, current_viz=None):
    """
    Rule-based interpreter with simple modification handling.
    """

    if current_viz and any(word in query for word in ["change", "make", "color", "bold", "update"]):
        spec = current_viz.copy()

        # ensure styling key exists
        if "styling" not in spec:
            spec["styling"] = {}

        # change color
        if "color" in query:
            colors = {
                "blue": "#0088FE",
                "red": "#FF8042",
                "green": "#00C49F",
                "purple": "#8884d8",
                "orange": "#FFBB28"
            }
            for color_name, hex_code in colors.items():
                if color_name in query:
                    spec["styling"]["color"] = hex_code
                    break

        if "bold" in query and "header" in query:
            spec["styling"]["boldHeader"] = True

        return spec

    spec = {
        "type": "bar",
        "title": "Companies by Industry",
        "data_query": {
            "operation": "group_by",
            "column": "Industry",
            "agg_function": "count",
            "limit": 20
        },
        "styling": {"color": "#8884d8"}
    }

    if any(word in query for word in ["pie", "breakdown", "distribution"]) and "industry" in query:
        spec["type"] = "pie"
        spec["title"] = "Industry Breakdown"
        spec["data_query"]["operation"] = "group_by"
        spec["data_query"]["column"] = "Industry"

    elif "scatter" in query and "valuation" in query and "founded" in query:
        spec["type"] = "scatter"
        spec["title"] = "Founded Year vs Valuation"
        spec["data_query"] = {
            "operation": "raw",
            "x_column": "Founded Year",
            "y_column": "Valuation"
        }
        spec["styling"] = {
            "color": "#82ca9d",
            "xLabel": "Founded Year",
            "yLabel": "Valuation ($B)"
        }

    elif "investor" in query and any(word in query for word in ["frequent", "most", "table"]):
        spec["type"] = "table"
        spec["title"] = "Most Frequent Investors"
        spec["data_query"] = {
            "operation": "frequency",
            "column": "Top Investors",
            "limit": 20
        }

    elif "arr" in query and "valuation" in query:
        spec["type"] = "scatter"
        spec["title"] = "ARR vs Valuation Correlation"
        spec["data_query"] = {
            "operation": "raw",
            "x_column": "ARR",
            "y_column": "Valuation"
        }

    return spec
 
def process_query_with_llm(query: str, current_viz=None):
    """
    LLM-based interpreter.
    """
    system_prompt = """You are a data visualization assistant. Your job is to interpret user queries about a SaaS companies dataset and return a JSON specification for creating visualizations.

    Dataset columns: Company Name, Founded Year, HQ, Industry, Total Funding, ARR, Valuation, Employees, Top Investors, Product, G2 Rating

    Return ONLY valid JSON in this exact format:
    {
    "type": "pie" | "bar" | "scatter" | "table" | "line",
    "title": "Chart Title",
    "data_query": {
        "operation": "group_by" | "aggregate" | "filter" | "join" | "raw",
        "column": "column_name",
        "agg_function": "count" | "sum" | "mean" | "frequency",
        "filters": [],
        "x_column": "column for x-axis",
        "y_column": "column for y-axis",
        "sort": "asc" | "desc",
        "limit": 20
    },
    "styling": {
        "color": "#8884d8",
        "boldHeader": false,
        "xLabel": "X Axis",
        "yLabel": "Y Axis"
    }
    }

    For modifications (like "change color to blue"), update only the styling section.

    Examples:
    - "pie chart of industry breakdown" -> group_by Industry, count
    - "scatter plot founded year vs valuation" -> x: Founded Year, y: Valuation
    - "table of top investors frequency" -> frequency analysis on Top Investors
    - "correlation of ARR and Valuation" -> scatter plot, x: ARR, y: Valuation"""
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Query: {query}\nCurrent visualization: {json.dumps(current_viz) if current_viz else 'None'}"}
    ]
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.3,
            max_tokens=400
        )

        content = response.choices[0].message.content.strip()
        spec = json.loads(content)
        return spec

    except Exception as e:
        print(f"LLM Error: {e}")
        return None
    
def execute_data_query(spec):
    """
    Executes based on the spec.
    """
    data_query = spec["data_query"]
    operation = data_query["operation"]

    if operation == "group_by":
        col = data_query["column"]
        limit = data_query.get("limit", 20)
        result = df[col].value_counts().reset_index().head(limit)
        result.columns = ["name", "value"]
        return result.to_dict(orient="records")

    elif operation == "frequency":
        col = data_query["column"]
        all_values = []
        for value in df[col].dropna():
            parts = [v.strip() for v in str(value).split(",")]
            all_values.extend(parts)
        freq = pd.Series(all_values).value_counts().reset_index().head(data_query.get("limit", 20))
        freq.columns = ["name", "value"]
        return freq.to_dict(orient="records")

    elif operation == "raw":
        x_col = data_query["x_column"]
        y_col = data_query["y_column"]
        result = df[[x_col, y_col]].copy()
        
        if y_col in ["Valuation", "ARR", "Total Funding"]:
            result[y_col] = result[y_col].apply(parse_currency)
        if x_col in ["Valuation", "ARR", "Total Funding"]:
            result[x_col] = result[x_col].apply(parse_currency)

        result = result.dropna().head(50)
        result.columns = ["x", "y"]
        return result.to_dict(orient="records")

    return []


@app.route("/health", methods=["GET"])
def health_check():
    """Health check endpoint."""
    return jsonify({
        "status": "healthy",
        "dataset_loaded": dataset_loaded,
        "rows": len(df) if dataset_loaded else 0
    })
    
@app.route("/api/dataset-info", methods=["GET"])
def dataset_info():
    """
    Returns metadata about the dataset.
    """
    if not dataset_loaded:
        return jsonify({"error": "Dataset not loaded"}), 500

    info = {
        "columns": list(df.columns),
        "shape": {"rows": df.shape[0], "columns": df.shape[1]},
        "sample": df.head(3).to_dict(orient="records"),
    }

    return jsonify(info), 200

@app.route("/api/query", methods=["POST"])
def handle_query():
    """
    Processes user queries
    """
    data = request.get_json()
    query = data.get("query", "").lower()
    current_viz = data.get("current_viz")
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    spec = None

    if os.getenv("OPENAI_API_KEY"):
        spec = process_query_with_llm(query, current_viz)

    if not spec:
        spec = interpret_query(query, current_viz)
    
    viz_data = execute_data_query(spec)
    
    response = {
        **spec,
        "data": viz_data
    }
    
    return jsonify(response), 200
    
if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(debug=True, port=port)