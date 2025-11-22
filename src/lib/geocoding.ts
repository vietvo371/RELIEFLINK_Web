/**
 * Geocoding utilities using Mapbox Geocoding API
 */

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

/**
 * Reverse geocode: Get address from coordinates using Mapbox API
 */
export async function reverseGeocode(
  lat: number,
  lng: number
): Promise<string | null> {
  try {
    const token = MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_token" || token.trim() === "") {
      console.warn("Mapbox token not configured for geocoding");
      return null;
    }

    // Mapbox reverse geocoding endpoint
    // Format: https://api.mapbox.com/geocoding/v5/{endpoint}/{longitude},{latitude}.json
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=vi&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      console.error("Geocoding API error:", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      // Get the most relevant feature
      const feature = data.features[0];
      
      // Try to get a readable address
      // Priority: place_name > text > address
      if (feature.place_name) {
        return feature.place_name;
      } else if (feature.text) {
        // If only text, try to build a better address
        const context = feature.context || [];
        const parts = [
          feature.text,
          ...context
            .filter((ctx: any) => ctx.id?.startsWith("place") || ctx.id?.startsWith("region") || ctx.id?.startsWith("country"))
            .map((ctx: any) => ctx.text)
            .reverse()
        ].filter(Boolean);
        
        return parts.join(", ") || null;
      }
    }

    return null;
  } catch (error) {
    console.error("Reverse geocoding error:", error);
    return null;
  }
}

/**
 * Reverse geocode with country check
 */
export async function reverseGeocodeWithCountry(
  lat: number,
  lng: number
): Promise<{ address: string | null; country: string | null }> {
  try {
    const token = MAPBOX_TOKEN;
    if (!token || token === "your_mapbox_token" || token.trim() === "") {
      return { address: null, country: null };
    }

    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${token}&language=vi&limit=1`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return { address: null, country: null };
    }

    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const feature = data.features[0];
      
      // Extract country
      const countryContext = feature.context?.find(
        (ctx: any) => ctx.id?.startsWith("country")
      );
      const country = countryContext?.text || null;
      
      // Get address
      const address = feature.place_name || feature.text || null;
      
      return { address, country };
    }

    return { address: null, country: null };
  } catch (error) {
    console.error("Reverse geocoding with country error:", error);
    return { address: null, country: null };
  }
}

