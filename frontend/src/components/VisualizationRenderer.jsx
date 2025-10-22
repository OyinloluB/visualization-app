import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ScatterChart,
  Scatter,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28EFF"];

export default function VisualizationRenderer({ spec }) {
  if (!spec)
    return <p className="text-gray-600 italic">No visualization yet.</p>;

  const { type, title, data, styling } = spec;
  const color = styling?.color || COLORS[0];

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>

      <div className="w-full h-96">
        <ResponsiveContainer width="100%" height="100%">
          {type === "pie" && (
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                outerRadius={120}
                label
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}

          {type === "bar" && (
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={color} />
            </BarChart>
          )}

          {type === "scatter" && (
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name={styling?.xLabel || "X"} />
              <YAxis dataKey="y" name={styling?.yLabel || "Y"} />
              <Tooltip />
              <Scatter data={data} fill={color} />
            </ScatterChart>
          )}
        </ResponsiveContainer>
      </div>

      {type === "table" && (
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(data[0] || {}).map((key) => (
                  <th
                    key={key}
                    className={`px-4 py-2 border text-left ${
                      styling?.boldHeader ? "font-bold" : ""
                    }`}
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={i} className="odd:bg-white even:bg-gray-50">
                  {Object.values(row).map((val, j) => (
                    <td key={j} className="px-4 py-2 border">
                      {val}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
