import React, { useRef, useEffect, useMemo } from 'react';
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
    treatment?: boolean;
    entityLabel?: string;
    valueLabel?: string;
}

const Heatmap: React.FC<HeatmapProps> = ({ data, treatment, entityLabel, valueLabel }) => {
    const currentEntityLabel = entityLabel ?? (treatment ? 'Drug' : 'Gene');
    const currentValueLabel = valueLabel ?? (treatment ? 'Response' : 'Value');

    const svgRef = useRef<SVGSVGElement | null>(null);
    const [containerRef, width] = useContainerSize();

    const genes = useMemo(() => Object.keys(data), [data]);
    const numGenes = genes.length || 1;

    // Count unique cell lines across all genes
    const numCellLines = useMemo(() => {
        const set = new Set<string>();
        Object.values(data).forEach(pts => pts.forEach(p => set.add(p.cellLine)));
        return set.size || 1;
    }, [data]);

    const margin = { top: 90, right: 100, bottom: 90, left: 90 };
    const availableW = Math.max(width - margin.left - margin.right, 100);
    const maxCellSize = 42;
    const minCellSize = 14;
    const cellSize = Math.min(Math.max(availableW / numCellLines, minCellSize), maxCellSize);

    const gridHeight = numGenes * cellSize;
    const height = Math.max(margin.top + gridHeight + margin.bottom, 280);

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

        // Exact square grid dimensions
        const actualGridWidth = cellLines.length * cellSize;
        const actualGridHeight = genes.length * cellSize;

        // Center grid horizontally within available width
        const extraX = Math.max(0, (availableW - actualGridWidth) / 2);
        const offsetX = margin.left + extraX;
        const offsetY = margin.top;

        // Equal step and bandwidth for perfect square aspect ratio
        const xScale = d3
            .scaleBand<string>()
            .domain(cellLines)
            .range([0, actualGridWidth])
            .paddingInner(0.06)
            .paddingOuter(0);

        const yScale = d3
            .scaleBand<string>()
            .domain(genes)
            .range([0, actualGridHeight])
            .paddingInner(0.06)
            .paddingOuter(0);

        // Color scale spanning from the global min to max expression
        const extent = d3.extent(flat, d => d.value) as [number, number];
        const colorScale = d3
            .scaleSequential()
            .domain(extent)
            .interpolator(d3.interpolateRgbBasis(['#03158c', '#ffffff', '#800b00']));

        // Clear and set up SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('font-family', "'Roboto', 'Inter', system-ui, sans-serif");

        const g = svg.append('g').attr('transform', `translate(${offsetX},${offsetY})`);

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
        const annotationHeight = Math.min(Math.max(cellSize * 0.35, 8), 13);
        const annotationY = -annotationHeight - 8;

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
            .attr('rx', 1.5)
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
            .attr('x', actualGridWidth + 10)
            .attr('y', annotationY + annotationHeight / 2)
            .attr('dy', '0.35em')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Tissue');

        // Heatmap Cells (Guaranteed Perfect Squares: width === height)
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
                        `<strong>${currentEntityLabel}: </strong>${d.gene}<br/><strong>Cell Line: </strong>${d.cellLine}<br/><strong>${currentValueLabel}: </strong>${d.value.toFixed(2)}<br/><strong>Tissue: </strong>${d.tissue}`
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
            .delay((_, i) => i * 10)
            .attr('opacity', 1);

        // X axis (Cell Lines)
        const xAxis = g.append('g').attr('transform', `translate(0,${actualGridHeight})`).call(d3.axisBottom(xScale));

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
            .attr('x', actualGridWidth / 2)
            .attr('y', actualGridHeight + 75)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Cell Line / Sample');

        // Y axis (Genes / Drugs)
        const yAxis = g.append('g').call(d3.axisLeft(yScale));

        yAxis.select('.domain').remove();
        yAxis.selectAll('.tick line').remove();
        yAxis
            .selectAll('.tick text')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text(d => {
                const str = String(d);
                return str.length > 13 ? `${str.substring(0, 12)}…` : str;
            })
            .each(function (d) {
                const str = String(d);
                if (str.length > 13) {
                    d3.select(this).append('title').text(str);
                }
            });

        // Y axis label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -actualGridHeight / 2)
            .attr('y', -75)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text(currentEntityLabel);

        // Color legend
        const legendWidth = 140;
        const legendHeight = 12;

        // Position legends anchored to the top right of the grid
        const legendsY = -62;
        const legendAnchorX = Math.max(actualGridWidth, 270);
        const expressionLegendX = legendAnchorX - 260;
        const tissueLegendX = legendAnchorX - 85;

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
            .text(currentValueLabel);

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
    }, [data, width, height, genes, numGenes, numCellLines, cellSize, availableW, currentEntityLabel, currentValueLabel]);

    return (
        <div ref={containerRef} style={{ position: 'relative', width: '100%', minHeight: height, overflow: 'hidden' }}>
            <svg ref={svgRef} style={{ width: '100%', height: height }} />
        </div>
    );
};

export default Heatmap;
