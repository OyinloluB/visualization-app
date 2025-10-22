import "./index.css";
import axios from "axios";
import { useState } from "react";
import PromptBar from "./components/PromptBar";
import VisualizationRenderer from "./components/VisualizationRenderer";

const API_BASE = "http://127.0.0.1:5000";

export default function App() {
  const [loading, setLoading] = useState(false);
  const [visualizations, setVisualizations] = useState([]);
  const [selectedViz, setSelectedViz] = useState(null);

  const isTweakQuery = (q) =>
    /(?:change|make|color|bold|update)/i.test(q || "");

  const handleQuery = async (query) => {
    try {
      setLoading(true);

      const fallbackViz = visualizations[visualizations.length - 1] || null;
      const current_viz = selectedViz || fallbackViz;

      const res = await axios.post(`${API_BASE}/api/query`, {
        query,
        current_viz,
      });

      const spec = res.data;
      const withId = { ...spec, id: crypto?.randomUUID?.() ?? Date.now() };

      setVisualizations((prev) => {
        if (isTweakQuery(query)) {
          if (selectedViz) {
            return prev.map((v) => (v.id === selectedViz.id ? withId : v));
          }
          if (prev.length) {
            return [...prev.slice(0, -1), withId];
          }
          return [withId];
        } else {
          return [...prev, withId];
        }
      });

      setSelectedViz(null);
    } catch (err) {
      console.error("API error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setVisualizations((prev) => prev.filter((v) => v.id !== id));
    if (selectedViz?.id === id) setSelectedViz(null);
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
          {visualizations.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Tip: click a chart to select it, then type “change color to blue”
              or “make header bold” to tweak it.
            </p>
          )}
        </div>

        <PromptBar onSubmit={handleQuery} loading={loading} />

        <div className="space-y-8">
          {visualizations.map((viz) => (
            <div
              key={viz.id}
              onClick={() => setSelectedViz(viz)}
              className={`cursor-pointer transition-all ${
                selectedViz?.id === viz.id ? "ring-4 ring-blue-500" : ""
              }`}
            >
              <VisualizationRenderer
                viz={viz}
                onDelete={() => handleDelete(viz.id)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
