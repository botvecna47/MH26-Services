import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface AnalyticsChartsProps {
  data?: {
    userGrowth: Array<{ month: string; users: number }>;
    revenueGrowth: Array<{ month: string; revenue: number }>;
    categoryDistribution: Array<{ name: string; value: number }>;
  };
}

export default function AnalyticsCharts({ data }: AnalyticsChartsProps) {
  const COLORS = ['#ff6b35', '#4CAF50', '#2196F3', '#FFC107', '#9C27B0', '#607D8B'];

  if (!data) {
    return <div className="text-center p-4 text-gray-500">Loading charts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* User Growth */}
      <div>
        <h3 className="text-gray-900 mb-3">User Growth</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={data.userGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="users" stroke="#ff6b35" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue Growth */}
      <div>
        <h3 className="text-gray-900 mb-3">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={data.revenueGrowth}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#4CAF50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Distribution */}
      <div>
        <h3 className="text-gray-900 mb-3">Service Categories Distribution</h3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={data.categoryDistribution}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.categoryDistribution.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
