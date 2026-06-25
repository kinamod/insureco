import React, { useState } from 'react';
import { DataTable, TableContainer, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Tag, Button } from '@carbon/react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './ConservativeDashboard.scss';

export default function ConservativeDashboard({ stats, assets, chartData }) {
  const [sortBy, setSortBy] = useState('name');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const sortedAssets = [...assets].sort((a, b) => {
    if (sortBy === 'claims') return b.totalClaims - a.totalClaims;
    if (sortBy === 'dueDate') return new Date(a.dueDate) - new Date(b.dueDate);
    return a.name.localeCompare(b.name);
  });

  const headers = [
    { key: 'name', header: 'Asset ID/Name' },
    { key: 'category', header: 'Category' },
    { key: 'premiumDue', header: 'Premium Due' },
    { key: 'dueDate', header: 'Due Date' },
    { key: 'totalClaims', header: 'Total Claims' },
    { key: 'actions', header: '' },
  ];

  const rows = sortedAssets.map(asset => ({
    id: asset.id,
    name: asset.name,
    category: asset.category,
    premiumDue: `$${asset.premiumDue.toLocaleString()}`,
    dueDate: new Date(asset.dueDate).toLocaleDateString(),
    totalClaims: `$${asset.totalClaims.toLocaleString()}`,
    asset,
  }));

  return (
    <div className="conservative-dashboard">
      <section className="kpi-section">
        <h2 className="section-title">Summary Statistics</h2>
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-label">Total Owed (YTD)</div>
            <div className="kpi-value">${(stats.totalOwed / 1000).toFixed(1)}K</div>
            <div className="kpi-meta">Aggregate Premiums</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Total Claimed (YTD)</div>
            <div className="kpi-value">${(stats.totalClaimed / 1000).toFixed(1)}K</div>
            <div className="kpi-meta">Aggregate Claims</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Auto Portfolio</div>
            <div className="kpi-value">${(stats.autoBreakdown / 1000).toFixed(1)}K</div>
            <div className="kpi-meta">Premium Split</div>
          </div>
          <div className="kpi-card">
            <div className="kpi-label">Property Portfolio</div>
            <div className="kpi-value">${(stats.propertyBreakdown / 1000).toFixed(1)}K</div>
            <div className="kpi-meta">Premium Split</div>
          </div>
        </div>
      </section>

      <section className="chart-section">
        <h2 className="section-title">Expense Visualization</h2>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="propertyPremiums" stroke="#0f62fe" name="Property Premiums" />
              <Line type="monotone" dataKey="propertyClaims" stroke="#da1e28" name="Property Claims" />
              <Line type="monotone" dataKey="autoPremiums" stroke="#24a148" name="Auto Premiums" />
              <Line type="monotone" dataKey="autoClaims" stroke="#f1c21b" name="Auto Claims" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="table-section">
        <h2 className="section-title">Asset Performance Ledger</h2>
        <div className="table-controls">
          <div className="sort-controls">
            <label>Sort by:</label>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
              <option value="name">Asset Name</option>
              <option value="claims">Highest Claims</option>
              <option value="dueDate">Due Date</option>
            </select>
          </div>
        </div>

        <div className="table-wrapper">
          <DataTable rows={rows} headers={headers} size="md">
            {({ rows: renderRows, headers: renderHeaders, getTableProps, getHeaderProps, getRowProps }) => (
              <TableContainer>
                <Table {...getTableProps()}>
                  <TableHead>
                    <TableRow>
                      {renderHeaders.map((header) => (
                        <TableHeader key={header.key} {...getHeaderProps({ header })}>
                          {header.header}
                        </TableHeader>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {renderRows.map((row) => (
                      <TableRow key={row.id} {...getRowProps({ row })}>
                        <TableCell>{row.cells[0].value}</TableCell>
                        <TableCell>
                          <Tag kind={row.cells[1].value === 'Auto' ? 'blue' : 'teal'}>
                            {row.cells[1].value}
                          </Tag>
                        </TableCell>
                        <TableCell>{row.cells[2].value}</TableCell>
                        <TableCell>{row.cells[3].value}</TableCell>
                        <TableCell>{row.cells[4].value}</TableCell>
                        <TableCell>
                          <Button kind="ghost" size="sm">View Details</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DataTable>
        </div>
      </section>
    </div>
  );
}
