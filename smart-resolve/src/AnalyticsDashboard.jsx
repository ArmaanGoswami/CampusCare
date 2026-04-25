import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, ResponsiveContainer, Legend
} from 'recharts';

/* ── Colour palette — matches app CSS vars ───────────────────── */
// Neumorphic vibrant colors
const CATEGORY_COLORS = ['#8a9df0', '#b4c5ff', '#c4b5fd', '#fbcfe8', '#93c5fd'];
const PRIORITY_COLORS  = { High: '#ef4444', Medium: '#f59e0b', Low: '#10b981' };

/* ── Custom Tooltip ──────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: '12px', padding: '12px 16px',
      boxShadow: 'var(--neu-flat)',
      fontSize: '13px', color: 'var(--ink)',
      border: 'none'
    }}>
      <p style={{ margin: 0, fontWeight: 800 }}>{label || payload[0].name}</p>
      <p style={{ margin: '6px 0 0', color: 'var(--muted)' }}>
        Count: <strong style={{ color: 'var(--primary-dark)' }}>{payload[0].value}</strong>
      </p>
    </div>
  );
};

/* ── KPI Card ────────────────────────────────────────────────── */
const KpiCard = ({ label, value, icon, accentText }) => (
  <div className="tracker-card" style={{ flex: '1 1 160px', textAlign: 'center', minWidth: '140px', padding: '24px 16px' }}>
    <div style={{
      width: '48px', height: '48px', borderRadius: '50%',
      background: 'var(--surface)', display: 'grid', placeItems: 'center',
      fontSize: '24px', margin: '0 auto 16px',
      boxShadow: 'var(--neu-flat-sm)'
    }}>{icon}</div>
    <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
      {label}
    </p>
    <h2 style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: 800, color: accentText, lineHeight: 1 }}>
      {value}
    </h2>
  </div>
);

/* ── Chart Card ──────────────────────────────────────────────── */
const ChartCard = ({ title, children }) => (
  <div className="tracker-card" style={{ flex: '1 1 320px', minWidth: '260px', padding: '24px' }}>
    <h3 style={{
      margin: '0 0 24px', fontSize: '16px', fontWeight: 800,
      color: 'var(--ink)', letterSpacing: '0.02em', textAlign: 'center'
    }}>
      {title}
    </h3>
    {children}
  </div>
);

/* ── Main Component ──────────────────────────────────────────── */
const AnalyticsDashboard = ({ issues = [] }) => {

  const stats = useMemo(() => {
    let highPriority = 0, resolved = 0;
    const categories = {};
    const priorities = {};
    const workers = {};

    issues.forEach(issue => {
      if (issue.priority === 'High') highPriority++;
      if (issue.status === 'Resolved') resolved++;

      const cat = issue.category || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;

      const pri = issue.priority || 'Medium';
      priorities[pri] = (priorities[pri] || 0) + 1;

      // Track worker performance
      if (issue.worker) {
        if (!workers[issue.worker]) {
          workers[issue.worker] = { total: 0, resolved: 0 };
        }
        workers[issue.worker].total++;
        if (issue.status === 'Resolved') {
          workers[issue.worker].resolved++;
        }
      }
    });

    const categoryData = Object.entries(categories).map(([name, value]) => ({ name, value }));
    const priorityData = ['High', 'Medium', 'Low']
      .filter(p => priorities[p])
      .map(name => ({ name, count: priorities[name] }));
    
    const workerData = Object.entries(workers)
      .map(([name, stats]) => ({
        name,
        total: stats.total,
        resolved: stats.resolved,
        efficiency: Math.round((stats.resolved / stats.total) * 100)
      }))
      .sort((a, b) => b.resolved - a.resolved);

    return { total: issues.length, highPriority, resolved, categoryData, priorityData, workerData };
  }, [issues]);

  const kpis = [
    { label: 'Total Complaints', value: stats.total,        icon: '📋', accentText: 'var(--primary-dark)' },
    { label: 'High Priority',    value: stats.highPriority,  icon: '🚨', accentText: 'var(--red)' },
    { label: 'Total Resolved',   value: stats.resolved,      icon: '✅', accentText: 'var(--green)' },
  ];

  const noDataMsg = (
    <p style={{ textAlign: 'center', marginTop: '60px', color: 'var(--muted)', fontSize: '14px', fontWeight: 700 }}>
      No data yet — submit a complaint first!
    </p>
  );

  return (
    <div className="screen-wrap">

      {/* Header */}
      <div className="screen-head">
        <h2>📊 Analytics</h2>
        <p>Live overview of all complaints across campus</p>
      </div>

      {/* KPI Row */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '32px' }}>
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts Row */}
      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>

        {/* Pie — Category */}
        <ChartCard title="Issues by Category">
          {stats.categoryData.length === 0 ? noDataMsg : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%" cy="45%"
                  outerRadius={90}
                  innerRadius={50}
                  dataKey="value"
                  paddingAngle={4}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={true}
                  stroke="none"
                >
                  {stats.categoryData.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={10}
                  wrapperStyle={{ fontSize: '13px', color: 'var(--ink2)', paddingTop: '16px', fontWeight: 700 }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        {/* Bar — Priority */}
        <ChartCard title="Issues by Priority">
          {stats.priorityData.length === 0 ? noDataMsg : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={stats.priorityData} barSize={56}>
                <CartesianGrid strokeDasharray="4 4" stroke="rgba(138, 157, 240, 0.15)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--ink2)', fontSize: 13, fontWeight: 800 }}
                  axisLine={false} tickLine={false}
                  dy={10}
                />
                <YAxis
                  tick={{ fill: 'var(--muted)', fontSize: 12, fontWeight: 700 }}
                  axisLine={false} tickLine={false}
                  allowDecimals={false}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(138, 157, 240, 0.08)' }} />
                <Bar dataKey="count" radius={[12, 12, 12, 12]}>
                  {stats.priorityData.map(entry => (
                    <Cell key={entry.name} fill={PRIORITY_COLORS[entry.name] || 'var(--primary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

      </div>

      {/* Worker Performance Section */}
      {stats.workerData.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{
            margin: '0 0 20px', fontSize: '16px', fontWeight: 800,
            color: 'var(--ink)', letterSpacing: '0.02em'
          }}>
            👷 Worker Performance
          </h3>
          <div style={{ 
            display: 'grid', gap: '12px',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))'
          }}>
            {stats.workerData.map((worker) => (
              <div key={worker.name} className="tracker-card" style={{ padding: '20px' }}>
                <div style={{ marginBottom: '12px' }}>
                  <h4 style={{ margin: '0 0 8px', fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>
                    {worker.name}
                  </h4>
                  <div style={{ display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <div>
                      <p style={{ margin: '0 0 4px', color: 'var(--muted)', fontWeight: 600 }}>Issues Resolved</p>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--green)' }}>
                        {worker.resolved}/{worker.total}
                      </p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 4px', color: 'var(--muted)', fontWeight: 600 }}>Efficiency</p>
                      <p style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--primary-dark)' }}>
                        {worker.efficiency}%
                      </p>
                    </div>
                  </div>
                </div>
                <div style={{
                  width: '100%', height: '6px', borderRadius: '3px',
                  background: 'var(--bg)', overflow: 'hidden', boxShadow: 'var(--neu-inset-sm)'
                }}>
                  <div style={{
                    width: `${worker.efficiency}%`,
                    height: '100%', background: 'var(--green)',
                    borderRadius: '3px', transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
