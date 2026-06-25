import React, { useState, useMemo } from 'react';
import { Button } from '@carbon/react';
import { mockAssets, mockChartData } from '../data/financialData';
import ConservativeDashboard from '../components/financial/ConservativeDashboard';
import MinimalDashboard from '../components/financial/MinimalDashboard';
import WildDashboard from '../components/financial/WildDashboard';
import './FinancialDashboardPage.scss';

export default function FinancialDashboardPage() {
  const [design, setDesign] = useState('conservative');
  const [grossVsNet, setGrossVsNet] = useState('gross');
  const [selectedAsset, setSelectedAsset] = useState(null);

  const stats = useMemo(() => {
    const totalOwed = mockAssets.reduce((sum, a) => sum + a.premiumDue, 0);
    const totalClaimed = mockAssets.reduce((sum, a) => sum + a.totalClaims, 0);
    const autoBreakdown = mockAssets
      .filter(a => a.category === 'Auto')
      .reduce((sum, a) => sum + a.premiumDue, 0);
    const propertyBreakdown = mockAssets
      .filter(a => a.category === 'Property')
      .reduce((sum, a) => sum + a.premiumDue, 0);

    return { totalOwed, totalClaimed, autoBreakdown, propertyBreakdown };
  }, []);

  const renderDashboard = () => {
    const props = { stats, assets: mockAssets, chartData: mockChartData, grossVsNet };

    switch (design) {
      case 'minimal':
        return <MinimalDashboard {...props} />;
      case 'wild':
        return <WildDashboard {...props} />;
      default:
        return <ConservativeDashboard {...props} />;
    }
  };

  return (
    <div className="financial-dashboard-page">
      <div className="financial-dashboard-header">
        <div>
          <h1 className="page-title">Financial Dashboard</h1>
          <p className="page-description">Insurance Financial Analytics Dashboard (IFAD)</p>
        </div>
        <div className="dashboard-controls">
          <div className="design-switcher">
            <label className="design-label">Design Version:</label>
            <div className="design-buttons">
              <button
                className={`design-button ${design === 'conservative' ? 'active' : ''}`}
                onClick={() => setDesign('conservative')}
              >
                Conservative
              </button>
              <button
                className={`design-button ${design === 'minimal' ? 'active' : ''}`}
                onClick={() => setDesign('minimal')}
              >
                Minimal
              </button>
              <button
                className={`design-button ${design === 'wild' ? 'active' : ''}`}
                onClick={() => setDesign('wild')}
              >
                Wild
              </button>
            </div>
          </div>
          <Button
            kind="secondary"
            size="sm"
            onClick={() => setGrossVsNet(prev => prev === 'gross' ? 'net' : 'gross')}
          >
            {grossVsNet === 'gross' ? 'Gross View' : 'Net View'}
          </Button>
        </div>
      </div>

      <div className="financial-dashboard-content">
        {renderDashboard()}
      </div>
    </div>
  );
}
