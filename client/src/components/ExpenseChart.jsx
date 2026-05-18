import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

const ExpenseChart = ({ expenses }) => {
  const data = expenses.slice(0, 6).map((expense) => ({
    name: expense.description?.slice(0, 12) || "Expense",
    amount: expense.amount || 0,
  }));

  return (
    <div className="card">
      <div className="card-title">Recent expenses</div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={40} />
            <Tooltip cursor={{ fill: "rgba(59, 130, 246, 0.08)" }} />
            <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseChart;
