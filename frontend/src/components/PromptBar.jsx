import { useState } from "react";
import { Send } from "lucide-react";
import clsx from "clsx";

const SAMPLES = [
  "Create a pie chart representing industry breakdown",
  "Create a scatter plot of founded year and valuation",
  "Create a table to see which investors appear most frequently",
  "Give me the best representation of data if I want to understand the correlation of ARR and Valuation",
  "Change the color of the chart to light blue",
];

export default function PromptBar({ onSubmit, loading }) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSubmit(query.trim());
    setQuery("");
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. “Create a pie chart of industry breakdown” or “Change the color to light blue”"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "px-6 py-3 rounded-lg text-white flex items-center gap-2",
            loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          )}
        >
          {loading ? (
            "Processing..."
          ) : (
            <>
              <Send size={18} /> Send
            </>
          )}
        </button>
      </form>

      <div className="mt-4 flex flex-wrap gap-2">
        {SAMPLES.map((s, i) => (
          <button
            key={i}
            onClick={() => setQuery(s)}
            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded text-sm"
            type="button"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
