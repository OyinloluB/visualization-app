import "./index.css";
import axios from "axios";
import { useState } from "react";
import PromptBar from "./components/PromptBar";
import VisualizationRenderer from "./components/VisualizationRenderer";

const API_BASE = "http://127.0.0.1:5000";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [visualizations, setVisualizations] = useState([]);

  const handleQuery = async (query) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_BASE}/api/query`, { query });
      const spec = res.data;
      setVisualizations((prev) => [...prev, spec]);
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            SaaS Data Visualizer
          </h1>
          <p className="text-gray-600">
            Ask questions about the Top 100 SaaS Companies in natural language
          </p>
        </div>

        <PromptBar onSubmit={handleQuery} loading={loading} />

        <div className="space-y-8">
          {visualizations.map((viz, i) => (
            <VisualizationRenderer key={i} spec={viz} />
          ))}
        </div>
      </div>
    </div>
  );
}
