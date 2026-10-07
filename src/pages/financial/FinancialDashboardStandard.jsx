import React, { useMemo, useState } from 'react';
import {
  Grid,
  Column,
  Tile,
  Heading,
  ContentSwitcher,
  Switch,
  Dropdown,
} from '@carbon/react';
import { Money, Receipt, Building, CarFront } from '@carbon/icons-react';
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
import './FinancialDashboardStandard.scss';

const CATEGORY_OPTIONS = ['all', 'Property', 'Auto'];
const regions = ['all', ...getRegions()];
const monthlyTrend = getMonthlyTrend();

export default function FinancialDashboardStandard() {
  const [basis, setBasis] = useState('gross');
  const [category, setCategory] = useState('all');
  const [region, setRegion] = useState('all');

  const totals = useMemo(() => getPortfolioTotals(basis), [basis]);
  const ledger = useMemo(
    () => filterLedger(assetLedger, { category, region }),
    [category, region]
  );

  return (
    <Grid fullWidth className="financial-dashboard-standard">
      <Column lg={16} md={8} sm={4} className="fds-header">
        <Heading className="fds-title">Insurance Financial Analytics Dashboard</Heading>
        <p className="fds-subtitle">
          Monitor premium collections, claim payouts, and asset performance across
          the Auto and Property portfolio.
        </p>
      </Column>

      <Column lg={16} md={8} sm={4} className="fds-filters">
        <ContentSwitcher
          selectedIndex={basis === 'gross' ? 0 : 1}
          onChange={({ index }) => setBasis(index === 0 ? 'gross' : 'net')}
          size="md"
          className="fds-basis-switcher"
        >
          <Switch name="gross" text="Gross" />
          <Switch name="net" text="Net" />
        </ContentSwitcher>

        <Dropdown
          id="region-filter"
          titleText=""
          label="Region"
          items={regions}
          itemToString={(item) => (item === 'all' ? 'All Regions' : item)}
          selectedItem={region}
          onChange={({ selectedItem }) => setRegion(selectedItem)}
          className="fds-region-dropdown"
        />
      </Column>

      <Column lg={4} md={4} sm={4}>
        <Tile className="fds-kpi-tile">
          <div className="fds-kpi-icon fds-kpi-icon--primary">
            <Money size={20} />
          </div>
          <p className="fds-kpi-label">Total Owed (YTD)</p>
          <h3 className="fds-kpi-value">{formatCurrency(totals.totalOwed, false)}</h3>
          <p className="fds-kpi-split">
            <span><Building size={14} /> {formatCurrency(totals.propertyOwed, false)}</span>
            <span><CarFront size={14} /> {formatCurrency(totals.autoOwed, false)}</span>
          </p>
        </Tile>
      </Column>

      <Column lg={4} md={4} sm={4}>
        <Tile className="fds-kpi-tile">
          <div className="fds-kpi-icon fds-kpi-icon--error">
            <Receipt size={20} />
          </div>
          <p className="fds-kpi-label">Total Claimed (YTD)</p>
          <h3 className="fds-kpi-value">{formatCurrency(totals.totalClaimed, false)}</h3>
          <p className="fds-kpi-split">
            <span><Building size={14} /> {formatCurrency(totals.propertyClaimed, false)}</span>
            <span><CarFront size={14} /> {formatCurrency(totals.autoClaimed, false)}</span>
          </p>
        </Tile>
      </Column>

      <Column lg={4} md={4} sm={4}>
        <Tile className="fds-kpi-tile">
          <div className="fds-kpi-icon fds-kpi-icon--info">
            <Building size={20} />
          </div>
          <p className="fds-kpi-label">Property Portfolio</p>
          <h3 className="fds-kpi-value">{formatCurrency(totals.propertyOwed, false)}</h3>
          <p className="fds-kpi-split">owed vs. {formatCurrency(totals.propertyClaimed, false)} claimed</p>
        </Tile>
      </Column>

      <Column lg={4} md={4} sm={4}>
        <Tile className="fds-kpi-tile">
          <div className="fds-kpi-icon fds-kpi-icon--success">
            <CarFront size={20} />
          </div>
          <p className="fds-kpi-label">Auto Portfolio</p>
          <h3 className="fds-kpi-value">{formatCurrency(totals.autoOwed, false)}</h3>
          <p className="fds-kpi-split">owed vs. {formatCurrency(totals.autoClaimed, false)} claimed</p>
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <Tile className="fds-chart-tile">
          <Heading className="fds-tile-title">Premiums &amp; Claims Trend</Heading>
          <TrendChart data={monthlyTrend} theme="standard" />
        </Tile>
      </Column>

      <Column lg={16} md={8} sm={4}>
        <Tile className="fds-table-tile">
          <div className="fds-table-header">
            <Heading className="fds-tile-title">Asset Performance Ledger</Heading>
            <ContentSwitcher
              selectedIndex={CATEGORY_OPTIONS.indexOf(category)}
              onChange={({ index }) => setCategory(CATEGORY_OPTIONS[index])}
              size="sm"
              className="fds-category-switcher"
            >
              <Switch name="all" text="All" />
              <Switch name="Property" text="Property" />
              <Switch name="Auto" text="Auto" />
            </ContentSwitcher>
          </div>
          <AssetLedgerTable assets={ledger} />
        </Tile>
      </Column>
    </Grid>
  );
}
