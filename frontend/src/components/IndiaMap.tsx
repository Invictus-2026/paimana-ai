import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as d3Geo from 'd3-geo';

interface IndiaMapProps {
  stateData: any[];
  activeState: any;
  onStateClick: (stateData: any) => void;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({ stateData, activeState, onStateClick }) => {
  const [geoData, setGeoData] = useState<any>(null);

  useEffect(() => {
    fetch('/india.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading map data:", err));
  }, []);

  const dataMap = useMemo(() => {
    const map = new Map<string, any>();
    stateData.forEach(d => {
      // Normalize state names
      let name = d.name.toLowerCase().trim();
      if (name === 'jammu & kashmir') name = 'jammu and kashmir';
      if (name === 'andaman & nicobar islands') name = 'andaman and nicobar';
      map.set(name, d);
    });
    return map;
  }, [stateData]);

  if (!geoData) {
    return (
      <div className="flex justify-center items-center h-full w-full min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0d52ce]"></div>
      </div>
    );
  }

  // Use a fixed viewBox coordinate system to scale automatically with CSS
  const mapWidth = 800;
  const mapHeight = 800;

  const projection = d3Geo.geoMercator()
    .fitExtent([[10, 10], [mapWidth - 10, mapHeight - 10]], geoData);

  const pathGenerator = d3Geo.geoPath().projection(projection);

  const getStateColor = (stateName: string) => {
    let name = stateName.toLowerCase().trim();
    if (name === 'jammu and kashmir') name = 'jammu & kashmir';
    const data = dataMap.get(name) || dataMap.get(stateName.toLowerCase().trim());
    
    if (!data || data.count === 0) return '#f8fafc'; // Default empty
    
    const count = data.count;
    if (count > 200) return '#1e3a8a';
    if (count > 100) return '#1d4ed8';
    if (count > 50) return '#3b82f6';
    if (count > 20) return '#60a5fa';
    return '#bfdbfe';
  };

  return (
    <div className="w-full h-full relative">
      <svg viewBox={`0 0 ${mapWidth} ${mapHeight}`} className="w-full h-full drop-shadow-sm filter">
        <g strokeLinejoin="round">
          {geoData.features.map((feature: any) => {
            const stateName = feature.properties.ST_NM;
            
            const matchedData = stateData.find(
              s => s.name.toLowerCase() === stateName.toLowerCase()
            ) || { name: stateName, count: 0, orig_cost_cr: 0, expenditure_cr: 0 };

            const isActive = activeState && activeState.name.toLowerCase() === stateName.toLowerCase();
            
            return (
              <g key={`group-${stateName}`}>
                <path
                  key={stateName}
                  d={pathGenerator(feature) || ''}
                  fill={getStateColor(stateName)}
                  onClick={() => onStateClick(matchedData)}
                  stroke={isActive ? "#0f172a" : "#ffffff"}
                  strokeWidth={isActive ? 3 : 0.75}
                  className={`cursor-pointer transition-all duration-200 ${isActive ? 'opacity-100 drop-shadow-lg' : 'opacity-80 hover:opacity-100'}`}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
