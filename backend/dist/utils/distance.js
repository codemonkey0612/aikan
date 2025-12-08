"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDistance = calculateDistance;
exports.parseCoordinates = parseCoordinates;
/**
 * Calculate distance between two coordinates using Haversine formula
 * @param lat1 Latitude of first point
 * @param lon1 Longitude of first point
 * @param lat2 Latitude of second point
 * @param lon2 Longitude of second point
 * @returns Distance in kilometers
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) *
            Math.cos(toRadians(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Math.round(distance * 100) / 100; // Round to 2 decimal places
}
/**
 * Convert degrees to radians
 */
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
/**
 * Parse latitude and longitude from "lat,lng" string format
 * @param coordString String in format "35.6895,139.6917"
 * @returns Object with lat and lng, or null if invalid
 */
function parseCoordinates(coordString) {
    if (!coordString)
        return null;
    const parts = coordString.split(",").map((s) => s.trim());
    if (parts.length !== 2)
        return null;
    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lng))
        return null;
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180)
        return null;
    return { lat, lng };
}
