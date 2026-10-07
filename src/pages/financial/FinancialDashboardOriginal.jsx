import React, { useMemo, useState } from 'react';
import { ContentSwitcher, Switch, Dropdown } from '@carbon/react';
import { Money, Receipt, Building, CarFront, Activity } from '@carbon/icons-react';
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
import './FinancialDashboardOriginal.scss';

const CATEGORY_OPTIONS = ['all', 'Property', 'Auto'];
const regions = ['all', ...getRegions()];
const monthlyTrend = getMonthlyTrend();

export default function FinancialDashboardOriginal() {
  const [basis, setBasis] = useState('gross');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');

  const totals = useMemo(() => getPortfolioTotals(basis), [basis]);
  const ledger = useMemo(
    () => filterLedger(assetLedger, { category, region }),
    [category, region]
  );

  const lossRatio = totals.totalOwed
    ? Math.min(100, Math.round((totals.totalClaimed / totals.totalOwed) * 100))
    : 0;
  const gaugeCircumference = 2 * Math.PI * 54;
  const gaugeOffset = gaugeCircumference * (1 - lossRatio / 100);

  return (
    <div className="financial-dashboard-original">
      <div className="fdo-scanline" aria-hidden="true" />

      <header className="fdo-header">
        <p className="fdo-kicker">// IFAD Command Center</p>
        <h1 className="fdo-title">Portfolio Signal</h1>
        <p className="fdo-subtitle">
          Live read on premium inflow, claim burn, and asset risk across the
          Auto &amp; Property book.
        </p>
      </header>

      <div className="fdo-filters">
        <ContentSwitcher
          selectedIndex={basis === 'gross' ? 0 : 1}
          onChange={({ index }) => setBasis(index === 0 ? 'gross' : 'net')}
          size="md"
          className="fdo-basis-switcher"
        >
          <Switch name="gross" text="Gross" />
          <Switch name="net" text="Net" />
        </ContentSwitcher>

        <Dropdown
          id="region-filter-original"
          titleText=""
          label="Region"
          items={regions}
          itemToString={(item) => (item === 'all' ? 'All Regions' : item)}
          selectedItem={region}
          onChange={({ selectedItem }) => setRegion(selectedItem)}
          className="fdo-region-dropdown"
        />

        <ContentSwitcher
          selectedIndex={CATEGORY_OPTIONS.indexOf(category)}
          onChange={({ index }) => setCategory(CATEGORY_OPTIONS[index])}
          size="md"
          className="fdo-category-switcher"
        >
          <Switch name="all" text="All" />
          <Switch name="Property" text="Property" />
          <Switch name="Auto" text="Auto" />
        </ContentSwitcher>
      </div>

      <div className="fdo-bento">
        <div className="fdo-cell fdo-cell--owed">
          <Money size={20} className="fdo-cell-icon" />
          <p className="fdo-cell-label">Total Owed</p>
          <h2 className="fdo-cell-value">{formatCurrency(totals.totalOwed, false)}</h2>
          <div className="fdo-cell-split">
            <span><Building size={12} /> {formatCurrency(totals.propertyOwed, false)}</span>
            <span><CarFront size={12} /> {formatCurrency(totals.autoOwed, false)}</span>
          </div>
        </div>

        <div className="fdo-cell fdo-cell--claimed">
          <Receipt size={20} className="fdo-cell-icon" />
          <p className="fdo-cell-label">Total Claimed</p>
          <h2 className="fdo-cell-value">{formatCurrency(totals.totalClaimed, false)}</h2>
          <div className="fdo-cell-split">
            <span><Building size={12} /> {formatCurrency(totals.propertyClaimed, false)}</span>
            <span><CarFront size={12} /> {formatCurrency(totals.autoClaimed, false)}</span>
          </div>
        </div>

        <div className="fdo-cell fdo-cell--gauge">
          <p className="fdo-cell-label">
            <Activity size={16} /> Loss Ratio
          </p>
          <svg viewBox="0 0 120 120" className="fdo-gauge">
            <circle cx="60" cy="60" r="54" className="fdo-gauge-track" />
            <circle
              cx="60"
              cy="60"
              r="54"
              className="fdo-gauge-value"
              strokeDasharray={gaugeCircumference}
              strokeDashoffset={gaugeOffset}
            />
            <text x="60" y="66" textAnchor="middle" className="fdo-gauge-text">
              {lossRatio}%
            </text>
          </svg>
        </div>

        <div className="fdo-cell fdo-cell--chart">
          <p className="fdo-cell-label">Premiums &amp; Claims Trend</p>
          <TrendChart data={monthlyTrend} theme="radical" />
        </div>

        <div className="fdo-cell fdo-cell--table">
          <p className="fdo-cell-label">Asset Performance Ledger</p>
          <AssetLedgerTable assets={ledger} className="fdo-ledger" />
        </div>
      </div>
    </div>
  );
}
