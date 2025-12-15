import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Sidebar } from "@/components/Sidebar";
import { MapView } from "@/components/MapView";
import { mockData } from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function Home() {
  const [viewMode, setViewMode] = useState<'municipalities' | 'regions' | 'authorities' | 'others'>('municipalities');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    hubs: true,
    connected: false,
    qa: false,
    started: false,
    none: false
  });

  // Beräkna statistik
  const stats = {
    municipalities: {
      total: 290, // Hårdkodat totalt antal kommuner
      connected: mockData.municipalities.filter(m => m.status === 'connected' || m.status === 'hubs').length,
      hubs: mockData.municipalities.filter(m => m.status === 'hubs').length,
    },
    regions: {
      total: 21,
      connected: mockData.regions.filter(r => r.status === 'connected' || r.status === 'hubs').length,
      hubs: mockData.regions.filter(r => r.status === 'hubs').length,
    },
    authorities: {
      total: mockData.organizations.filter(o => o.type === 'authority').length,
      connected: mockData.organizations.filter(o => o.type === 'authority' && (o.status === 'connected' || o.status === 'hubs')).length,
      hubs: mockData.organizations.filter(o => o.type === 'authority' && o.status === 'hubs').length,
    },
    others: {
      total: mockData.organizations.filter(o => o.type === 'other').length,
      connected: mockData.organizations.filter(o => o.type === 'other' && (o.status === 'connected' || o.status === 'hubs')).length,
      hubs: mockData.organizations.filter(o => o.type === 'other' && o.status === 'hubs').length,
    }
  };

  const handleFilterChange = (key: keyof typeof filters) => {
    setFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtrera data baserat på status (detta skulle skickas till MapView egentligen)
  // För enkelhetens skull skickar vi all data till MapView och låter den hantera rendering,
  // men i en skarp version skulle vi filtrera här.

  return (
    <Layout
      sidebar={
        <Sidebar
          stats={
            <div className="grid gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Anslutna Kommuner</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.municipalities.connected} / {stats.municipalities.total}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((stats.municipalities.connected / stats.municipalities.total) * 100)}% täckning
                  </p>
                  <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    Varav {stats.municipalities.hubs} anslutna via Hubs
                  </div>
                </CardContent>
              </Card>
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Regioner</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.regions.connected}</div>
                    <div className="text-xs text-muted-foreground mt-1">varav {stats.regions.hubs} Hubs</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Myndigheter</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.authorities.connected}</div>
                    <div className="text-xs text-muted-foreground mt-1">varav {stats.authorities.hubs} Hubs</div>
                  </CardContent>
                </Card>
                <Card className="col-span-2">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Övriga Org.</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.others.connected}</div>
                    <div className="text-xs text-muted-foreground mt-1">varav {stats.others.hubs} Hubs</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          }
          onSearch={setSearchTerm}
          filters={
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Visningsläge</Label>
                <Tabs defaultValue="municipalities" onValueChange={(v) => setViewMode(v as any)} className="w-full">
                  <TabsList className="w-full grid grid-cols-4">
                    <TabsTrigger value="municipalities" className="text-xs px-1">Kommun</TabsTrigger>
                    <TabsTrigger value="regions" className="text-xs px-1">Region</TabsTrigger>
                    <TabsTrigger value="authorities" className="text-xs px-1">Myndighet</TabsTrigger>
                    <TabsTrigger value="others" className="text-xs px-1">Övriga</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-3 pt-4">
                <Label>Statusfilter</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox id="hubs" checked={filters.hubs} onCheckedChange={() => handleFilterChange('hubs')} />
                  <Label htmlFor="hubs" className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[#166534]" />
                    Hubs
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="connected" checked={filters.connected} onCheckedChange={() => handleFilterChange('connected')} />
                  <Label htmlFor="connected" className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[oklch(0.28_0.06_155)]" />
                    Ansluten (Prod)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="qa" checked={filters.qa} onCheckedChange={() => handleFilterChange('qa')} />
                  <Label htmlFor="qa" className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[oklch(0.9_0.1_145)]" />
                    Ansluten (QA)
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="started" checked={filters.started} onCheckedChange={() => handleFilterChange('started')} />
                  <Label htmlFor="started" className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-[oklch(0.65_0.15_35)]" />
                    Påbörjad
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="none" checked={filters.none} onCheckedChange={() => handleFilterChange('none')} />
                  <Label htmlFor="none" className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full border border-gray-300 bg-white" />
                    Ej påbörjad
                  </Label>
                </div>
              </div>
            </div>
          }
          legend={
            <div className="text-sm text-muted-foreground space-y-2">
              <p>Klicka på en kommun eller region för att se detaljer.</p>
              {selectedItem && (
                <Card className="mt-4 border-primary/20 bg-primary/5">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{selectedItem.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      <Badge variant={
                        selectedItem.status === 'hubs' ? 'default' :
                        selectedItem.status === 'connected' ? 'default' : 
                        selectedItem.status === 'qa' ? 'secondary' : 
                        selectedItem.status === 'started' ? 'destructive' : 'outline'
                      } className={selectedItem.status === 'hubs' ? 'bg-[#166534] hover:bg-[#166534]/90' : ''}>
                        {selectedItem.status === 'hubs' ? 'Hubs' :
                         selectedItem.status === 'connected' ? 'Ansluten' :
                         selectedItem.status === 'qa' ? 'I QA-miljö' :
                         selectedItem.status === 'started' ? 'Påbörjad' : 'Ej ansluten'}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          }
        />
      }
    >
      <MapView 
        data={mockData} 
        viewMode={viewMode} 
        onSelect={setSelectedItem}
        searchTerm={searchTerm}
        filters={filters}
      />
    </Layout>
  );
}
