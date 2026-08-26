import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { useContainerSize } from '../hooks/useContainerSize';
import { GENE_COLORS, TISSUE_COLORS, DEFAULT_COLOR } from './plotConstants';
import type { ExemplarTile, ImagingCluster } from './ClusterTileDetail';

interface ImagingScatterPlotProps {
    data: ExemplarTile[];
    clusters: ImagingCluster[];
    selectedClusterId: number | null;
    onSelectCluster: (clusterId: number | null) => void;
    colorBy?: 'cluster' | 'histology' | 'tissue';
}

const HISTOLOGY_COLORS: Record<string, string> = {
    DDLPS: '#3b82f6',
    LMS: '#10b981',
    UPS: '#f59e0b',
    MFS: '#ec4899',
    SS: '#8b5cf6',
    MFH: '#6366f1',
    Other: '#64748b',
    Unknown: '#94a3b8',
};

const ImagingScatterPlot: React.FC<ImagingScatterPlotProps> = ({
    data,
    clusters,
    selectedClusterId,
    onSelectCluster,
    colorBy = 'cluster',
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);
    const [containerRef, width] = useContainerSize();
    const height = Math.max(Math.round(width * 0.5), 480);

    useEffect(() => {
        if (!svgRef.current || data.length === 0 || width === 0) return;

        // Dimensions matching DotPlot
        const margin = { top: 30, right: 220, bottom: 80, left: 70 };
        const innerW = width - margin.left - margin.right;
        const innerH = height - margin.top - margin.bottom;

        // Coordinate Extents
        const xExtent = d3.extent(data, d => d.umap1) as [number, number];
        const yExtent = d3.extent(data, d => d.umap2) as [number, number];

        const xPadding = (xExtent[1] - xExtent[0]) * 0.08 || 1;
        const yPadding = (yExtent[1] - yExtent[0]) * 0.08 || 1;

        const xScale = d3
            .scaleLinear()
            .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
            .nice()
            .range([0, innerW]);

        const yScale = d3
            .scaleLinear()
            .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
            .nice()
            .range([innerH, 0]);

        const getColor = (d: ExemplarTile): string => {
            if (colorBy === 'histology') {
                const hist = d.histology || 'Unknown';
                return HISTOLOGY_COLORS[hist] ?? DEFAULT_COLOR;
            } else if (colorBy === 'tissue') {
                return TISSUE_COLORS[d.tissue || 'Soft Tissue'] ?? DEFAULT_COLOR;
            }
            return GENE_COLORS[d.cluster_id % GENE_COLORS.length];
        };

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('font-family', "'Roboto', 'Inter', system-ui, sans-serif");

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Grid lines (matching DotPlot styling)
        g.append('g')
            .attr('class', 'grid')
            .call(
                d3
                    .axisLeft(yScale)
                    .ticks(6)
                    .tickSize(-innerW)
                    .tickFormat(() => '')
            )
            .selectAll('line')
            .attr('stroke', '#e8ecef')
            .attr('stroke-dasharray', '3,3');

        g.append('g')
            .attr('class', 'grid')
            .attr('transform', `translate(0,${innerH})`)
            .call(
                d3
                    .axisBottom(xScale)
                    .ticks(6)
                    .tickSize(-innerH)
                    .tickFormat(() => '')
            )
            .selectAll('line')
            .attr('stroke', '#e8ecef')
            .attr('stroke-dasharray', '3,3');

        g.selectAll('.grid .domain').remove();

        // Y Axis
        const yAxis = g.append('g').call(d3.axisLeft(yScale).ticks(6));
        yAxis.select('.domain').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick text').attr('fill', '#5f6f7f').attr('font-size', '11px');

        // Y Axis Label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerH / 2)
            .attr('y', -50)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Morphological Latent Dimension 2 (PC-2)');

        // X Axis
        const xAxis = g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale).ticks(6));
        xAxis.select('.domain').attr('stroke', '#c4cdd5');
        xAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        xAxis.selectAll('.tick text').attr('fill', '#5f6f7f').attr('font-size', '11px');

        // X Axis Label
        g.append('text')
            .attr('x', innerW / 2)
            .attr('y', innerH + 45)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Morphological Latent Dimension 1 (PC-1)');

        // Tooltip (attached to container, identical to DotPlot)
        const tooltip = d3
            .select(svgRef.current.parentElement)
            .append('div')
            .style('position', 'absolute')
            .style('pointer-events', 'none')
            .style('background', 'rgba(31,41,55,0.92)')
            .style('color', '#fff')
            .style('padding', '8px 12px')
            .style('border-radius', '6px')
            .style('font-size', '12px')
            .style('line-height', '1.4')
            .style('opacity', '0')
            .style('transition', 'opacity 0.15s ease')
            .style('z-index', '20')
            .style('white-space', 'nowrap')
            .style('box-shadow', '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)');

        // Scatter Dots
        g.selectAll('.dot')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => xScale(d.umap1))
            .attr('cy', d => yScale(d.umap2))
            .attr('r', 0)
            .attr('fill', d => getColor(d))
            .attr('stroke', d => (selectedClusterId !== null && d.cluster_id === selectedClusterId ? '#ffffff' : 'none'))
            .attr('stroke-width', d => (selectedClusterId !== null && d.cluster_id === selectedClusterId ? 1.5 : 0))
            .attr('opacity', d => {
                if (selectedClusterId !== null) {
                    return d.cluster_id === selectedClusterId ? 0.95 : 0.18;
                }
                return 0.8;
            })
            .transition()
            .duration(350)
            .delay((_, i) => Math.min(i * 0.5, 400))
            .attr('r', d => (selectedClusterId !== null && d.cluster_id === selectedClusterId ? 5 : 3.5));

        // Hover Targets & Interactivity
        g.selectAll('.dot-hover')
            .data(data)
            .enter()
            .append('circle')
            .attr('class', 'dot-hover')
            .attr('cx', d => xScale(d.umap1))
            .attr('cy', d => yScale(d.umap2))
            .attr('r', 8)
            .attr('fill', 'transparent')
            .style('cursor', 'pointer')
            .on('mouseenter', (_event, d) => {
                const color = getColor(d);
                tooltip
                    .html(`
                        <div style="font-family: inherit; font-size: 12px; line-height: 1.4;">
                            <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                                <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${color};"></span>
                                <strong style="color: #fff; font-size: 13px;">${d.cluster}</strong>
                                <span style="color: #94a3b8; font-size: 11px;">#${d.tile_index}</span>
                            </div>
                            <div><span style="color: #94a3b8;">Patient:</span> <strong>${d.patient_id}</strong></div>
                            <div><span style="color: #94a3b8;">Slide:</span> <span style="font-family: inherit; font-size: 11px; word-break: break-all;"><strong>${d.slide_id}</strong></span></div>
                            <div><span style="color: #94a3b8;">Histology:</span> <strong>${d.histology || 'Unknown'}</strong></div>
                            <div><span style="color: #94a3b8;">PC-1:</span> <span style="font-family: monospace; color: #fff;">${d.umap1 >= 0 ? '+' : ''}${d.umap1.toFixed(3)}</span> &nbsp;|&nbsp; <span style="color: #94a3b8;">PC-2:</span> <span style="font-family: monospace; color: #fff;">${d.umap2 >= 0 ? '+' : ''}${d.umap2.toFixed(3)}</span></div>
                            <div><span style="color: #94a3b8;">Centroid Dist:</span> ${d.dist_to_centroid.toFixed(3)}</div>
                            <div style="margin-top: 5px; font-size: 10px; color: #38bdf8;">
                                Click point to inspect exemplar tiles
                            </div>
                        </div>
                    `)
                    .style('opacity', '1');
            })
            .on('mousemove', event => {
                const [mx, my] = d3.pointer(event, svgRef.current!.parentElement!);
                tooltip.style('left', `${mx + 14}px`).style('top', `${my - 10}px`);
            })
            .on('mouseleave', () => {
                tooltip.style('opacity', '0');
            })
            .on('click', (_, d) => {
                if (selectedClusterId === d.cluster_id) {
                    onSelectCluster(null);
                } else {
                    onSelectCluster(d.cluster_id);
                }
            });

        // Legend Group via foreignObject (matching DotPlot styling)
        const legendForeign = g
            .append('foreignObject')
            .attr('x', innerW + 15)
            .attr('y', 0)
            .attr('width', margin.right - 10)
            .attr('height', innerH + margin.bottom);

        const legendContainer = legendForeign
            .append('xhtml:div')
            .style('font-family', "'Roboto', 'Inter', system-ui, sans-serif")
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('gap', '14px')
            .style('max-height', `${innerH + margin.bottom}px`)
            .style('overflow-y', 'auto')
            .style('padding-right', '4px');

        // Legend Title
        const legendSection = legendContainer.append('xhtml:div');
        legendSection
            .append('xhtml:div')
            .style('display', 'flex')
            .style('align-items', 'center')
            .style('justify-content', 'space-between')
            .style('margin-bottom', '8px')
            .html(`
                <span style="font-size: 13px; font-weight: 600; color: #1f2937;">
                    ${colorBy === 'histology' ? 'Histologies' : colorBy === 'tissue' ? 'Tissues' : 'Clusters / Archetypes'}
                </span>
                ${selectedClusterId !== null ? `<span style="font-size: 11px; color: #2563eb; cursor: pointer; text-decoration: underline;">Clear</span>` : ''}
            `)
            .on('click', () => {
                if (selectedClusterId !== null) onSelectCluster(null);
            });

        const listContainer = legendSection
            .append('xhtml:div')
            .style('display', 'flex')
            .style('flex-direction', 'column')
            .style('gap', '4px');

        if (colorBy === 'cluster') {
            clusters.forEach(c => {
                const isSelected = selectedClusterId === c.cluster_id;
                const clusterColor = GENE_COLORS[c.cluster_id % GENE_COLORS.length];

                const item = listContainer
                    .append('xhtml:div')
                    .style('display', 'flex')
                    .style('align-items', 'center')
                    .style('justify-content', 'space-between')
                    .style('padding', '4px 6px')
                    .style('border-radius', '4px')
                    .style('cursor', 'pointer')
                    .style('background', isSelected ? 'rgba(37, 99, 235, 0.08)' : 'transparent')
                    .style('border', isSelected ? '1px solid rgba(37, 99, 235, 0.3)' : '1px solid transparent')
                    .style('transition', 'all 0.15s ease')
                    .on('click', () => {
                        onSelectCluster(isSelected ? null : c.cluster_id);
                    });

                const left = item.append('xhtml:div').style('display', 'flex').style('align-items', 'center').style('gap', '6px');

                left.append('xhtml:span')
                    .style('display', 'inline-block')
                    .style('width', '9px')
                    .style('height', '9px')
                    .style('border-radius', '50%')
                    .style('background', clusterColor)
                    .style('flex-shrink', '0');

                left.append('xhtml:span')
                    .style('font-size', '11px')
                    .style('color', isSelected ? '#1f2937' : '#5f6f7f')
                    .style('font-weight', isSelected ? '600' : '400')
                    .text(c.name);

                item.append('xhtml:span')
                    .style('font-size', '10px')
                    .style('color', '#94a3b8')
                    .text(`${c.tile_count}`);
            });
        } else if (colorBy === 'histology') {
            const histCounts = new Map<string, number>();
            data.forEach(d => {
                const h = d.histology || 'Unknown';
                histCounts.set(h, (histCounts.get(h) || 0) + 1);
            });

            Array.from(histCounts.entries()).forEach(([hist, count]) => {
                const histColor = HISTOLOGY_COLORS[hist] ?? DEFAULT_COLOR;
                const item = listContainer
                    .append('xhtml:div')
                    .style('display', 'flex')
                    .style('align-items', 'center')
                    .style('justify-content', 'space-between')
                    .style('padding', '3px 4px');

                const left = item.append('xhtml:div').style('display', 'flex').style('align-items', 'center').style('gap', '6px');

                left.append('xhtml:span')
                    .style('display', 'inline-block')
                    .style('width', '9px')
                    .style('height', '9px')
                    .style('border-radius', '50%')
                    .style('background', histColor)
                    .style('flex-shrink', '0');

                left.append('xhtml:span')
                    .style('font-size', '11px')
                    .style('color', '#5f6f7f')
                    .text(hist);

                item.append('xhtml:span')
                    .style('font-size', '10px')
                    .style('color', '#94a3b8')
                    .text(`${count}`);
            });
        } else {
            const tissueCounts = new Map<string, number>();
            data.forEach(d => {
                const t = d.tissue || 'Soft Tissue';
                tissueCounts.set(t, (tissueCounts.get(t) || 0) + 1);
            });

            Array.from(tissueCounts.entries()).forEach(([tissue, count]) => {
                const tissueColor = TISSUE_COLORS[tissue] ?? DEFAULT_COLOR;
                const item = listContainer
                    .append('xhtml:div')
                    .style('display', 'flex')
                    .style('align-items', 'center')
                    .style('justify-content', 'space-between')
                    .style('padding', '3px 4px');

                const left = item.append('xhtml:div').style('display', 'flex').style('align-items', 'center').style('gap', '6px');

                left.append('xhtml:span')
                    .style('display', 'inline-block')
                    .style('width', '9px')
                    .style('height', '9px')
                    .style('border-radius', '50%')
                    .style('background', tissueColor)
                    .style('flex-shrink', '0');

                left.append('xhtml:span')
                    .style('font-size', '11px')
                    .style('color', '#5f6f7f')
                    .text(tissue);

                item.append('xhtml:span')
                    .style('font-size', '10px')
                    .style('color', '#94a3b8')
                    .text(`${count}`);
            });
        }

        return () => {
            tooltip.remove();
        };
    }, [data, clusters, selectedClusterId, colorBy, width, height]);

    return (
        <div className="flex flex-col w-full">
            <div ref={containerRef} style={{ position: 'relative', width: '100%', height: height || 'auto' }}>
                <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0 }} />
            </div>
        </div>
    );
};

export default ImagingScatterPlot;
