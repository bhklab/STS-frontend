import React, { useRef, useEffect } from 'react';
import { useContainerSize } from '../hooks/useContainerSize';
import * as d3 from 'd3';
import { buildTooltipHtml } from './tooltipUtils';

import { type PlotDataPoint, TISSUE_COLORS, GENE_COLORS, DEFAULT_COLOR } from './plotConstants';

export type { PlotDataPoint };

interface DotPlotProps {
    data: Record<string, PlotDataPoint[]>;
    treatment?: boolean;
    entityLabel?: string;
    valueLabel?: string;
}

interface FlatDataPoint extends PlotDataPoint {
    gene: string;
}

const DotPlot: React.FC<DotPlotProps> = ({ data, treatment, entityLabel, valueLabel }) => {
    const currentEntityLabel = entityLabel ?? (treatment ? 'Drug' : 'Gene');
    const currentValueLabel = valueLabel ?? (treatment ? 'Response' : 'Value');

    const svgRef = useRef<SVGSVGElement | null>(null);
    const [containerRef, width] = useContainerSize();
    const height = Math.max(Math.round(width * 0.5), 450);

    useEffect(() => {
        const geneNames = Object.keys(data);
        if (!svgRef.current || geneNames.length === 0 || width === 0) return;

        // Flatten data
        const flat: FlatDataPoint[] = [];
        geneNames.forEach(gene => {
            (data[gene] || []).forEach(p => {
                flat.push({ ...p, gene });
            });
        });

        if (flat.length === 0) return;

        const isSingleGene = geneNames.length === 1;
        const colWidth = 85;
        const maxRows = Math.ceil(geneNames.length / 2);

        // Dimensions
        const margin = { top: 30, right: 220, bottom: 100, left: 70 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        // Sort cell lines
        let cellLines: string[] = [];
        if (isSingleGene) {
            const sorted = [...flat].sort((a, b) => a.value - b.value);
            cellLines = Array.from(new Set(sorted.map(d => d.cellLine)));
        } else {
            const cellLineAvg = new Map<string, number>();
            const cellLineCount = new Map<string, number>();
            flat.forEach(d => {
                cellLineAvg.set(d.cellLine, (cellLineAvg.get(d.cellLine) ?? 0) + d.value);
                cellLineCount.set(d.cellLine, (cellLineCount.get(d.cellLine) ?? 0) + 1);
            });
            cellLines = Array.from(cellLineAvg.keys()).sort((a, b) => {
                const avgA = (cellLineAvg.get(a) ?? 0) / (cellLineCount.get(a) ?? 1);
                const avgB = (cellLineAvg.get(b) ?? 0) / (cellLineCount.get(b) ?? 1);
                return avgA - avgB;
            });
        }

        // Scales
        const xScale = d3.scaleBand<string>().domain(cellLines).range([0, innerW]).padding(0.3);

        const yExtent = d3.extent(flat, d => d.value) as [number, number];
        const yPadding = (yExtent[1] - yExtent[0]) * 0.1 || 1;

        const yScale = d3
            .scaleLinear()
            .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
            .nice()
            .range([innerH, 0]);

        const geneColorScale = d3.scaleOrdinal<string, string>().domain(geneNames).range(GENE_COLORS);

        // SVG
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
            .text(currentValueLabel);

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
            .style('z-index', '20')
            .style('white-space', 'nowrap');

        const getCx = (d: FlatDataPoint) => {
            const base = xScale(d.cellLine) ?? 0;
            return base + xScale.bandwidth() / 2;
        };

        // Connecting lines per gene (drawn before dots so dots sit on top)
        const cellLineOrder = new Map(cellLines.map((cl, i) => [cl, i]));

        geneNames.forEach(geneName => {
            const genePoints = flat
                .filter(d => d.gene === geneName)
                .sort((a, b) => (cellLineOrder.get(a.cellLine) ?? 0) - (cellLineOrder.get(b.cellLine) ?? 0));

            const lineGenerator = d3
                .line<FlatDataPoint>()
                .x(d => getCx(d))
                .y(d => yScale(d.value))
                .curve(d3.curveMonotoneX);

            g.append('path')
                .datum(genePoints)
                .attr('class', 'gene-line')
                .attr('fill', 'none')
                .attr('stroke', geneColorScale(geneName))
                .attr('stroke-width', 2.5)
                .attr('stroke-opacity', 0.8)
                .attr('d', lineGenerator);
        });

        // Dots (Always colored by tissue, outlined with gene color)
        g.selectAll('.dot')
            .data(flat)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', getCx)
            .attr('cy', d => yScale(d.value))
            .attr('r', 0)
            .attr('fill', d => TISSUE_COLORS[d.tissue] ?? DEFAULT_COLOR)
            .attr('stroke', d => (isSingleGene ? '#ffffff' : geneColorScale(d.gene)))
            .attr('stroke-width', isSingleGene ? 1 : 1.5)
            .attr('opacity', 0.95)
            .transition()
            .duration(400)
            .delay((_, i) => i * 8)
            .attr('r', isSingleGene ? 6 : 5);

        // Hover targets
        g.selectAll('.dot-hover')
            .data(flat)
            .enter()
            .append('circle')
            .attr('class', 'dot-hover')
            .attr('cx', getCx)
            .attr('cy', d => yScale(d.value))
            .attr('r', 12)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('mouseenter', (_event, d) => {
                tooltip
                    .html(buildTooltipHtml(currentEntityLabel, d.gene, currentValueLabel, d))
                    .style('opacity', '1');
            })
            .on('mousemove', event => {
                const [mx, my] = d3.pointer(event, svgRef.current!.parentElement!);
                tooltip.style('left', `${mx + 14}px`).style('top', `${my - 10}px`);
            })
            .on('mouseleave', () => {
                tooltip.style('opacity', '0');
            });

        // Legend Group via foreignObject for auto-wrapping multi-line text
        const legendForeign = g
            .append('foreignObject')
            .attr('x', innerW + 15)
            .attr('y', 0)
            .attr('width', margin.right - 20)
            .attr('height', innerH + margin.bottom);

        const legendContainer = legendForeign
            .append('xhtml:div')
            .style('font-family', "'Roboto', 'Inter', system-ui, sans-serif")
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('gap', '16px')
            .style('max-height', `${innerH + margin.bottom}px`)
            .style('overflow-y', 'auto')
            .style('padding-right', '4px');

        // 1. Entities Section (Wrapped text)
        const entitySection = legendContainer.append('xhtml:div');
        entitySection
            .append('xhtml:div')
            .style('font-size', '13px')
            .style('font-weight', '600')
            .style('color', '#1f2937')
            .style('margin-bottom', '8px')
            .text(`${currentEntityLabel}s`);

        const entityGrid = entitySection
            .append('xhtml:div')
            .style('display', 'grid')
            .style('grid-template-columns', isSingleGene ? '1fr' : 'repeat(2, 1fr)')
            .style('gap', '8px 10px');

        geneNames.forEach(gName => {
            const item = entityGrid
                .append('xhtml:div')
                .style('display', 'flex')
                .style('align-items', 'flex-start')
                .style('gap', '6px');

            item.append('xhtml:span')
                .style('display', 'inline-block')
                .style('width', '12px')
                .style('height', '3px')
                .style('background', geneColorScale(gName))
                .style('margin-top', '6px')
                .style('flex-shrink', '0')
                .style('border-radius', '1.5px');

            item.append('xhtml:span')
                .style('font-size', '11px')
                .style('color', '#5f6f7f')
                .style('line-height', '1.3')
                .style('word-break', 'break-word')
                .style('overflow-wrap', 'break-word')
                .text(gName);
        });

        // 2. Tissue Section
        const tissueSection = legendContainer.append('xhtml:div');
        tissueSection
            .append('xhtml:div')
            .style('font-size', '13px')
            .style('font-weight', '600')
            .style('color', '#1f2937')
            .style('margin-bottom', '8px')
            .text('Tissue Plot Dots');

        const tissueList = tissueSection
            .append('xhtml:div')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('gap', '6px');

        const tissues = Array.from(new Set(flat.map(d => d.tissue)));
        tissues.forEach(t => {
            const item = tissueList
                .append('xhtml:div')
                .style('display', 'flex')
                .style('align-items', 'center')
                .style('gap', '6px');

            item.append('xhtml:span')
                .style('display', 'inline-block')
                .style('width', '9px')
                .style('height', '9px')
                .style('border-radius', '50%')
                .style('background', TISSUE_COLORS[t] ?? DEFAULT_COLOR)
                .style('flex-shrink', '0');

            item.append('xhtml:span')
                .style('font-size', '11px')
                .style('color', '#5f6f7f')
                .style('word-break', 'break-word')
                .text(t);
        });

        return () => {
            tooltip.remove();
        };
    }, [data, width, height, currentEntityLabel, currentValueLabel]);

    const geneNames = Object.keys(data);

    return (
        <div className="flex flex-col w-full">
            {/* Simple Text Header */}
            {geneNames.length > 0 && (
                <div className="mb-2 flex flex-row justify-center items-center gap-1">
                    <h1 className="text-headingMd font-semibold text-text-primary">Selected:</h1>
                    <h2 className="text-headingSm text-text-primary font-light text-wrap break-words">
                        {geneNames.join(', ')}
                    </h2>
                </div>
            )}

            <div
                ref={containerRef}
                style={{ position: 'relative', width: '100%', height: height || 'auto', overflow: 'hidden' }}
            >
                <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0 }} />
            </div>
        </div>
    );
};

export default DotPlot;
