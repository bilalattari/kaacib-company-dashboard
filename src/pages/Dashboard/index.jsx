import { Card, Row, Col, Statistic } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TicketsIcon, CheckCircle, Clock, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  // Dummy data for charts
  const ticketsByMonth = [
    { month: 'Jan', tickets: 45, completed: 38 },
    { month: 'Feb', tickets: 52, completed: 45 },
    { month: 'Mar', tickets: 61, completed: 55 },
    { month: 'Apr', tickets: 58, completed: 50 },
    { month: 'May', tickets: 70, completed: 65 },
    { month: 'Jun', tickets: 68, completed: 62 },
  ];

  const ticketsByPriority = [
    { name: 'Normal', value: 45, color: '#52c41a' },
    { name: 'Medium', value: 30, color: '#faad14' },
    { name: 'High', value: 25, color: '#f5222d' },
  ];

  const ticketsByStatus = [
    { status: 'Open', count: 25 },
    { status: 'In Progress', count: 35 },
    { status: 'Pending', count: 15 },
    { status: 'Completed', count: 125 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="w-full h-full px-4 py-4 overflow-auto">
      {/* Statistics Cards */}
      <Row gutter={[16, 16]} className="mb-6">
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Total Tickets"
              value={200}
              prefix={<TicketsIcon className="text-blue-500" size={24} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Completed"
              value={125}
              prefix={<CheckCircle className="text-green-500" size={24} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Pending"
              value={50}
              prefix={<Clock className="text-orange-500" size={24} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <Statistic
              title="Resolution Rate"
              value={87.5}
              suffix="%"
              prefix={<TrendingUp className="text-purple-500" size={24} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Charts */}
      <Row gutter={[16, 16]}>
        {/* Tickets by Month */}
        <Col xs={24} lg={12}>
          <Card title="Tickets Overview (Last 6 Months)" className="shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tickets" fill="#1890ff" name="Total Tickets" />
                <Bar dataKey="completed" fill="#52c41a" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Tickets by Priority */}
        <Col xs={24} lg={12}>
          <Card title="Tickets by Priority" className="shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketsByPriority}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ticketsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Tickets by Status */}
        <Col xs={24} lg={12}>
          <Card title="Tickets by Status" className="shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="status" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" name="Count">
                  {ticketsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* Trend Line Chart */}
        <Col xs={24} lg={12}>
          <Card title="Ticket Completion Trend" className="shadow-md">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ticketsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#52c41a"
                  strokeWidth={2}
                  name="Completed Tickets"
                />
                <Line
                  type="monotone"
                  dataKey="tickets"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="Total Tickets"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
