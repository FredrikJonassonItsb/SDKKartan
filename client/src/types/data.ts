export type ConnectionStatus = 'connected' | 'qa' | 'started' | 'none' | 'hubs';

export interface Municipality {
  id: string;
  name: string;
  status: ConnectionStatus;
  coordinates?: [number, number]; // Lat, Lng for center point if needed
}

export interface Region {
  id: string;
  name: string;
  status: ConnectionStatus;
}

export interface Organization {
  id: string;
  name: string;
  type: 'authority' | 'other';
  status: ConnectionStatus;
  location: {
    lat: number;
    lng: number;
    city: string;
  };
}

export interface MapData {
  municipalities: Municipality[];
  regions: Region[];
  organizations: Organization[];
}
