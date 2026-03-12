import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Column, Heading, Tile, Toggle } from '@carbon/react';
import { Building, DeliveryTruck } from '@carbon/icons-react';
import { mockProperties, mockVehicles } from '../../data/businessMockData';
import BusinessMap from '../../components/business/BusinessMap';
import './BusinessMapPage.scss';

/**
 * BusinessMapPage Component
 * 
 * Interactive map view page for visualizing business properties and fleet vehicles.
 * Replaces the "Coming Soon" placeholder for /business/map route.
 * 
 * Features:
 * - Leaflet map with OpenStreetMap tiles
 * - Custom markers for properties (red) and vehicles (blue)
 * - Filter controls to show/hide properties and vehicles
 * - Click markers to navigate to detail pages
 * - Theme-aware styling (works in light and dark modes)
 * - Responsive layout (mobile, tablet, desktop)
 */
export default function BusinessMapPage() {
  const navigate = useNavigate();
  
  // Filter state
  const [showProperties, setShowProperties] = useState(true);
  const [showVehicles, setShowVehicles] = useState(true);

  /**
   * Handle marker click - navigate to detail page
   * @param {Object} asset - Property or vehicle object
   * @param {String} type - 'property' or 'vehicle'
   */
  const handleMarkerClick = (asset, type) => {
    if (type === 'property') {
      navigate(`/business/properties/${asset.id}`);
    } else if (type === 'vehicle') {
      navigate(`/business/fleet/${asset.id}`);
    }
  };

  // Filter data based on toggle state
  const filteredProperties = showProperties ? mockProperties : [];
  const filteredVehicles = showVehicles ? mockVehicles : [];

  // Calculate counts
  const totalAssets = mockProperties.length + mockVehicles.length;
  const visibleAssets = filteredProperties.length + filteredVehicles.length;

  return (
    <Grid fullWidth className="business-map-page">
      {/* Page Header */}
      <Column lg={16}>
        <div className="map-page-header">
          <Heading className="page-title">Map View</Heading>
          <p className="page-description">
            Visualize your business properties and fleet vehicle locations across California
          </p>
        </div>
      </Column>

      {/* Map Controls and Legend */}
      <Column lg={16}>
        <Tile className="map-controls">
          <div className="controls-wrapper">
            {/* Filter Toggles */}
            <div className="toggle-group">
              <Toggle
                id="toggle-properties"
                labelText="Show Properties"
                toggled={showProperties}
                onToggle={(checked) => setShowProperties(checked)}
                size="sm"
              />
              <Toggle
                id="toggle-vehicles"
                labelText="Show Vehicles"
                toggled={showVehicles}
                onToggle={(checked) => setShowVehicles(checked)}
                size="sm"
              />
            </div>
            
            {/* Legend */}
            <div className="legend">
              <div className="legend-header">
                <span className="legend-title">Legend</span>
                <span className="asset-count">
                  Showing {visibleAssets} of {totalAssets} assets
                </span>
              </div>
              <div className="legend-items">
                <div className={`legend-item ${!showProperties ? 'disabled' : ''}`}>
                  <Building size={20} className="legend-icon property-icon" />
                  <span className="legend-label">
                    Properties ({mockProperties.length})
                  </span>
                </div>
                <div className={`legend-item ${!showVehicles ? 'disabled' : ''}`}>
                  <DeliveryTruck size={20} className="legend-icon vehicle-icon" />
                  <span className="legend-label">
                    Vehicles ({mockVehicles.length})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Tile>
      </Column>

      {/* Map Container */}
      <Column lg={16}>
        <div className="map-wrapper">
          {visibleAssets === 0 ? (
            <Tile className="no-assets-message">
              <div className="no-assets-content">
                <Heading className="no-assets-title">No assets to display</Heading>
                <p className="no-assets-text">
                  Please enable at least one asset type (Properties or Vehicles) using the toggles above.
                </p>
              </div>
            </Tile>
          ) : (
            <BusinessMap
              properties={filteredProperties}
              vehicles={filteredVehicles}
              onMarkerClick={handleMarkerClick}
              initialCenter={[37.5, -121.5]}
              initialZoom={7}
            />
          )}
        </div>
      </Column>

      {/* Info Panel */}
      <Column lg={16}>
        <Tile className="info-panel">
          <div className="info-content">
            <div className="info-section">
              <h4 className="info-title">How to use this map</h4>
              <ul className="info-list">
                <li>Click on any marker to view asset details in a popup</li>
                <li>Click "View Details" in the popup to navigate to the full asset page</li>
                <li>Use the toggles above to show or hide properties and vehicles</li>
                <li>Zoom and pan to explore different areas</li>
                <li>The map automatically fits all visible markers on load</li>
              </ul>
            </div>
            <div className="info-section">
              <h4 className="info-title">Asset Summary</h4>
              <div className="summary-stats">
                <div className="stat-item">
                  <span className="stat-label">Total Properties:</span>
                  <span className="stat-value">{mockProperties.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Vehicles:</span>
                  <span className="stat-value">{mockVehicles.length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Assets:</span>
                  <span className="stat-value">{totalAssets}</span>
                </div>
              </div>
            </div>
          </div>
        </Tile>
      </Column>
    </Grid>
  );
}
