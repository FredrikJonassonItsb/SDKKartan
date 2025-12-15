// Utility för att ladda GeoJSON-data
// I en riktig app skulle vi ladda en komplett fil med Sveriges kommuner.
// För denna demo kommer vi att använda en förenklad version eller ladda från en extern källa om möjligt.

export async function loadMunicipalitiesGeoJSON() {
  try {
    // Ladda från lokal fil i public/data
    const response = await fetch('/data/municipalities.json');
    if (!response.ok) {
      throw new Error('Failed to load GeoJSON');
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading GeoJSON:", error);
    return null;
  }
}

export async function loadRegionsGeoJSON() {
  try {
    // Ladda från lokal fil i public/data
    const response = await fetch('/data/regions.json');
    if (!response.ok) {
      throw new Error('Failed to load Region GeoJSON');
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading Region GeoJSON:", error);
    return null;
  }
}
