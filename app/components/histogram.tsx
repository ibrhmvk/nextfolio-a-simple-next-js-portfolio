'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

interface HistogramProps {
  data: number[];
  bins: number[];
}

export default function Histogram({ data, bins }: HistogramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  const renderHistogram = () => {
    if (!svgRef.current || !data || !bins || data.length === 0 || bins.length === 0) return;

    // Clear any existing content
    d3.select(svgRef.current).selectAll('*').remove();

    // Set dimensions with responsive width
    const containerWidth = svgRef.current.parentElement?.clientWidth || 600;
    const margin = { top: 20, right: 20, bottom: 40, left: 40 };
    const width = Math.min(containerWidth, 600) - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // Create SVG container
    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    try {
      // Create scales
      const x = d3
        .scaleLinear()
        .domain([bins[0], bins[bins.length - 1]])
        .range([0, width]);

      const y = d3
        .scaleLinear()
        .domain([0, Math.max(...data)])
        .range([height, 0]);

      // Create bars with transition
      svg
        .selectAll('rect')
        .data(data)
        .enter()
        .append('rect')
        .attr('x', (d, i) => x(bins[i]))
        .attr('width', width / (bins.length - 1))
        .attr('y', height)
        .attr('height', 0)
        .attr('fill', '#3b82f6')
        .attr('rx', 2)
        .attr('ry', 2)
        .transition()
        .duration(1000)
        .attr('y', d => y(d))
        .attr('height', d => height - y(d));

      // Add X axis
      svg
        .append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .append('text')
        .attr('x', width / 2)
        .attr('y', 35)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'middle')
        .text('Test Scores');

      // Add Y axis
      svg
        .append('g')
        .call(d3.axisLeft(y))
        .append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -35)
        .attr('x', -height / 2)
        .attr('fill', 'currentColor')
        .attr('text-anchor', 'middle')
        .text('Frequency');
    } catch (error) {
      console.error('Error rendering histogram:', error);
    }
  };

  useEffect(() => {
    renderHistogram();

    // Add resize event listener
    const handleResize = () => {
      renderHistogram();
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data, bins]);

  return (
    <div className="w-full overflow-x-auto">
      <svg ref={svgRef} className="w-full max-w-[600px] mx-auto dark:text-white" />
    </div>
  );
}