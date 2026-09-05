import PropTypes from "prop-types";
import { useRef , useEffect } from 'react'; 
import L from 'leaflet'
import 'leaflet/dist/leaflet.css';

const ActivityMap = ({ activityDetailData, loading }) => {
  // Refs for the map container and the map instance
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  // Initialize map function
  const initializeMap = (mapData) => {
    if (!mapData || !mapData.latitude || !mapData.longitude) return;

    // Initialize the map if it hasn't been initialized
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapContainerRef.current).setView([mapData.latitude, mapData.longitude], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      L.marker([mapData.latitude, mapData.longitude]).addTo(mapInstanceRef.current)
        .bindPopup(`${activityDetailData[0].trip.title}`)
        .openPopup();
    }
  };

  // Effect for initializing the map when activityDetailData changes
  useEffect(() => {
    if (activityDetailData && activityDetailData.length > 0) {
      const { map } = activityDetailData[0] || {};
      initializeMap(map);
    }

    // Cleanup function to remove map when component unmounts or data changes
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activityDetailData]);

  // Conditional rendering for loading and missing data
  if (loading) {
    return <p style={{ marginLeft: 'auto' }}>找不到活動資訊</p>;
  }

  if (!activityDetailData || activityDetailData.length === 0) {
    return <p style={{ marginLeft: 'auto' }}>找不到活動資訊</p>;
  }

  const { map } = activityDetailData[0] || {};
  if (!map || !map.latitude || !map.longitude) {
    return <p style={{ marginLeft: 'auto' }}>地圖資訊不可用</p>;
  }

  return <div ref={mapContainerRef} style={{ height: '500px' }}></div>;
};

ActivityMap.propTypes = {
  activityDetailData: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.shape({
        trip: PropTypes.shape({
          title: PropTypes.string.isRequired,
        }).isRequired,
        map: PropTypes.shape({
          latitude: PropTypes.string.isRequired,
          longitude: PropTypes.string.isRequired,
        }).isRequired,
      })
    )
  ]).isRequired,
  loading: PropTypes.bool,
};

export default ActivityMap;
