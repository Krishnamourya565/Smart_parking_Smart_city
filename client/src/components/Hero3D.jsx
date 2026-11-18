import React from 'react';
import Facility3DView from './Facility3DView';

/**
 * Hero3D - Wrapper component for Landing Page Hero section
 * Renders the upgraded Spider Web Background + Solid 3D Facility Scene
 */
export default function Hero3D({ spots = [], onSelectSpot = () => {} }) {
  return (
    <Facility3DView
      spots={spots}
      onSpotSelect={onSelectSpot}
    />
  );
}
