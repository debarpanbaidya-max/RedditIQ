import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const CATEGORIES = ['toxicity', 'severe_toxicity', 'obscene', 'threat', 'insult', 'identity_attack'];
const LABELS = ['Toxicity', 'Severe', 'Obscene', 'Threat', 'Insult', 'Identity'];
const COLORS  = ['#ef4444', '#dc2626', '#f97316', '#eab308', '#a78bfa', '#22d3ee'];

export default function SentimentBars({ scores }) {
  const svgRef = useRef(null);

  useEffect(() => {
    if (!scores) return;

    const width = 300;
    const barHeight = 22;
    const gap = 10;
    const labelW = 90;
    const margin = { top: 10, right: 10, bottom: 10, left: labelW };
    const height = CATEGORIES.length * (barHeight + gap) + margin.top + margin.bottom;

    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const innerW = width - margin.left - margin.right;

    CATEGORIES.forEach((cat, i) => {
      const value = scores[cat] || 0;
      const y = i * (barHeight + gap);
      const color = COLORS[i];

      // Background track
      g.append('rect')
        .attr('x', 0).attr('y', y)
        .attr('width', innerW).attr('height', barHeight)
        .attr('rx', 4)
        .attr('fill', 'rgba(255,255,255,0.04)');

      // Fill bar
      g.append('rect')
        .attr('x', 0).attr('y', y)
        .attr('width', 0).attr('height', barHeight)
        .attr('rx', 4)
        .attr('fill', color)
        .attr('opacity', 0.85)
        .transition().duration(600).delay(i * 80)
        .attr('width', value * innerW);

      // Label (left)
      svg.append('text')
        .attr('x', labelW - 8)
        .attr('y', margin.top + y + barHeight / 2 + 1)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#9ca3af')
        .attr('font-size', '10px')
        .text(LABELS[i]);

      // Value text
      g.append('text')
        .attr('x', value * innerW + 4)
        .attr('y', y + barHeight / 2)
        .attr('dominant-baseline', 'middle')
        .attr('fill', color)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text((value * 100).toFixed(1) + '%');
    });
  }, [scores]);

  return <svg ref={svgRef} />;
}
