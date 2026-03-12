import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Button } from '@carbon/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './BusinessMap.scss';

// Fix for default marker icons in Leaflet with Webpack/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons using divIcon for theme-aware styling
const createPropertyIcon = () => L.divIcon({
  className: 'custom-marker property-marker',
  html: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="var(--interactive-primary)" stroke="white" stroke-width="2"/>
      <path d="M16 9L10 14V22H14V18H18V22H22V14L16 9Z" fill="white"/>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const createVehicleIcon = () => L.divIcon({
  className: 'custom-marker vehicle-marker',
  html: `
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="16" cy="16" r="14" fill="#0f62fe" stroke="white" stroke-width="2"/>
      <path d="M10 14L12 10H20L22 14M10 14V20H12V22H14V20H18V22H20V20H22V14M10 14H22M12 16H14M18 16H20" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

// Component to auto-fit bounds to show all markers
function FitBounds({ markers }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers && markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
    }
  }, [markers, map]);
  
  return null;
}

FitBounds.propTypes = {
  markers: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  })).isRequired,
};

/**
 * BusinessMap Component
 * 
 * Interactive Leaflet map displaying properties and fleet vehicles
 * with custom markers, popups, and auto-fit bounds.
 * 
 * @param {Array} properties - Array of property objects with lat/lng
 * @param {Array} vehicles - Array of vehicle objects with lastKnownLocation.lat/lng
 * @param {Function} onMarkerClick - Callback when marker is clicked, receives (asset, type)
 * @param {Array} initialCenter - Initial map center [lat, lng] (default: CA center)
 * @param {Number} initialZoom - Initial zoom level (default: 7)
 */
export default function BusinessMap({
  properties = [],
  vehicles = [],
  onMarkerClick,
  initialCenter = [37.5, -121.5],
  initialZoom = 7,
}) {
  // Combine all markers for auto-fit bounds
  const allMarkers = [
    ...properties.map(p => ({ lat: p.lat, lng: p.lng })),
    ...vehicles.map(v => ({ 
      lat: v.lastKnownLocation?.lat, 
      lng: v.lastKnownLocation?.lng 
    })).filter(m => m.lat && m.lng),
  ];

  const propertyIcon = createPropertyIcon();
  const vehicleIcon = createVehicleIcon();

  return (
    <MapContainer
      center={initialCenter}
      zoom={initialZoom}
      className="business-map-container"
      scrollWheelZoom={true}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      {allMarkers.length > 0 && <FitBounds markers={allMarkers} />}
      
      {/* Property Markers */}
      {properties.map(property => (
        <Marker
          key={property.id}
          position={[property.lat, property.lng]}
          icon={propertyIcon}
        >
          <Popup className="map-popup">
            <div className="popup-content">
              <h4 className="popup-title">{property.name}</h4>
              <p className="popup-address">{property.address}</p>
              <p className="popup-type">Type: {property.propertyType}</p>
              <p className="popup-status">
                <span className={`status-badge status-${property.status.toLowerCase().replace(' ', '-')}`}>
                  {property.status}
                </span>
              </p>
              <Button
                size="sm"
                kind="primary"
                className="popup-button"
                onClick={() => onMarkerClick && onMarkerClick(property, 'property')}
              >
                View Details
              </Button>
            </div>
          </Popup>
        </Marker>
      ))}
      
      {/* Vehicle Markers */}
      {vehicles.map(vehicle => {
        if (!vehicle.lastKnownLocation?.lat || !vehicle.lastKnownLocation?.lng) {
          return null;
        }
        
        return (
          <Marker
            key={vehicle.id}
            position={[vehicle.lastKnownLocation.lat, vehicle.lastKnownLocation.lng]}
            icon={vehicleIcon}
          >
            <Popup className="map-popup">
              <div className="popup-content">
                <h4 className="popup-title">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </h4>
                <p className="popup-license">License: {vehicle.licensePlate}</p>
                <p className="popup-driver">Driver: {vehicle.assignedDriver}</p>
                <p className="popup-type">Type: {vehicle.vehicleType}</p>
                <p className="popup-status">
                  <span className={`status-badge status-${vehicle.status.toLowerCase().replace(' ', '-')}`}>
                    {vehicle.status}
                  </span>
                </p>
                <Button
                  size="sm"
                  kind="primary"
                  className="popup-button"
                  onClick={() => onMarkerClick && onMarkerClick(vehicle, 'vehicle')}
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

BusinessMap.propTypes = {
  properties: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string,
    propertyType: PropTypes.string,
    status: PropTypes.string,
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
  })),
  vehicles: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    make: PropTypes.string.isRequired,
    model: PropTypes.string.isRequired,
    year: PropTypes.number.isRequired,
    licensePlate: PropTypes.string,
    assignedDriver: PropTypes.string,
    vehicleType: PropTypes.string,
    status: PropTypes.string,
    lastKnownLocation: PropTypes.shape({
      lat: PropTypes.number.isRequired,
      lng: PropTypes.number.isRequired,
    }),
  })),
  onMarkerClick: PropTypes.func,
  initialCenter: PropTypes.arrayOf(PropTypes.number),
  initialZoom: PropTypes.number,
};
