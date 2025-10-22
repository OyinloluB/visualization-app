import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7c7c",
];

const colorMap = {
  blue: "#0088FE",
  "light blue": "#82CAFF",
  "dark blue": "#00008B",
  green: "#00C49F",
  red: "#FF8042",
  purple: "#8884d8",
  orange: "#FFBB28",
  pink: "#FF69B4",
  yellow: "#ffc658",
  teal: "#008B8B",
  cyan: "#00CED1",
  indigo: "#4B0082",
};

const getColor = (name) => {
  if (!name) return undefined;
  return colorMap[name?.toLowerCase?.()] || name;
};

export default function VisualizationRenderer({ viz, onDelete }) {
  if (!viz) return null;
  const styling = viz.styling || {};
  const boldHeader = !!styling.boldHeader;

  const stylingColor = getColor(styling.color);
  const pieUseSingleColor =
    viz.type === "pie" && stylingColor && styling.color !== "#8884d8";

  if (viz.type === "pie") {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 relative">
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
        <h3
          className={`text-lg mb-4 ${
            boldHeader ? "font-bold" : "font-normal"
          }`}
        >
          {viz.title}
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={viz.data || []} dataKey="value" nameKey="name" label>
              {(viz.data || []).map((_, i) => (
                <Cell
                  key={i}
                  fill={
                    pieUseSingleColor ? stylingColor : COLORS[i % COLORS.length]
                  }
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (viz.type === "scatter") {
    const xKey = viz.xKey || "x";
    const yKey = viz.yKey || "y";
    const xLabel = styling.xLabel || xKey;
    const yLabel = styling.yLabel || yKey;
    const scatterColor = stylingColor || "#8884d8";

    return (
      <div className="bg-white rounded-xl shadow-md p-6 relative">
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
        <h3
          className={`text-lg mb-4 ${
            boldHeader ? "font-bold" : "font-normal"
          }`}
        >
          {viz.title}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey={xKey}
              name={xLabel}
              label={{ value: xLabel, position: "insideBottom", offset: -5 }}
            />
            <YAxis
              dataKey={yKey}
              name={yLabel}
              label={{ value: yLabel, angle: -90, position: "insideLeft" }}
            />
            <Tooltip />
            <Legend />
            <Scatter data={viz.data || []} fill={scatterColor} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (viz.type === "bar") {
    const xKey = viz.xKey || "name";
    const yKey = viz.yKey || "value";
    const barColor = stylingColor || "#8884d8";

    return (
      <div className="bg-white rounded-xl shadow-md p-6 relative">
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
        <h3
          className={`text-lg mb-4 ${
            boldHeader ? "font-bold" : "font-normal"
          }`}
        >
          {viz.title}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={viz.data || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={xKey} angle={-45} textAnchor="end" height={120} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={yKey} fill={barColor} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (viz.type === "table") {
    const rows = viz.data || [];
    const columns = rows.length ? Object.keys(rows[0]) : [];

    return (
      <div className="bg-white rounded-xl shadow-md p-6 relative">
        <button
          onClick={onDelete}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        >
          ✕
        </button>
        <h3
          className={`text-lg mb-4 ${
            boldHeader ? "font-bold" : "font-normal"
          }`}
        >
          {viz.title}
        </h3>
        <div className="overflow-auto max-h-96">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                {columns.map((col) => (
                  <th
                    key={col}
                    className={`border p-3 text-left ${
                      boldHeader ? "font-bold" : ""
                    }`}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  {columns.map((col) => (
                    <td key={col} className="border p-3">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return null;
}
