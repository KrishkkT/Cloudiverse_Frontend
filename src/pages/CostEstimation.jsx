import React from 'react';
import { useParams } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { TrendingUp, DollarSign, Calendar, Download } from 'lucide-react';
import { toast } from 'react-toastify';

const CostEstimation = () => {
  const { projectId } = useParams();

  // Mock cost data
  const costData = [
    { name: 'Compute', value: 1200, color: '#3B82F6' },
    { name: 'Storage', value: 450, color: '#22C55E' },
    { name: 'Database', value: 800, color: '#8B5CF6' },
    { name: 'Networking', value: 300, color: '#F59E0B' },
    { name: 'Security', value: 200, color: '#EF4444' },
    { name: 'Monitoring', value: 150, color: '#10B981' }
  ];

  const monthlyData = [
    { month: 'Jan', cost: 2800 },
    { month: 'Feb', cost: 3100 },
    { month: 'Mar', cost: 2900 },
    { month: 'Apr', cost: 3200 },
    { month: 'May', cost: 3000 },
    { month: 'Jun', cost: 3300 }
  ];

  const totalCost = costData.reduce((sum, item) => sum + item.value, 0);

  const handleExport = () => {
    toast.info('Cost report exported successfully!');
  };

  return (
    <div className="space-y-8 fade-in">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Cost Estimation</h1>
          <p className="text-text-secondary mt-1">Detailed breakdown of infrastructure costs</p>
        </div>
        <button
          onClick={handleExport}
          className="btn btn-primary flex items-center space-x-2"
        >
          <Download size={18} />
          <span>Export Report</span>
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary">Monthly Cost</p>
                <p className="text-3xl font-bold mt-1">${totalCost}</p>
                <p className="text-sm text-emerald-green mt-1">↓ 2.5% from last month</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/20">
                <DollarSign className="text-primary" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary">Annual Cost</p>
                <p className="text-3xl font-bold mt-1">${totalCost * 12}</p>
                <p className="text-sm text-emerald-green mt-1">Savings: $1,200</p>
              </div>
              <div className="p-3 rounded-lg bg-secondary/20">
                <Calendar className="text-secondary" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary">Optimization</p>
                <p className="text-3xl font-bold mt-1">12%</p>
                <p className="text-sm text-emerald-green mt-1">Potential savings</p>
              </div>
              <div className="p-3 rounded-lg bg-highlight/20">
                <TrendingUp className="text-highlight" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold">Cost Breakdown</h2>
          </div>
          <div className="card-body h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {costData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`$${value}`, 'Cost']}
                  contentStyle={{
                    backgroundColor: '#16181D',
                    borderColor: '#1F2937',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-xl font-bold">Monthly Trend</h2>
          </div>
          <div className="card-body h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip
                  formatter={(value) => [`$${value}`, 'Cost']}
                  contentStyle={{
                    backgroundColor: '#16181D',
                    borderColor: '#1F2937',
                    borderRadius: '0.5rem'
                  }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Cost Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">Detailed Cost Analysis</h2>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
                <tr>
                  <th className="table-head-cell">Service Category</th>
                  <th className="table-head-cell">Resource Type</th>
                  <th className="table-head-cell">Quantity</th>
                  <th className="table-head-cell">Unit Price</th>
                  <th className="table-head-cell">Total Cost</th>
                  <th className="table-head-cell">Optimization</th>
                </tr>
              </thead>
              <tbody className="table-body">
                <tr className="table-row">
                  <td className="table-cell font-medium">Compute</td>
                  <td className="table-cell">EC2 t3.medium</td>
                  <td className="table-cell">4 instances</td>
                  <td className="table-cell">$0.0416/hr</td>
                  <td className="table-cell font-medium">$1,200</td>
                  <td className="table-cell text-emerald-green">↓ $120 (10%)</td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell font-medium">Storage</td>
                  <td className="table-cell">S3 Standard</td>
                  <td className="table-cell">500 GB</td>
                  <td className="table-cell">$0.023/GB</td>
                  <td className="table-cell font-medium">$450</td>
                  <td className="table-cell text-emerald-green">↓ $45 (10%)</td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell font-medium">Database</td>
                  <td className="table-cell">RDS PostgreSQL</td>
                  <td className="table-cell">1 instance</td>
                  <td className="table-cell">$0.22/hr</td>
                  <td className="table-cell font-medium">$800</td>
                  <td className="table-cell text-emerald-green">↓ $80 (10%)</td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell font-medium">Networking</td>
                  <td className="table-cell">VPC + ELB</td>
                  <td className="table-cell">-</td>
                  <td className="table-cell">-</td>
                  <td className="table-cell font-medium">$300</td>
                  <td className="table-cell text-amber-400">-</td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell font-medium">Security</td>
                  <td className="table-cell">WAF + Shield</td>
                  <td className="table-cell">-</td>
                  <td className="table-cell">-</td>
                  <td className="table-cell font-medium">$200</td>
                  <td className="table-cell text-amber-400">-</td>
                </tr>
                <tr className="table-row">
                  <td className="table-cell font-medium">Monitoring</td>
                  <td className="table-cell">CloudWatch</td>
                  <td className="table-cell">-</td>
                  <td className="table-cell">-</td>
                  <td className="table-cell font-medium">$150</td>
                  <td className="table-cell text-amber-400">-</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>



    </div>
  );
};

export default CostEstimation;