/**
 * Financial Dashboard Data
 *
 * Derives the Insurance Financial Analytics Dashboard (IFAD) data model
 * from the existing business mock data (properties, vehicles, claims)
 * so the dashboard reflects the same underlying portfolio used elsewhere
 * in the app instead of introducing a second, disconnected dataset.
 */

import {
  mockProperties,
  mockVehicles,
  mockBusinessClaims,
  getClaimsForAsset,
} from './businessMockData';

const NET_PREMIUM_FACTOR = 0.85; // ceding commission / reinsurance adjustment
const NET_CLAIMS_FACTOR = 0.95; // subrogation / recovery adjustment

// =============================================================================
// PORTFOLIO TOTALS
// =============================================================================

export function getPropertyOwedYTD() {
  return mockProperties.reduce((sum, p) => sum + p.yearlyPremium, 0);
}

export function getAutoOwedYTD() {
  return mockVehicles.reduce((sum, v) => sum + v.yearlyPremium, 0);
}

function claimYear(claim) {
  return claim.incidentDate.slice(0, 4);
}

const LATEST_YEAR = mockBusinessClaims
  .map(claimYear)
  .sort()
  .at(-1);

export function getPropertyClaimedYTD() {
  return mockBusinessClaims
    .filter((c) => c.assetType === 'property' && claimYear(c) === LATEST_YEAR)
    .reduce((sum, c) => sum + c.claimAmount, 0);
}

export function getAutoClaimedYTD() {
  return mockBusinessClaims
    .filter((c) => c.assetType === 'vehicle' && claimYear(c) === LATEST_YEAR)
    .reduce((sum, c) => sum + c.claimAmount, 0);
}

export function getPortfolioTotals(basis = 'gross') {
  const factor = basis === 'net' ? NET_PREMIUM_FACTOR : 1;
  const claimsFactor = basis === 'net' ? NET_CLAIMS_FACTOR : 1;

  const propertyOwed = getPropertyOwedYTD() * factor;
  const autoOwed = getAutoOwedYTD() * factor;
  const propertyClaimed = getPropertyClaimedYTD() * claimsFactor;
  const autoClaimed = getAutoClaimedYTD() * claimsFactor;

  return {
    totalOwed: propertyOwed + autoOwed,
    totalClaimed: propertyClaimed + autoClaimed,
    propertyOwed,
    autoOwed,
    propertyClaimed,
    autoClaimed,
    year: LATEST_YEAR,
  };
}

// =============================================================================
// REGIONS (vehicles are assigned the nearest property's city so both asset
// types can be filtered by the same region list)
// =============================================================================

function distance(lat1, lng1, lat2, lng2) {
  return Math.hypot(lat1 - lat2, lng1 - lng2);
}

function nearestCity(lat, lng) {
  let closest = mockProperties[0];
  let closestDistance = Infinity;
  for (const property of mockProperties) {
    const d = distance(lat, lng, property.lat, property.lng);
    if (d < closestDistance) {
      closestDistance = d;
      closest = property;
    }
  }
  return closest.city;
}

export function getRegions() {
  const cities = new Set(mockProperties.map((p) => p.city));
  return Array.from(cities).sort();
}

// =============================================================================
// ASSET PERFORMANCE LEDGER
// =============================================================================

function nextDueDate(seed) {
  const day = (seed % 28) + 1;
  return new Date(2024, 3, day); // April 2024
}

function buildLedger() {
  const propertyRows = mockProperties.map((property, index) => ({
    id: property.id,
    name: property.name,
    category: 'Property',
    region: property.city,
    premiumDue: property.monthlyPremium,
    dueDate: nextDueDate(index + 1),
    totalClaims: getClaimsForAsset(property.id).reduce(
      (sum, c) => sum + c.claimAmount,
      0
    ),
    claimsCount: getClaimsForAsset(property.id).length,
    detailPath: `/business/properties/${property.id}`,
  }));

  const vehicleRows = mockVehicles.map((vehicle, index) => ({
    id: vehicle.id,
    name: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
    category: 'Auto',
    region: nearestCity(vehicle.lastKnownLocation.lat, vehicle.lastKnownLocation.lng),
    premiumDue: vehicle.monthlyPremium,
    dueDate: nextDueDate(propertyRows.length + index + 1),
    totalClaims: getClaimsForAsset(vehicle.id).reduce(
      (sum, c) => sum + c.claimAmount,
      0
    ),
    claimsCount: getClaimsForAsset(vehicle.id).length,
    detailPath: `/business/fleet/${vehicle.id}`,
  }));

  return [...propertyRows, ...vehicleRows];
}

export const assetLedger = buildLedger();

export function filterLedger(ledger, { category = 'all', region = 'all' } = {}) {
  return ledger.filter((row) => {
    const matchesCategory = category === 'all' || row.category === category;
    const matchesRegion = region === 'all' || row.region === region;
    return matchesCategory && matchesRegion;
  });
}

// =============================================================================
// MONTHLY TREND SERIES (premium + claims by month)
// =============================================================================

function monthRange(startYear, startMonth, endYear, endMonth) {
  const months = [];
  let year = startYear;
  let month = startMonth;
  while (year < endYear || (year === endYear && month <= endMonth)) {
    months.push({ year, month });
    month += 1;
    if (month > 12) {
      month = 1;
      year += 1;
    }
  }
  return months;
}

export function getMonthlyTrend() {
  const totalPropertyPremium = mockProperties.reduce(
    (sum, p) => sum + p.monthlyPremium,
    0
  );
  const totalAutoPremium = mockVehicles.reduce(
    (sum, v) => sum + v.monthlyPremium,
    0
  );

  const months = monthRange(2023, 1, 2024, 3);

  return months.map(({ year, month }) => {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    const claimsInMonth = mockBusinessClaims.filter((c) =>
      c.incidentDate.startsWith(key)
    );
    const propertyClaims = claimsInMonth
      .filter((c) => c.assetType === 'property')
      .reduce((sum, c) => sum + c.claimAmount, 0);
    const autoClaims = claimsInMonth
      .filter((c) => c.assetType === 'vehicle')
      .reduce((sum, c) => sum + c.claimAmount, 0);

    return {
      key,
      label: new Date(year, month - 1, 1).toLocaleDateString('en-US', {
        month: 'short',
        year: '2-digit',
      }),
      propertyPremiums: totalPropertyPremium,
      autoPremiums: totalAutoPremium,
      propertyClaims,
      autoClaims,
    };
  });
}
