import React, { useState } from 'react';
import { PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, ZAxis, Tooltip } from 'recharts';
import './WildDashboard.scss';

export default function WildDashboard({ stats, assets, chartData }) {
  const [sortBy, setSortBy] = useState('name');
  const [hoverCard, setHoverCard] = useState(null);

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === 'claims') return b.totalClaims - a.totalClaims;
    if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
    return a.name.localeCompare(b.name);
  });

  const portfolioBreakdown = [
    { name: 'Auto', value: stats.autoBreakdown, fill: '#0f62fe' },
    { name: 'Property', value: stats.propertyBreakdown, fill: '#24a148' },
  ];

  const riskData = sortedAssets.map(asset => ({
    name: asset.name.substring(0, 8),
    premium: asset.premiumDue,
    claims: asset.totalClaims,
    ratio: (asset.totalClaims / asset.premiumDue).toFixed(2),
  }));

  const radarData = [
    { category: 'Total Owed', value: stats.totalOwed / 10000 },
    { category: 'Total Claims', value: stats.totalClaimed / 10000 },
    { category: 'Auto Premium', value: stats.autoBreakdown / 10000 },
    { category: 'Prop Premium', value: stats.propertyBreakdown / 10000 },
  ];

  return (
    <div className="wild-dashboard">
      <div className="wild-header">
        <div className="hero-stat">
          <div className="stat-pulse">${(stats.totalOwed / 1000000).toFixed(1)}M</div>
          <div className="stat-label-wild">Portfolio Value</div>
        </div>
      </div>

      <div className="dashboard-grid-wild">
        <div className="card-wild portfolio-breakdown">
          <h3>Portfolio Split</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={portfolioBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: $${(value / 1000).toFixed(0)}K`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {portfolioBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card-wild risk-matrix">
          <h3>Risk Matrix</h3>
          <ResponsiveContainer width="100%" height={250}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
              <XAxis type="number" dataKey="premium" name="Premium" stroke="var(--text-tertiary)" />
              <YAxis type="number" dataKey="claims" name="Claims" stroke="var(--text-tertiary)" />
              <ZAxis type="number" dataKey="ratio" range={[50, 400]} name="Ratio" />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="Assets" data={riskData} fill="#da1e28" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="card-wild radar-analysis">
          <h3>Portfolio Radar</h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-subtle)" />
              <PolarAngleAxis dataKey="category" stroke="var(--text-tertiary)" />
              <PolarRadiusAxis stroke="var(--text-tertiary)" />
              <Radar name="Metrics" dataKey="value" stroke="#0f62fe" fill="#0f62fe" fillOpacity={0.6} />
              <Tooltip formatter={(value) => `$${(value * 10000).toLocaleString()}`} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card-wild quick-stats">
          <h3>Quick Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-box">
              <div className="metric-title">Loss Ratio</div>
              <div className="metric-big">{((stats.totalClaimed / stats.totalOwed) * 100).toFixed(0)}%</div>
            </div>
            <div className="metric-box">
              <div className="metric-title">Assets</div>
              <div className="metric-big">{assets.length}</div>
            </div>
            <div className="metric-box">
              <div className="metric-title">Active Claims</div>
              <div className="metric-big">{assets.reduce((sum, a) => sum + a.claimHistory, 0)}</div>
            </div>
            <div className="metric-box">
              <div className="metric-title">Avg Premium</div>
              <div className="metric-big">${(stats.totalOwed / assets.length / 1000).toFixed(0)}K</div>
            </div>
          </div>
        </div>
      </div>

      <div className="asset-cards-wild">
        <div className="asset-list-header">
          <h3>Asset Performance</h3>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-wild">
            <option value="name">Sort by Name</option>
            <option value="claims">Highest Claims</option>
            <option value="dueDate">Due Soon</option>
          </select>
        </div>
        <div className="asset-cards-grid">
          {sortedAssets.map((asset, idx) => (
            <div
              key={asset.id}
              className="asset-card-wild"
              onMouseEnter={() => setHoverCard(idx)}
              onMouseLeave={() => setHoverCard(null)}
            >
              <div className="card-accent" style={{
                background: asset.category === 'Auto' ? '#0f62fe' : '#24a148'
              }}></div>
              <div className="card-content">
                <div className="card-badge">{asset.category}</div>
                <h4>{asset.name}</h4>
                <div className="card-stat">
                  <span className="label">Premium</span>
                  <span className="value">${asset.premiumDue.toLocaleString()}</span>
                </div>
                <div className="card-stat">
                  <span className="label">Claims</span>
                  <span className="value danger">${asset.totalClaims.toLocaleString()}</span>
                </div>
                <div className="card-stat">
                  <span className="label">Due</span>
                  <span className="value">{new Date(asset.dueDate).toLocaleDateString()}</span>
                </div>
                {hoverCard === idx && (
                  <button className="card-action">View Details →</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
