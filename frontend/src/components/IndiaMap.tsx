import React, { useEffect, useState, useMemo, useRef } from 'react';
import * as d3Geo from 'd3-geo';

interface IndiaMapProps {
  stateData: any[];
  activeState: any;
  onStateClick: (stateData: any) => void;
}

export const IndiaMap: React.FC<IndiaMapProps> = ({ stateData, activeState, onStateClick }) => {
  const [geoData, setGeoData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });

  useEffect(() => {
    fetch('/india.geojson')
      .then(res => res.json())
      .then(data => setGeoData(data))
      .catch(err => console.error("Error loading map data:", err));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver(entries => {
      for (let entry of entries) {
        setDimensions({
          width: entry.contentRect.width,
          height: entry.contentRect.height
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
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

  // Calculate dynamic scale and translation using fitExtent for perfect centering and sizing
  const projection = d3Geo.geoMercator()
    .fitExtent([[20, 20], [dimensions.width - 20, dimensions.height - 20]], geoData);

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
    <div ref={containerRef} className="w-full h-[500px] relative">
      <svg width={dimensions.width} height={dimensions.height} className="drop-shadow-sm">
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
                  strokeWidth={isActive ? 2 : 0.5}
                  className={`cursor-pointer transition-all duration-200 ${isActive ? 'opacity-100 drop-shadow-md' : 'opacity-80 hover:opacity-100'}`}
                />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
};
