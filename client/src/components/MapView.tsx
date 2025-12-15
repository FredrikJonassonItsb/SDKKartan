import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapData, ConnectionStatus } from '@/types/data';
import { loadMunicipalitiesGeoJSON, loadRegionsGeoJSON } from '@/lib/geoLoader';

// Funktion för att skapa färgade ikoner
const createColoredIcon = (color: string) => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
      <circle cx="12" cy="10" r="3" fill="white"></circle>
    </svg>`;
  
  return L.divIcon({
    className: 'custom-marker-icon',
    html: svg,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

interface MapViewProps {
  data: MapData;
  viewMode: 'municipalities' | 'regions' | 'authorities' | 'others';
  onSelect: (item: any) => void;
  searchTerm?: string;
  filters?: {
    hubs: boolean;
    connected: boolean;
    qa: boolean;
    started: boolean;
    none: boolean;
  };
}

export function MapView({ data, viewMode, onSelect, searchTerm, filters }: MapViewProps) {
  const [geoData, setGeoData] = useState<any>(null);
  const [regionGeoData, setRegionGeoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonRef = useRef<L.GeoJSON | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const muniData = await loadMunicipalitiesGeoJSON();
      const regData = await loadRegionsGeoJSON();
      setGeoData(muniData);
      setRegionGeoData(regData);
      setLoading(false);
    }
    loadData();
  }, []);

  // Hantera sökning och zoom
  useEffect(() => {
    if (!searchTerm || !mapRef.current) return;

    const term = searchTerm.toLowerCase();
    let foundLayer: any = null;

    // Sök i GeoJSON-lager (kommuner/regioner) om det finns
    if (geoJsonRef.current) {
      geoJsonRef.current.eachLayer((layer: any) => {
        const props = layer.feature.properties;
        const name = props.kom_namn || props.lan_namn;
        if (name && name.toLowerCase().includes(term)) {
          foundLayer = layer;
        }
      });
    }

    if (foundLayer) {
      mapRef.current.fitBounds(foundLayer.getBounds(), { padding: [50, 50], maxZoom: 10 });
      foundLayer.openPopup();
      
      // Hitta matchande dataobjekt för att trigga onSelect
      const props = foundLayer.feature.properties;
      const name = props.kom_namn || props.lan_namn;
      const item = [...data.municipalities, ...data.regions].find(i => i.name === name);
      if (item) onSelect(item);
    } else {
      // Sök bland organisationer (markörer)
      const org = data.organizations.find(o => o.name.toLowerCase().includes(term));
      if (org) {
        mapRef.current.setView([org.location.lat, org.location.lng], 12);
        onSelect(org);
      }
    }
  }, [searchTerm, data]);

  // Filtrera organisationer baserat på viewMode och filters
  const filteredOrganizations = data.organizations.filter(org => {
    // Filtrera på typ
    if (viewMode === 'authorities' && org.type !== 'authority') return false;
    if (viewMode === 'others' && org.type !== 'other') return false;
    
    // Filtrera på status om filter finns
    if (filters) {
      if (org.status === 'hubs' && !filters.hubs) return false;
      if (org.status === 'connected' && !filters.connected) return false;
      if (org.status === 'qa' && !filters.qa) return false;
      if (org.status === 'started' && !filters.started) return false;
      if (org.status === 'none' && !filters.none) return false;
    }
    
    return true;
  });

  const getColor = (status: ConnectionStatus) => {
    switch (status) {
      case 'hubs': return '#166534'; // green-800 (tydligt mörkgrön)
      case 'connected': return '#10b981'; // emerald-500 (samma som tidigare)
      case 'qa': return '#f59e0b'; // amber-500
      case 'started': return '#ef4444'; // red-500
      case 'none': return '#ffffff';
      default: return '#ffffff';
    }
  };

  const style = (feature: any) => {
    // Hitta matchande data
    // OBS: GeoJSON properties varierar beroende på källa. 
    // Här antar vi att 'name' eller 'ref' finns.
    // Vi måste matcha mot vår mockData.
    
    // Matcha mot GeoJSON properties från okfse/sweden-geojson
    // Kommuner använder 'kom_namn', Regioner använder 'lan_namn'
    const name = feature.properties.kom_namn || feature.properties.lan_namn || feature.properties.name;
    let status: ConnectionStatus = 'none';
    
    if (viewMode === 'municipalities') {
      // Matcha kommunnamn
      const found = data.municipalities.find(m => 
        (m.name === name) || 
        (name && m.name.includes(name)) || 
        (name && name.includes(m.name))
      );
      if (found) status = found.status;
    } else if (viewMode === 'regions') {
      // Matcha regionnamn (GeoJSON har ofta bara "Stockholm", vi har "Region Stockholm")
      const found = data.regions.find(r => 
        (r.name === name) || 
        (name && r.name.includes(name)) || 
        (name && name.includes(r.name))
      );
      if (found) status = found.status;
    }

    // Applicera filter för polygoner
    if (filters) {
      if (status === 'hubs' && !filters.hubs) return { fillOpacity: 0, opacity: 0, weight: 0 };
      if (status === 'connected' && !filters.connected) return { fillOpacity: 0, opacity: 0, weight: 0 };
      if (status === 'qa' && !filters.qa) return { fillOpacity: 0, opacity: 0, weight: 0 };
      if (status === 'started' && !filters.started) return { fillOpacity: 0, opacity: 0, weight: 0 };
      if (status === 'none' && !filters.none) return { fillOpacity: 0, opacity: 0, weight: 0 };
    }

    return {
      fillColor: getColor(status),
      weight: 1,
      opacity: 1,
      color: '#d1d5db', // Light gray border
      dashArray: '',
      fillOpacity: 0.7
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    layer.on({
      mouseover: (e: any) => {
        const layer = e.target;
        layer.setStyle({
          weight: 2,
          color: '#666',
          dashArray: '',
          fillOpacity: 0.9
        });
        layer.bringToFront();
      },
      mouseout: (e: any) => {
        const layer = e.target;
        // Reset style (simplified)
        // I en riktig app skulle vi använda geoJsonRef.current.resetStyle(layer)
        layer.setStyle({
          weight: 1,
          color: '#d1d5db',
          fillOpacity: 0.7
        });
      },
      click: () => {
        const name = feature.properties.kom_namn || feature.properties.lan_namn || feature.properties.name;
        
        // Hitta status för det klickade objektet
        let status: ConnectionStatus = 'none';
        if (viewMode === 'municipalities') {
          const found = data.municipalities.find(m => 
            (m.name === name) || 
            (name && m.name.includes(name)) || 
            (name && name.includes(m.name))
          );
          if (found) status = found.status;
        } else if (viewMode === 'regions') {
          const found = data.regions.find(r => 
            (r.name === name) || 
            (name && r.name.includes(name)) || 
            (name && name.includes(r.name))
          );
          if (found) status = found.status;
        }

        onSelect({
          name: name,
          type: viewMode === 'municipalities' ? 'Kommun' : 'Region',
          status: status
        });
      }
    });
  };

  if (loading) {
    return <div className="flex h-full items-center justify-center">Laddar karta...</div>;
  }

  return (
    <MapContainer 
      center={[62.0, 15.0]} 
      zoom={5} 
      style={{ height: '100%', width: '100%', background: '#f8fafc' }}
      zoomControl={false}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      
      {viewMode === 'municipalities' && geoData && (
        <GeoJSON 
          ref={geoJsonRef}
          data={geoData} 
          style={style} 
          onEachFeature={onEachFeature} 
        />
      )}

      {viewMode === 'regions' && regionGeoData && (
        <GeoJSON 
          ref={geoJsonRef}
          data={regionGeoData} 
          style={style} 
          onEachFeature={onEachFeature} 
        />
      )}

      {(viewMode === 'authorities' || viewMode === 'others') && filteredOrganizations.map(org => (
        <Marker 
          key={org.id} 
          position={[org.location.lat, org.location.lng]}
          icon={createColoredIcon(getColor(org.status))}
          eventHandlers={{
            click: () => onSelect(org),
          }}
        >
          <Popup>
            <strong>{org.name}</strong><br />
            {org.type === 'authority' ? 'Myndighet' : 'Organisation'}<br />
            Status: {org.status === 'hubs' ? 'Hubs' : 
                    org.status === 'connected' ? 'Ansluten' : 
                    org.status === 'qa' ? 'QA' : 
                    org.status === 'started' ? 'Påbörjad' : 'Ej ansluten'}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
