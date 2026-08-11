import React, { useRef, useEffect } from 'react';
import { useContainerSize } from '../hooks/useContainerSize';
import * as d3 from 'd3';
import { type PlotDataPoint, TISSUE_COLORS, DEFAULT_COLOR } from './DotPlot';

interface HeatmapInternalPoint {
    cellLine: string;
    gene: string;
    value: number;
    tissue: string;
}

interface HeatmapProps {
    data: Record<string, PlotDataPoint[]>;
}

const Heatmap: React.FC<HeatmapProps> = ({ data }) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [containerRef, width] = useContainerSize();
    const height = Math.round(width * 0.45);

    useEffect(() => {
        if (!svgRef.current || Object.keys(data).length === 0 || width === 0) return;

        // Flatten the Record into internal points
        const flat: HeatmapInternalPoint[] = [];
        for (const [gene, points] of Object.entries(data)) {
            for (const p of points) {
                flat.push({ cellLine: p.cellLine, gene, value: p.value, tissue: p.tissue });
            }
        }

        if (flat.length === 0) return;

        // Derive unique axes
        const genes = Object.keys(data);

        // Sort cell lines by average expression across all genes (ascending)
        const cellLineAvg = new Map<string, number>();
        const cellLineCounts = new Map<string, number>();
        flat.forEach(d => {
            cellLineAvg.set(d.cellLine, (cellLineAvg.get(d.cellLine) ?? 0) + d.value);
            cellLineCounts.set(d.cellLine, (cellLineCounts.get(d.cellLine) ?? 0) + 1);
        });
        const cellLines = Array.from(cellLineAvg.keys()).sort((a, b) => {
            const avgA = (cellLineAvg.get(a) ?? 0) / (cellLineCounts.get(a) ?? 1);
            const avgB = (cellLineAvg.get(b) ?? 0) / (cellLineCounts.get(b) ?? 1);
            return avgA - avgB;
        });

        // Dimensions
        const margin = { top: 100, right: 100, bottom: 100, left: 100 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        // Scales
        const xScale = d3.scaleBand<string>().domain(cellLines).range([0, innerW]).padding(0.04);
        const yScale = d3.scaleBand<string>().domain(genes).range([0, innerH]).padding(0.04);

        // Color scale spanning from the global min to max expression
        const extent = d3.extent(flat, d => d.value) as [number, number];
        const colorScale = d3
            .scaleSequential()
            .domain(extent)
            .interpolator(d3.interpolateRgbBasis(['#e6f2f7', '#006494', '#1f2937']));

        // Clear and set up SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('font-family', "'Roboto', 'Inter', system-ui, sans-serif");

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Tooltip
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
            .style('transition', 'opacity 0.15s ease')
            .style('z-index', '10')
            .style('white-space', 'nowrap');

        // Tissue annotation row
        const annotationHeight = 12;
        const annotationY = -20;

        // Map cell line to tissue
        const cellLineToTissue = new Map<string, string>();
        flat.forEach(d => cellLineToTissue.set(d.cellLine, d.tissue));

        g.selectAll('.tissue-cell')
            .data(cellLines)
            .enter()
            .append('rect')
            .attr('class', 'tissue-cell')
            .attr('x', d => xScale(d) ?? 0)
            .attr('y', annotationY)
            .attr('width', xScale.bandwidth())
            .attr('height', annotationHeight)
            .attr('fill', d => {
                const tissue = cellLineToTissue.get(d) ?? '';
                return TISSUE_COLORS[tissue] ?? DEFAULT_COLOR;
            })
            .style('cursor', 'pointer')
            .on('mouseenter', (_event, d) => {
                const tissue = cellLineToTissue.get(d) ?? '';
                tooltip.html(`<strong>Cell Line: ${d}</strong><br/>Tissue: ${tissue}`).style('opacity', '1');
            })
            .on('mousemove', event => {
                const [mx, my] = d3.pointer(event, svgRef.current!.parentElement!);
                tooltip.style('left', `${mx + 14}px`).style('top', `${my - 10}px`);
            })
            .on('mouseleave', () => {
                tooltip.style('opacity', '0');
            });

        // Tissue label
        g.append('text')
            .attr('x', innerW + 10)
            .attr('y', annotationY + annotationHeight / 2)
            .attr('dy', '0.35em')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Tissue');

        // Cells
        g.selectAll('.cell')
            .data(flat)
            .enter()
            .append('rect')
            .attr('class', 'cell')
            .attr('x', d => xScale(d.cellLine) ?? 0)
            .attr('y', d => yScale(d.gene) ?? 0)
            .attr('width', xScale.bandwidth())
            .attr('height', yScale.bandwidth())
            .attr('rx', 2)
            .attr('fill', d => colorScale(d.value))
            .attr('opacity', 0)
            .style('cursor', 'pointer')
            .on('mouseenter', (_event, d) => {
                tooltip
                    .html(
                        `<strong>Gene: ${d.gene}</strong><br/>Cell Line: ${d.cellLine}<br/>Value: ${d.value.toFixed(2)}<br/>Tissue: ${d.tissue}`
                    )
                    .style('opacity', '1');
            })
            .on('mousemove', event => {
                const [mx, my] = d3.pointer(event, svgRef.current!.parentElement!);
                tooltip.style('left', `${mx + 14}px`).style('top', `${my - 10}px`);
            })
            .on('mouseleave', () => {
                tooltip.style('opacity', '0');
            })
            .transition()
            .duration(400)
            .delay((_, i) => i * 12)
            .attr('opacity', 1);

        // X axis
        const xAxis = g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale));

        xAxis.select('.domain').remove();
        xAxis.selectAll('.tick line').remove();
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

        // Y axis
        const yAxis = g.append('g').call(d3.axisLeft(yScale));

        yAxis.select('.domain').remove();
        yAxis.selectAll('.tick line').remove();
        yAxis.selectAll('.tick text').attr('fill', '#1f2937').attr('font-size', '13px').attr('font-weight', '500');

        // Y axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerH / 2)
            .attr('y', -50)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Gene');

        // Color legend
        const legendWidth = 150;
        const legendHeight = 12;

        // Position both legends at the top right, above the heatmap
        const legendsY = -70;
        const expressionLegendX = innerW - legendWidth - 120; // Room for Tissue legend
        const tissueLegendX = innerW - 80;

        // Gradient for expression
        const defs = svg.append('defs');
        const gradientId = 'heatmap-gradient';
        const linearGradient = defs.append('linearGradient').attr('id', gradientId).attr('x1', '0%').attr('x2', '100%');

        const numStops = 10;
        for (let i = 0; i <= numStops; i++) {
            const t = i / numStops;
            const val = extent[0] + t * (extent[1] - extent[0]);
            linearGradient
                .append('stop')
                .attr('offset', `${t * 100}%`)
                .attr('stop-color', colorScale(val));
        }

        const legendGroup = g.append('g').attr('transform', `translate(${expressionLegendX},${legendsY})`);

        legendGroup
            .append('rect')
            .attr('width', legendWidth)
            .attr('height', legendHeight)
            .attr('rx', 3)
            .style('fill', `url(#${gradientId})`);

        // Expression Legend axis
        const legendScale = d3.scaleLinear().domain(extent).range([0, legendWidth]);

        const legendAxis = legendGroup
            .append('g')
            .attr('transform', `translate(0,${legendHeight})`)
            .call(d3.axisBottom(legendScale).ticks(4).tickSize(4));

        legendAxis.select('.domain').remove();
        legendAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        legendAxis.selectAll('.tick text').attr('fill', '#5f6f7f').attr('font-size', '10px');

        // Legend title
        legendGroup
            .append('text')
            .attr('x', 0)
            .attr('y', -6)
            .attr('text-anchor', 'start')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '600')
            .text('Value');

        // Tissue Legend
        const tissues = Array.from(new Set(flat.map(d => d.tissue)));
        const tissueLegendGroup = g.append('g').attr('transform', `translate(${tissueLegendX}, ${legendsY - 15})`);

        tissueLegendGroup
            .append('text')
            .attr('x', 0)
            .attr('y', 9)
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '600')
            .text('Tissue');

        tissues.forEach((t, i) => {
            const row = tissueLegendGroup.append('g').attr('transform', `translate(0, ${22 + i * 16})`);

            row.append('rect')
                .attr('x', 0)
                .attr('y', -6)
                .attr('width', 12)
                .attr('height', 12)
                .attr('rx', 2)
                .attr('fill', TISSUE_COLORS[t] ?? DEFAULT_COLOR);

            row.append('text').attr('x', 18).attr('y', 4).attr('fill', '#5f6f7f').attr('font-size', '12px').text(t);
        });

        return () => {
            tooltip.remove();
        };
    }, [data, width, height]);

    return (
        <div
            ref={containerRef}
            style={{ position: 'relative', width: '100%', height: height || 'auto', overflow: 'hidden' }}
        >
            <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0 }} />
        </div>
    );
};

export default Heatmap;
