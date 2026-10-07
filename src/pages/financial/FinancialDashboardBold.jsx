import React, { useMemo, useState } from 'react';
import { Grid, Column, ContentSwitcher, Switch, Dropdown } from '@carbon/react';
import { ChartLineData, ArrowUp, Building, CarFront } from '@carbon/icons-react';
import TrendChart from '../../components/financial/TrendChart';
import AssetLedgerTable from '../../components/financial/AssetLedgerTable';
import {
  assetLedger,
  filterLedger,
  getRegions,
  getPortfolioTotals,
  getMonthlyTrend,
} from '../../data/financialDashboardData';
import { formatCurrency } from '../../utils/businessHelpers';
import './FinancialDashboardBold.scss';

const CATEGORY_OPTIONS = ['all', 'Property', 'Auto'];
const regions = ['all', ...getRegions()];
const monthlyTrend = getMonthlyTrend();

export default function FinancialDashboardBold() {
  const [basis, setBasis] = useState('gross');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');

  const totals = useMemo(() => getPortfolioTotals(basis), [basis]);
  const ledger = useMemo(
    () => filterLedger(assetLedger, { category, region }),
    [category, region]
  );

  const lossRatio = totals.totalOwed
    ? Math.round((totals.totalClaimed / totals.totalOwed) * 100)
    : 0;

  return (
    <div className="financial-dashboard-bold">
      <div className="fdb-hero">
        <p className="fdb-eyebrow">
          <ChartLineData size={16} /> Insurance Financial Analytics
        </p>
        <h1 className="fdb-title">Portfolio Pulse</h1>
        <p className="fdb-subtitle">
          A bolder read on premiums, payouts and where your risk is concentrated
          across Auto and Property.
        </p>
      </div>

      <Grid fullWidth className="fdb-grid">
        <Column lg={16} md={8} sm={4} className="fdb-filters">
          <ContentSwitcher
            selectedIndex={basis === 'gross' ? 0 : 1}
            onChange={({ index }) => setBasis(index === 0 ? 'gross' : 'net')}
            size="md"
            className="fdb-basis-switcher"
          >
            <Switch name="gross" text="Gross" />
            <Switch name="net" text="Net" />
          </ContentSwitcher>

          <Dropdown
            id="region-filter-bold"
            titleText=""
            label="Region"
            items={regions}
            itemToString={(item) => (item === 'all' ? 'All Regions' : item)}
            selectedItem={region}
            onChange={({ selectedItem }) => setRegion(selectedItem)}
            className="fdb-region-dropdown"
          />
        </Column>

        <Column lg={5} md={4} sm={4}>
          <div className="fdb-kpi-card fdb-kpi-card--owed">
            <p className="fdb-kpi-label">Total Owed (YTD)</p>
            <h2 className="fdb-kpi-value">{formatCurrency(totals.totalOwed, false)}</h2>
            <div className="fdb-kpi-bars">
              <div className="fdb-kpi-bar-row">
                <Building size={14} />
                <span>{formatCurrency(totals.propertyOwed, false)}</span>
              </div>
              <div className="fdb-kpi-bar-row">
                <CarFront size={14} />
                <span>{formatCurrency(totals.autoOwed, false)}</span>
              </div>
            </div>
          </div>
        </Column>

        <Column lg={5} md={4} sm={4}>
          <div className="fdb-kpi-card fdb-kpi-card--claimed">
            <p className="fdb-kpi-label">Total Claimed (YTD)</p>
            <h2 className="fdb-kpi-value">{formatCurrency(totals.totalClaimed, false)}</h2>
            <div className="fdb-kpi-bars">
              <div className="fdb-kpi-bar-row">
                <Building size={14} />
                <span>{formatCurrency(totals.propertyClaimed, false)}</span>
              </div>
              <div className="fdb-kpi-bar-row">
                <CarFront size={14} />
                <span>{formatCurrency(totals.autoClaimed, false)}</span>
              </div>
            </div>
          </div>
        </Column>

        <Column lg={6} md={8} sm={4}>
          <div className="fdb-kpi-card fdb-kpi-card--ratio">
            <p className="fdb-kpi-label">Loss Ratio</p>
            <h2 className="fdb-kpi-value">
              {lossRatio}%
              <ArrowUp size={20} className="fdb-kpi-ratio-icon" />
            </h2>
            <p className="fdb-kpi-caption">claimed vs. owed across the portfolio</p>
          </div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className="fdb-chart-card">
            <h3 className="fdb-card-title">Premiums &amp; Claims Trend</h3>
            <TrendChart data={monthlyTrend} theme="bold" />
          </div>
        </Column>

        <Column lg={16} md={8} sm={4}>
          <div className="fdb-table-card">
            <div className="fdb-table-header">
              <h3 className="fdb-card-title">Asset Performance Ledger</h3>
              <ContentSwitcher
                selectedIndex={CATEGORY_OPTIONS.indexOf(category)}
                onChange={({ index }) => setCategory(CATEGORY_OPTIONS[index])}
                size="sm"
                className="fdb-category-switcher"
              >
                <Switch name="all" text="All" />
                <Switch name="Property" text="Property" />
                <Switch name="Auto" text="Auto" />
              </ContentSwitcher>
            </div>
            <AssetLedgerTable assets={ledger} />
          </div>
        </Column>
      </Grid>
    </div>
  );
}
