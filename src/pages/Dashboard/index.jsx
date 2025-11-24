import { useEffect, useState, useMemo } from 'react';
import { Card, Row, Col, Statistic, Tag, Spin, Empty, ConfigProvider } from 'antd';
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
} from 'recharts';
import {
  TicketsIcon,
  CheckCircle,
  Clock,
  TrendingUp,
  FileText,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { getDashboard } from '../../apis';
import { message } from 'antd';
import ThemedTable from '../../components/ThemedTable';
import ThemedButton from '../../components/ThemedButton';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { useSelector } from 'react-redux';
import { selectCompanyInfo } from '../../redux/slices/companySlice';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const companyInfo = useSelector(selectCompanyInfo);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const { data } = await getDashboard();
      setDashboardData(data?.data);
    } catch (err) {
      console.error('Error fetching dashboard =>', err);
      message.error(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleCTAClick = (cta) => {
    if (cta?.route) {
      const queryParams = new URLSearchParams(cta.filters || {}).toString();
      navigate(`${cta.route}${queryParams ? `?${queryParams}` : ''}`);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'red',
      medium: 'gold',
      normal: 'green',
    };
    return colors[priority] || 'default';
  };

  const getStatusColor = (status) => {
    const colors = {
      assigned: 'blue',
      completed: 'green',
      closed: 'green',
      quotation_pending: 'orange',
      on_site: 'cyan',
      inspecting: 'purple',
      in_progress: 'blue',
    };
    return colors[status] || 'volcano';
  };

  const getHealthColor = (health) => {
    const colors = {
      Good: 'green',
      Warning: 'gold',
      Critical: 'red',
    };
    return colors[health] || 'default';
  };

  // KPI Cards
  const kpiCards = useMemo(() => {
    if (!dashboardData?.kpi_cards) return [];
    return dashboardData.kpi_cards.map((kpi) => {
      let icon;
      let color = '#1890ff';
      switch (kpi.key) {
        case 'active_contracts':
          icon = <FileText className="text-blue-500" size={18} />;
          color = '#1890ff';
          break;
        case 'assets_covered':
          icon = <CheckCircle className="text-green-500" size={18} />;
          color = '#52c41a';
          break;
        case 'tickets_this_month':
          icon = <TicketsIcon className="text-orange-500" size={18} />;
          color = '#faad14';
          break;
        case 'pending_approvals':
          icon = <AlertCircle className="text-red-500" size={18} />;
          color = '#f5222d';
          break;
        case 'delayed_services':
          icon = <Clock className="text-orange-500" size={18} />;
          color = '#faad14';
          break;
        case 'completion_rate':
          icon = <TrendingUp className="text-purple-500" size={18} />;
          color = '#722ed1';
          break;
        case 'avg_response_time_corrective':
          icon = <Clock className="text-cyan-500" size={18} />;
          color = '#13c2c2';
          break;
        default:
          icon = <TicketsIcon className="text-blue-500" size={18} />;
      }
      return { ...kpi, icon, color };
    });
  }, [dashboardData]);

  // Table columns for upcoming scheduled
  const upcomingScheduledColumns = useMemo(() => {
    if (!dashboardData?.sections) return [];
    const section = dashboardData.sections.find(
      (s) => s.key === 'upcoming_scheduled',
    );
    if (!section?.columns) return [];
    return section.columns.map((col) => ({
      title: col.label,
      dataIndex: col.key,
      key: col.key,
      render: (text, record) => {
        if (col.key === 'status') {
          return (
            <Tag color={getStatusColor(text)}>
              {String(text || '').toUpperCase().replace('_', ' ')}
            </Tag>
          );
        }
        if (col.key === 'date') {
          return text ? format(parseISO(text), 'dd MMM, yyyy') : '—';
        }
        return text || '—';
      },
    }));
  }, [dashboardData]);

  // Table columns for open repairs
  const openRepairsColumns = useMemo(() => {
    if (!dashboardData?.sections) return [];
    const section = dashboardData.sections.find(
      (s) => s.key === 'open_repairs',
    );
    if (!section?.columns) return [];
    return section.columns.map((col) => ({
      title: col.label,
      dataIndex: col.key,
      key: col.key,
      render: (text, record) => {
        if (col.key === 'priority') {
          return (
            <Tag color={getPriorityColor(text)} className="capitalize">
              {text || '—'}
            </Tag>
          );
        }
        if (col.key === 'status') {
          return (
            <Tag color={getStatusColor(text)}>
              {String(text || '').toUpperCase().replace('_', ' ')}
            </Tag>
          );
        }
        if (col.key === 'requested') {
          return text ? format(parseISO(text), 'dd MMM, yyyy') : '—';
        }
        if (col.key === 'action') {
          return (
            <ThemedButton
              text={text?.label || 'View'}
              variant="outlined"
              onClick={() => {
                if (text?.route) {
                  navigate(text.route);
                }
              }}
              className="text-xs"
            />
          );
        }
        return text || '—';
      },
    }));
  }, [dashboardData, navigate]);

  // Table columns for asset health
  const assetHealthColumns = useMemo(() => {
    if (!dashboardData?.sections) return [];
    const section = dashboardData.sections.find((s) => s.key === 'asset_health');
    if (!section?.columns) return [];
    return section.columns.map((col) => ({
      title: col.label,
      dataIndex: col.key,
      key: col.key,
      render: (text, record) => {
        if (col.key === 'health') {
          return (
            <Tag color={getHealthColor(text)} className="capitalize">
              {text || '—'}
            </Tag>
          );
        }
        if (col.key === 'last_service' || col.key === 'next_due') {
          return text && text !== 'N/A' ? format(parseISO(text), 'dd MMM, yyyy') : text || '—';
        }
        return text || '—';
      },
    }));
  }, [dashboardData]);

  // Charts data
  const chartsData = useMemo(() => {
    if (!dashboardData?.sections) return [];
    const section = dashboardData.sections.find((s) => s.key === 'charts_block');
    return section?.charts || [];
  }, [dashboardData]);

  if (loading && !dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center h-64">
        <Empty description="No dashboard data available" />
      </div>
    );
  }

  const themeColor = companyInfo?.theme_color || '#ff3300';

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: themeColor,
        },
      }}
    >
      <div className="w-full h-full px-6 py-8 overflow-auto bg-gray-50">
        {/* Header */}
        {dashboardData?.meta && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold theme-text mb-3">
              {dashboardData.meta.title}
            </h1>
            {dashboardData.meta.description && (
              <p className="text-gray-600 text-base leading-relaxed">
                {dashboardData.meta.description}
              </p>
            )}
          </div>
        )}

        {/* KPI Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          {kpiCards.map((kpi) => (
            <Col xs={24} sm={12} md={8} lg={6} key={kpi.key}>
              <Card
                className="shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-l-4 rounded-lg h-full"
                style={{
                  borderLeftColor: themeColor,
                  minHeight: '220px',
                }}
                onClick={() => kpi.cta && handleCTAClick(kpi.cta)}
                bodyStyle={{ padding: '24px', height: '100%', display: 'flex', flexDirection: 'column' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="p-2 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    {kpi.icon}
                  </div>
                </div>
                <div className="flex-grow mb-4">
                  <Statistic
                    title={
                      <span className="text-gray-600 font-medium text-sm mb-2 block">{kpi.title}</span>
                    }
                    value={kpi.value}
                    suffix={<span className="text-gray-500 text-base ml-1">{kpi.unit}</span>}
                    valueStyle={{
                      color: themeColor,
                      fontSize: '28px',
                      fontWeight: 'bold',
                      marginTop: '8px',
                    }}
                  />
                  {kpi.description && (
                    <p className="text-sm text-gray-500 mt-4 leading-relaxed">
                      {kpi.description}
                    </p>
                  )}
                </div>
                {(kpi.breakdown || kpi.secondary) && (
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    {kpi.breakdown && (
                      <div className="flex flex-wrap gap-4 mb-3">
                        {kpi.breakdown.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: themeColor }}
                            />
                            <span className="text-sm text-gray-600">
                              {item.label}: <strong className="ml-1">{item.value}</strong>
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {kpi.secondary && (
                      <div className="text-sm mt-2">
                        <span className="text-gray-600">{kpi.secondary.label}: </span>
                        <span
                          className="font-semibold ml-1"
                          style={{ color: themeColor }}
                        >
                          {kpi.secondary.value} {kpi.secondary.unit}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            </Col>
          ))}
      </Row>

      {/* Sections */}
      <Row gutter={[24, 24]}>
        {dashboardData.sections?.map((section) => {
          if (section.type === 'table') {
            let columns = [];
            let data = section.rows || [];

            if (section.key === 'upcoming_scheduled') {
              columns = upcomingScheduledColumns;
            } else if (section.key === 'open_repairs') {
              columns = openRepairsColumns;
            } else if (section.key === 'asset_health') {
              columns = assetHealthColumns;
              data = data.map((row) => ({
                ...row,
                key: row.asset_id || row.id,
              }));
            } else {
              // Generic table columns
              columns = section.columns?.map((col) => ({
                title: col.label,
                dataIndex: col.key,
                key: col.key,
              })) || [];
            }

            return (
              <Col xs={24} lg={12} key={section.key}>
                <Card
                  className="shadow-lg rounded-lg border-0 h-full"
                  extra={
                    section.cta && (
                      <ThemedButton
                        text={section.cta.label}
                        icon={<ArrowRight size={16} />}
                        variant="outlined"
                        onClick={() => handleCTAClick(section.cta)}
                        className="text-sm"
                      />
                    )
                  }
                  bodyStyle={{
                    padding: '24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      {section.description}
                    </p>
                  )}
                  <div className="flex-grow">
                    <ThemedTable
                      columns={columns}
                      data={data}
                      loading={loading}
                      pagination={false}
                      onRow={
                        section.key === 'asset_health'
                          ? (record) => ({
                              onClick: () => {
                                if (record.route) {
                                  navigate(record.route);
                                } else if (record.asset_id) {
                                  navigate(`/assets/${record.asset_id}`);
                                }
                              },
                              className: 'cursor-pointer hover:bg-gray-50 transition-colors',
                            })
                          : undefined
                      }
                    />
                  </div>
                </Card>
              </Col>
            );
          }

          if (section.type === 'list') {
            return (
              <Col xs={24} lg={12} key={section.key}>
                <Card
                  title={
                    <div>
                      <h3 className="text-lg font-semibold theme-text m-0">
                        {section.title}
                      </h3>
                    </div>
                  }
                  className="shadow-lg rounded-lg border-0 h-full"
                  extra={
                    section.cta && (
                      <ThemedButton
                        text={section.cta.label}
                        icon={<ArrowRight size={16} />}
                        variant="outlined"
                        onClick={() => handleCTAClick(section.cta)}
                        className="text-sm"
                      />
                    )
                  }
                  headStyle={{
                    borderBottom: `2px solid ${themeColor}20`,
                    padding: '20px 24px',
                    marginBottom: '0',
                  }}
                  bodyStyle={{
                    padding: '24px',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                      {section.description}
                    </p>
                  )}
                  {section.summary && (
                    <div className="mb-6 p-5 bg-gray-50 rounded-lg flex flex-wrap gap-6">
                      {Object.entries(section.summary).map(([key, value]) => (
                        <div key={key} className="text-sm">
                          <span className="font-medium capitalize text-gray-700">
                            {key.replace('_', ' ')}:
                          </span>{' '}
                          <span
                            className="font-semibold"
                            style={{ color: themeColor }}
                          >
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex-grow">
                    {section.items && section.items.length > 0 ? (
                      <div className="flex flex-col gap-3">
                        {section.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                            style={{ borderColor: `${themeColor}30` }}
                          >
                            {JSON.stringify(item)}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Empty description="No items available" />
                    )}
                  </div>
                </Card>
              </Col>
            );
          }

          if (section.type === 'charts') {
            return (
              <Col xs={24} key={section.key}>
                <Card
                  title={
                    <div>
                      <h3 className="text-lg font-semibold theme-text m-0">
                        {section.title}
                      </h3>
                    </div>
                  }
                  className="shadow-lg rounded-lg border-0"
                  headStyle={{
                    borderBottom: `2px solid ${themeColor}20`,
                    padding: '20px 24px',
                    marginBottom: '0',
                  }}
                  bodyStyle={{
                    padding: '24px',
                  }}
                >
              <Row gutter={[24, 24]}>
                {section.charts?.map((chart) => (
                  <Col xs={24} lg={12} key={chart.key}>
                    <Card
                      title={
                        <span className="font-medium theme-text">{chart.title}</span>
                      }
                      className="shadow-md rounded-lg border-0"
                      headStyle={{
                        borderBottom: `1px solid ${themeColor}15`,
                        padding: '16px 20px',
                        marginBottom: '0',
                      }}
                      bodyStyle={{
                        padding: '20px',
                      }}
                    >
                      <ResponsiveContainer width="100%" height={300}>
                        {chart.chart_type === 'stacked_bar' ? (
                          <BarChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey={chart.x_key} />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: `1px solid ${themeColor}30`,
                                borderRadius: '8px',
                              }}
                            />
                            <Legend />
                            {chart.series.map((series) => (
                              <Bar
                                key={series.key}
                                dataKey={series.key}
                                stackId="a"
                                fill={
                                  series.key === 'scheduled' ? themeColor : '#52c41a'
                                }
                                name={series.label}
                                radius={[4, 4, 0, 0]}
                              />
                            ))}
                          </BarChart>
                        ) : chart.chart_type === 'bar' ? (
                          <BarChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey={chart.x_key} />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: `1px solid ${themeColor}30`,
                                borderRadius: '8px',
                              }}
                            />
                            <Legend />
                            {chart.series.map((series, idx) => {
                              const colors = [
                                themeColor,
                                '#52c41a',
                                '#faad14',
                                '#13c2c2',
                              ];
                              return (
                                <Bar
                                  key={series.key}
                                  dataKey={series.key}
                                  fill={colors[idx % colors.length]}
                                  name={series.label}
                                  radius={[4, 4, 0, 0]}
                                />
                              );
                            })}
                          </BarChart>
                        ) : (
                          <LineChart data={chart.data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey={chart.x_key} />
                            <YAxis />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#fff',
                                border: `1px solid ${themeColor}30`,
                                borderRadius: '8px',
                              }}
                            />
                            <Legend />
                            {chart.series.map((series, idx) => {
                              const colors = [
                                themeColor,
                                '#52c41a',
                                '#faad14',
                                '#13c2c2',
                              ];
                              return (
                                <Line
                                  key={series.key}
                                  type="monotone"
                                  dataKey={series.key}
                                  stroke={colors[idx % colors.length]}
                                  strokeWidth={3}
                                  name={series.label}
                                  dot={{ fill: colors[idx % colors.length], r: 4 }}
                                  activeDot={{ r: 6 }}
                                />
                              );
                            })}
                          </LineChart>
                        )}
                      </ResponsiveContainer>
                    </Card>
                  </Col>
                ))}
              </Row>
                </Card>
              </Col>
            );
          }

          return null;
        })}
      </Row>
      </div>
    </ConfigProvider>
  );
};

export default Dashboard;
