import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { useAuthContext } from '../hooks/useAuthContext';
import ReportForm from '../components/ReportForm';
import { FiAlertCircle, FiMapPin } from 'react-icons/fi';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});
const categoryIcons = {
  road: new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),

  water: new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),

  electricity: new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),

  sanitation: new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  }),

  other: new L.Icon({
    iconUrl: 'https://maps.google.com/mapfiles/ms/icons/grey-dot.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  })
};


const MapClickHandler = ({ onMapClick }) => {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    }
  });
  return null;
};

const MapView = () => {
  const [reports, setReports] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await axios.get('/api/reports?limit=100');
      setReports(res.data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    if (user) {
      setSelectedLocation(latlng);
      setShowForm(true);
    }
  };

  const handleReportSubmitted = () => {
    setShowForm(false);
    setSelectedLocation(null);
    fetchReports();
  };

  const getCategoryColor = (category) => {
    const colors = {
      road: 'red',
      water: 'blue',
      electricity: 'yellow',
      sanitation: 'green',
      other: 'gray'
    };
    return colors[category] || 'gray';
  };

  const getSeverityIcon = (severity) => {
    const icons = {
      critical: '🔴',
      high: '🟠',
      medium: '🟡',
      low: '🟢'
    };
    return icons[severity] || '⚪';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen">
      <div className="absolute top-4 left-4 z-[1000] bg-white p-4 rounded-lg shadow-lg max-w-sm">
        <h2 className="text-lg font-semibold mb-2">Infrastructure Issues Map</h2>
        <p className="text-sm text-gray-600 mb-3">
          {user ? 'Click on the map to report a new issue' : 'Login to report issues'}
        </p>
        <div className="space-y-1 text-xs">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Road Issues
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Water Issues
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Electricity Issues
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Sanitation Issues
          </div>
        </div>
      </div>

      <MapContainer
        center={[28.6139, 77.2090]} // Default to a central location (adjust as needed)
        zoom={13}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {user && <MapClickHandler onMapClick={handleMapClick} />}
        {reports.map((report) => (
          <Marker
  key={report._id}
  position={[
    report.location.coordinates.lat,
    report.location.coordinates.lng
  ]}
  icon={categoryIcons[report.category] || categoryIcons.other}
>

            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm mb-1">{report.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className={`px-2 py-1 rounded ${getCategoryColor(report.category)}-100 text-${getCategoryColor(report.category)}-800`}>
                    {report.category}
                  </span>
                  <span>{getSeverityIcon(report.severity)} {report.severity}</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <FiMapPin className="inline mr-1" />
                  {report.votes} votes
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {showForm && selectedLocation && (
        <ReportForm
          location={selectedLocation}
          onClose={() => {
            setShowForm(false);
            setSelectedLocation(null);
          }}
          onSubmitted={handleReportSubmitted}
        />
      )}
    </div>
  );
};

export default MapView;

