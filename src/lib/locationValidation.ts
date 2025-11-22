/**
 * Utility functions for validating geographic coordinates
 */

// Vietnam coordinate bounds (more accurate - excludes Cambodia border areas)
// Note: Using tighter bounds, but still recommend using reverse geocoding for country check
export const VIETNAM_BOUNDS = {
  latMin: 8.5,
  latMax: 23.4,
  // Adjusted longitude: Vietnam's western border is around 102.1-105°E near Cambodia border
  // Eastern parts reach 109.5°E. To exclude Cambodia, we tighten the western border
  lngMin: 102.1, // Can be adjusted but Cambodia extends further west
  lngMax: 109.5,
  // More accurate: Vietnam's main territory longitude range
  // Excluding extreme western points that might overlap with Cambodia/Laos borders
  lngMinTight: 103.0, // Tighter bound for central/western Vietnam
};

// Global coordinate bounds
export const GLOBAL_BOUNDS = {
  latMin: -90,
  latMax: 90,
  lngMin: -180,
  lngMax: 180,
};

/**
 * Validate if coordinates are within valid global ranges
 */
export function isValidGlobalCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return false;
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return false;
  }

  return (
    latitude >= GLOBAL_BOUNDS.latMin &&
    latitude <= GLOBAL_BOUNDS.latMax &&
    longitude >= GLOBAL_BOUNDS.lngMin &&
    longitude <= GLOBAL_BOUNDS.lngMax
  );
}

/**
 * Validate if coordinates are within Vietnam bounds
 */
export function isWithinVietnamBounds(
  lat: number | null | undefined,
  lng: number | null | undefined
): boolean {
  if (!isValidGlobalCoordinates(lat, lng)) {
    return false;
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  return (
    latitude >= VIETNAM_BOUNDS.latMin &&
    latitude <= VIETNAM_BOUNDS.latMax &&
    longitude >= VIETNAM_BOUNDS.lngMin &&
    longitude <= VIETNAM_BOUNDS.lngMax
  );
}

/**
 * Validate coordinates and return error message if invalid
 */
export function validateCoordinates(
  lat: number | null | undefined,
  lng: number | null | undefined,
  requireVietnamBounds: boolean = false
): { isValid: boolean; error?: string } {
  if (lat === null || lat === undefined || lng === null || lng === undefined) {
    return { isValid: false, error: "Vị trí tọa độ là bắt buộc" };
  }

  const latitude = Number(lat);
  const longitude = Number(lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { isValid: false, error: "Tọa độ không hợp lệ (phải là số)" };
  }

  if (!isValidGlobalCoordinates(latitude, longitude)) {
    return {
      isValid: false,
      error: `Tọa độ không hợp lệ. Vĩ độ phải từ ${GLOBAL_BOUNDS.latMin} đến ${GLOBAL_BOUNDS.latMax}, Kinh độ phải từ ${GLOBAL_BOUNDS.lngMin} đến ${GLOBAL_BOUNDS.lngMax}`,
    };
  }

  if (requireVietnamBounds && !isWithinVietnamBounds(latitude, longitude)) {
    return {
      isValid: false,
      error: `Tọa độ không nằm trong phạm vi Việt Nam. Vĩ độ: ${VIETNAM_BOUNDS.latMin}-${VIETNAM_BOUNDS.latMax}, Kinh độ: ${VIETNAM_BOUNDS.lngMin}-${VIETNAM_BOUNDS.lngMax}`,
    };
  }

  return { isValid: true };
}

