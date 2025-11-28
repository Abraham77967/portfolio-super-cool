import { Landmark } from '../types';

/**
 * Calculates Euclidean distance between two 3D points.
 */
export const distance3D = (p1: Landmark, p2: Landmark): number => {
  return Math.sqrt(
    Math.pow(p1.x - p2.x, 2) +
    Math.pow(p1.y - p2.y, 2) +
    Math.pow(p1.z - p2.z, 2)
  );
};

/**
 * Calculates the centroid (average position) of a set of landmarks.
 */
export const calculateCentroid = (landmarks: Landmark[]): Landmark => {
  const count = landmarks.length;
  const sum = landmarks.reduce(
    (acc, curr) => ({
      x: acc.x + curr.x,
      y: acc.y + curr.y,
      z: acc.z + curr.z,
    }),
    { x: 0, y: 0, z: 0 }
  );

  return {
    x: sum.x / count,
    y: sum.y / count,
    z: sum.z / count,
  };
};

/**
 * Detects if a "Five Finger Pinch" is occurring.
 * 
 * Logic:
 * 1. Calculate the centroid of the 5 fingertips (indices 4, 8, 12, 16, 20).
 * 2. Calculate the average distance of each fingertip to this centroid.
 * 3. If the average distance is below a tight threshold, it's a pinch.
 */
export const isFiveFingerPinch = (landmarks: Landmark[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;

  const fingertips = [
    landmarks[4],  // Thumb
    landmarks[8],  // Index
    landmarks[12], // Middle
    landmarks[16], // Ring
    landmarks[20], // Pinky
  ];

  const centroid = calculateCentroid(fingertips);
  
  // Calculate average distance from tips to centroid
  let totalDist = 0;
  for (const tip of fingertips) {
    totalDist += distance3D(tip, centroid);
  }
  const avgDist = totalDist / fingertips.length;

  // Threshold tuned for "tight pinch" in normalized coordinates.
  // 0.05 is usually a good starting point for "close together"
  return avgDist < 0.06; 
};

/**
 * Detects if a "Thumb + Index Pinch" is occurring.
 * Uses distance between tip of thumb (4) and tip of index (8).
 */
export const isThumbIndexPinch = (landmarks: Landmark[]): boolean => {
  if (!landmarks || landmarks.length < 21) return false;
  
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  
  return distance3D(thumbTip, indexTip) < 0.05;
};