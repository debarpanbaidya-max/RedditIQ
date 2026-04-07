import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export default function DropoffChart({ tweets, onTweetClick, selectedTweetId }) {
  const svgRef = useRef(null);
  const tooltipRef = useRef(null);

  useEffect(() => {
    if (!tweets || tweets.length === 0) return;

    const container = svgRef.current.parentElement;
    const width = container.clientWidth;
    const height = 320;
    const margin = { top: 20, right: 20, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Clear previous render
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3.scaleBand()
      .domain(tweets.map((_, i) => i + 1))
      .range([0, innerWidth])
      .padding(0.3);

    const maxEng = d3.max(tweets, d => d.engagement_score) || 1;
    const y = d3.scaleLinear()
      .domain([0, maxEng * 1.1])
      .range([innerHeight, 0]);

    // Color scale — bars go from cyan (high engagement) to red (low/drop)
    const colorScale = t => d3.interpolateRgb('#22d3ee', '#ef4444')(t);

    // Grid lines
    g.append('g')
      .selectAll('line')
      .data(y.ticks(5))
      .join('line')
      .attr('x1', 0).attr('x2', innerWidth)
      .attr('y1', d => y(d)).attr('y2', d => y(d))
      .attr('stroke', 'rgba(255,255,255,0.05)')
      .attr('stroke-dasharray', '4,4');

    // Bars
    const bars = g.selectAll('.bar')
      .data(tweets)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d, i) => x(i + 1))
      .attr('y', innerHeight)
      .attr('width', x.bandwidth())
      .attr('height', 0)
      .attr('rx', 6)
      .attr('cursor', 'pointer')
      .attr('fill', (d) => {
        const norm = maxEng > 0 ? d.engagement_score / maxEng : 0;
        return colorScale(1 - norm);
      })
      .attr('opacity', (d) => d.id === selectedTweetId ? 1 : 0.85);

    // Animate bars
    bars.transition().duration(700).delay((_, i) => i * 60)
      .attr('y', d => y(d.engagement_score))
      .attr('height', d => innerHeight - y(d.engagement_score));

    // Problem tweet highlight ring
    g.selectAll('.problem-ring')
      .data(tweets.filter(d => d.is_problem))
      .join('rect')
      .attr('class', 'problem-ring')
      .attr('x', d => x(tweets.indexOf(d) + 1) - 2)
      .attr('y', d => y(d.engagement_score) - 2)
      .attr('width', x.bandwidth() + 4)
      .attr('height', d => innerHeight - y(d.engagement_score) + 4)
      .attr('rx', 8)
      .attr('fill', 'none')
      .attr('stroke', '#ef4444')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '4,2')
      .attr('opacity', 0.7);

    // Drop-off line overlay
    const lineData = tweets.map((d, i) => ({ x: x(i + 1) + x.bandwidth() / 2, y: y(d.engagement_score) }));

    const line = d3.line().x(d => d.x).y(d => d.y).curve(d3.curveMonotoneX);

    g.append('path')
      .datum(lineData)
      .attr('fill', 'none')
      .attr('stroke', 'rgba(91,91,239,0.6)')
      .attr('stroke-width', 2)
      .attr('d', line);

    // Dot markers on line
    g.selectAll('.dot')
      .data(tweets)
      .join('circle')
      .attr('class', 'dot')
      .attr('cx', (d, i) => x(i + 1) + x.bandwidth() / 2)
      .attr('cy', d => y(d.engagement_score))
      .attr('r', 4)
      .attr('fill', (d, i) => d.id === selectedTweetId ? '#a78bfa' : '#5b5bef')
      .attr('stroke', '#0a0a14')
      .attr('stroke-width', 2)
      .attr('cursor', 'pointer');

    // Clickable overlay (full bar area)
    g.selectAll('.click-zone')
      .data(tweets)
      .join('rect')
      .attr('class', 'click-zone')
      .attr('x', (d, i) => x(i + 1))
      .attr('y', 0)
      .attr('width', x.bandwidth())
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => onTweetClick?.(d))
      .on('mouseenter', function (event, d) {
        const tweet_num = tweets.indexOf(d) + 1;
        const tooltip = d3.select(tooltipRef.current);
        tooltip
          .style('opacity', '1')
          .style('left', `${event.offsetX + 15}px`)
          .style('top', `${event.offsetY - 10}px`)
          .html(`
            <div class="font-semibold text-white mb-1">Tweet ${tweet_num}</div>
            <div class="text-gray-300">Engagement: <span class="text-cyan-400">${Math.round(d.engagement_score)}</span></div>
            <div class="text-gray-300">Drop-off: <span class="${d.drop_off_rate > 0.3 ? 'text-red-400' : 'text-emerald-400'}">${(d.drop_off_rate * 100).toFixed(1)}%</span></div>
            <div class="text-gray-300">Impressions: <span class="text-brand-400">${d.impressions_proxy?.toLocaleString()}</span></div>
            ${d.is_problem ? '<div class="text-red-400 mt-1">⚠ Problem tweet</div>' : ''}
          `);
      })
      .on('mouseleave', () => {
        d3.select(tooltipRef.current).style('opacity', '0');
      });

    // X Axis
    g.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(d => `T${d}`))
      .call(ax => ax.select('.domain').attr('stroke', 'rgba(255,255,255,0.1)'))
      .call(ax => ax.selectAll('text').attr('fill', '#6b7280').attr('font-size', '11px'))
      .call(ax => ax.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.1)'));

    // Y Axis
    g.append('g')
      .call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2s')))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text').attr('fill', '#6b7280').attr('font-size', '11px'))
      .call(ax => ax.selectAll('.tick line').remove());

    // Y Axis label
    g.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', -50).attr('x', -innerHeight / 2)
      .attr('text-anchor', 'middle')
      .attr('fill', '#6b7280')
      .attr('font-size', '11px')
      .text('Engagement Score');

  }, [tweets, selectedTweetId]);

  return (
    <div className="relative w-full">
      <div
        ref={tooltipRef}
        className="chart-tooltip absolute z-50 opacity-0 transition-opacity duration-150 pointer-events-none"
        style={{ minWidth: '160px' }}
      />
      <svg ref={svgRef} className="w-full" />
    </div>
  );
}
