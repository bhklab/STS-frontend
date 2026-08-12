import React, { useRef, useEffect } from 'react';
import { useContainerSize } from '../hooks/useContainerSize';
import * as d3 from 'd3';

export interface PlotDataPoint {
    cellLine: string;
    value: number;
    tissue: string;
}

interface DotPlotProps {
    data: PlotDataPoint[];
    gene: string;
}

export const TISSUE_COLORS: Record<string, string> = {
    'Soft Tissue': '#6a9fc8', // muted steel-blue
    Uterus: '#e8917a' // warm salmon
};

export const DEFAULT_COLOR = '#999999';

const DotPlot: React.FC<DotPlotProps> = ({ data, gene }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [containerRef, width] = useContainerSize();
    const height = Math.round(width * 0.5);

    useEffect(() => {
        if (!svgRef.current || data.length === 0 || width === 0) return;

        // Dimensions
        const margin = { top: 40, right: 140, bottom: 100, left: 70 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        // Sort data by ascending expression
        const sorted = [...data].sort((a, b) => a.value - b.value);

        // Scales
        const xScale = d3
            .scaleBand<string>()
            .domain(sorted.map(d => d.cellLine))
            .range([0, innerW])
            .padding(0.4);

        const yExtent = d3.extent(sorted, d => d.value) as [number, number];
        const yPadding = (yExtent[1] - yExtent[0]) * 0.1;

        const yScale = d3
            .scaleLinear()
            .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
            .nice()
            .range([innerH, 0]);

        // Clear previous render
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('font-family', "'Roboto', 'Inter', system-ui, sans-serif");

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Grid lines
        g.append('g')
            .attr('class', 'grid')
            .call(
                d3
                    .axisLeft(yScale)
                    .tickSize(-innerW)
                    .tickFormat(() => '')
            )
            .selectAll('line')
            .attr('stroke', '#e8ecef')
            .attr('stroke-dasharray', '3,3');

        g.select('.grid .domain').remove();

        // Y axis
        const yAxis = g.append('g').call(d3.axisLeft(yScale).ticks(6));

        yAxis.select('.domain').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick text').attr('fill', '#5f6f7f').attr('font-size', '11px');

        // Y axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerH / 2)
            .attr('y', -50)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Value');

        // X axis
        const xAxis = g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale));

        xAxis.select('.domain').attr('stroke', '#c4cdd5');
        xAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        xAxis
            .selectAll('.tick text')
            .attr('fill', '#5f6f7f')
            .attr('font-size', '10px')
            .attr('text-anchor', 'end')
            .attr('transform', 'rotate(-45)')
            .attr('dx', '-0.6em')
            .attr('dy', '0.15em');

        // X axis label
        g.append('text')
            .attr('x', innerW / 2)
            .attr('y', innerH + 80)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Cell Line / Sample');

        // Dots
        g.selectAll('.dot')
            .data(sorted)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => (xScale(d.cellLine) ?? 0) + xScale.bandwidth() / 2)
            .attr('cy', d => yScale(d.value))
            .attr('r', 0)
            .attr('fill', d => TISSUE_COLORS[d.tissue] ?? DEFAULT_COLOR)
            .attr('opacity', 0.85)
            .transition()
            .duration(500)
            .delay((_, i) => i * 30)
            .attr('r', 6);

        // Tooltip circles (invisible hover targets)
        const tooltip = d3
            .select(svgRef.current.parentElement)
            .append('div')
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('background', 'rgba(31,41,55,0.92)')
            .style('color', '#fff')
            .style('padding', '6px 10px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('line-height', '1.4')
            .style('opacity', '0')
            .style('transition', 'opacity 0.15s ease');

        g.selectAll('.dot-hover')
            .data(sorted)
            .enter()
            .append('circle')
            .attr('class', 'dot-hover')
            .attr('cx', d => (xScale(d.cellLine) ?? 0) + xScale.bandwidth() / 2)
            .attr('cy', d => yScale(d.value))
            .attr('r', 12)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('mouseenter', (_event, d) => {
                tooltip
                    .html(
                        `<strong>Gene: </strong>${gene}<br/><strong>Cell Line: </strong>${d.cellLine}<br/><strong>Value: </strong>${d.value.toFixed(2)}<br/><strong>Tissue: </strong>${d.tissue}`
                    )
                    .style('opacity', '1');
            })
            .on('mousemove', event => {
                const [mx, my] = d3.pointer(event, svgRef.current!.parentElement!);
                tooltip.style('left', `${mx + 14}px`).style('top', `${my - 10}px`);
            })
            .on('mouseleave', () => {
                tooltip.style('opacity', '0');
            });

        // Gene title
        g.append('text')
            .attr('x', 0)
            .attr('y', -16)
            .attr('fill', '#1f2937')
            .attr('font-size', '18px')
            .attr('font-weight', '600')
            .text(gene);

        // Legend
        const tissues = Array.from(new Set(data.map(d => d.tissue)));
        const legend = g.append('g').attr('transform', `translate(${innerW + 20}, 10)`);

        legend
            .append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('fill', '#1f2937')
            .attr('font-size', '14px')
            .attr('font-weight', '600')
            .text('Tissue');

        tissues.forEach((t, i) => {
            const row = legend.append('g').attr('transform', `translate(0, ${22 + i * 24})`);

            row.append('circle')
                .attr('cx', 7)
                .attr('cy', 0)
                .attr('r', 6)
                .attr('fill', TISSUE_COLORS[t] ?? DEFAULT_COLOR);

            row.append('text').attr('x', 20).attr('y', 4).attr('fill', '#5f6f7f').attr('font-size', '12px').text(t);
        });

        // Cleanup tooltip on unmount
        return () => {
            tooltip.remove();
        };
    }, [data, gene, width, height]);

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', width: '100%', height: height || 'auto', overflow: 'hidden' }}
        >
            <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        </div>
    );
};

export default DotPlot;
