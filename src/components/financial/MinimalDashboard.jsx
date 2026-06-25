import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './MinimalDashboard.scss';

export default function MinimalDashboard({ stats, assets, chartData }) {
  const [sortBy, setSortBy] = useState('name');

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === 'claims') return b.totalClaims - a.totalClaims;
    if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
    return a.name.localeCompare(b.name);
  });

  return (
    <div className="minimal-dashboard">
      <div className="stats-row">
        <div className="stat-item">
          <div className="stat-number">${(stats.totalOwed / 1000).toFixed(0)}K</div>
          <div className="stat-label">Total Owed</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">${(stats.totalClaimed / 1000).toFixed(0)}K</div>
          <div className="stat-label">Total Claimed</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">${(stats.autoBreakdown / 1000).toFixed(0)}K</div>
          <div className="stat-label">Auto</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">${(stats.propertyBreakdown / 1000).toFixed(0)}K</div>
          <div className="stat-label">Property</div>
        </div>
      </div>

      <div className="chart-minimal">
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0f62fe" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#0f62fe" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="none" vertical={false} stroke="var(--border-subtle)" />
            <XAxis dataKey="month" stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
            <YAxis stroke="var(--text-tertiary)" style={{ fontSize: '12px' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--background-secondary)', border: '1px solid var(--border-subtle)' }}
              formatter={(value) => `$${value.toLocaleString()}`}
            />
            <Area 
              type="monotone" 
              dataKey="propertyPremiums" 
              stroke="#0f62fe" 
              fillOpacity={1} 
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="table-minimal">
        <div className="table-header-minimal">
          <h3>Assets</h3>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-minimal">
            <option value="name">Name</option>
            <option value="claims">Claims</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
        <div className="table-rows-minimal">
          {sortedAssets.map(asset => (
            <div key={asset.id} className="table-row-minimal">
              <div className="row-main">
                <div>
                  <div className="row-name">{asset.name}</div>
                  <div className="row-meta">{asset.category} • Due {new Date(asset.dueDate).toLocaleDateString()}</div>
                </div>
                <div className="row-value">${asset.premiumDue.toLocaleString()}</div>
              </div>
              <div className="row-claims">${asset.totalClaims.toLocaleString()} in claims</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
