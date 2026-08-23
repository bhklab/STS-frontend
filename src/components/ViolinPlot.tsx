import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useContainerSize } from '../hooks/useContainerSize';
import * as d3 from 'd3';
import { type PlotDataPoint, TISSUE_COLORS, DEFAULT_COLOR } from './DotPlot';

interface ViolinPlotProps {
    data: Record<string, PlotDataPoint[]>;
    layerName?: string;
}

// Deterministic pseudo-random generator for stable point jitter
function pseudoRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = (hash << 5) - hash + seed.charCodeAt(i);
        hash |= 0;
    }
    const sin = Math.sin(hash) * 10000;
    return (sin - Math.floor(sin)) * 2 - 1; // [-1, 1]
}

// Gaussian kernel function
function kernelGaussian(u: number): number {
    return (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);
}

// Silverman's rule of thumb bandwidth estimator with relative floor based on data range
function getBandwidth(values: number[], globalSpan: number): number {
    const n = values.length;
    if (n <= 1) {
        return Math.max(globalSpan * 0.08, 0.05);
    }
    const stdDev = d3.deviation(values) ?? 0;
    if (stdDev <= 0) {
        return Math.max(globalSpan * 0.08, 0.05);
    }
    // Silverman's rule: 1.06 * stdDev * n^(-1/5)
    const bw = 1.06 * stdDev * Math.pow(n, -0.2);
    // Relative floor: at least 1.5% of the overall gene span, but never 0
    const floor = Math.max(globalSpan * 0.015, 0.001);
    return Math.max(bw, floor);
}

interface KDEData {
    kde: [number, number][]; // [y, density]
    tMin: number;
    tMax: number;
    maxDensity: number;
}

// 1D Kernel Density Estimator per tissue
function computeTissueKDE(values: number[], globalSpan: number, steps = 80): KDEData {
    if (values.length === 0) {
        return { kde: [], tMin: 0, tMax: 0, maxDensity: 1 };
    }

    const bw = getBandwidth(values, globalSpan);
    const vMin = d3.min(values)!;
    const vMax = d3.max(values)!;

    // Extend by 1.5 * bandwidth for natural smooth tapering tails
    const tMin = vMin - 1.5 * bw;
    const tMax = vMax + 1.5 * bw;
    const stepSize = (tMax - tMin) / Math.max(steps - 1, 1);
    const n = values.length;

    const densityPoints: [number, number][] = [];
    let maxDensity = 0;

    for (let i = 0; i < steps; i++) {
        const y = tMin + i * stepSize;
        let density = 0;
        for (let j = 0; j < n; j++) {
            density += kernelGaussian((y - values[j]) / bw);
        }
        density = density / (n * bw);

        // Smoothly clamp endpoints to 0 to ensure closed, tapered violins
        if (i === 0 || i === steps - 1) {
            density = 0;
        } else if (i === 1 || i === steps - 2) {
            density = density * 0.5;
        }

        if (density > maxDensity) maxDensity = density;
        densityPoints.push([y, density]);
    }

    if (maxDensity <= 0) maxDensity = 1;

    return {
        kde: densityPoints,
        tMin,
        tMax,
        maxDensity
    };
}

// Interpolate density at specific y value for point jittering
function interpolateDensity(yVal: number, kdePoints: [number, number][]): number {
    if (kdePoints.length === 0) return 0;
    if (yVal <= kdePoints[0][0]) return kdePoints[0][1];
    if (yVal >= kdePoints[kdePoints.length - 1][0]) return kdePoints[kdePoints.length - 1][1];

    for (let i = 0; i < kdePoints.length - 1; i++) {
        const [y1, d1] = kdePoints[i];
        const [y2, d2] = kdePoints[i + 1];
        if (yVal >= y1 && yVal <= y2) {
            const t = (yVal - y1) / (y2 - y1);
            return d1 + t * (d2 - d1);
        }
    }
    return 0;
}

// Single Violin Chart Component (Styled consistently with DotPlot & Heatmap)
interface SingleViolinChartProps {
    geneName: string;
    points: PlotDataPoint[];
    width: number;
    height: number;
    showLegend?: boolean;
    yAxisTitle?: string;
    isCompact?: boolean;
}

const SingleViolinChart: React.FC<SingleViolinChartProps> = ({
    geneName,
    points,
    width,
    height,
    showLegend = true,
    yAxisTitle = 'Value',
    isCompact = false
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current || points.length === 0 || width <= 0 || height <= 0) return;

        // Group points by tissue
        const tissues = Array.from(new Set(points.map(d => d.tissue))).filter(Boolean);
        // Put 'Soft Tissue' first if available for consistent ordering
        tissues.sort((a, b) => {
            if (a === 'Soft Tissue') return -1;
            if (b === 'Soft Tissue') return 1;
            return a.localeCompare(b);
        });

        // Dimensions consistent with DotPlot
        const margin = isCompact
            ? { top: 30, right: showLegend ? 130 : 25, bottom: 60, left: 60 }
            : { top: 35, right: showLegend ? 160 : 35, bottom: 70, left: 70 };

        const innerW = Math.max(width - margin.left - margin.right, 40);
        const innerH = Math.max(height - margin.top - margin.bottom, 40);

        // Global min/max values for this gene
        const rawValues = points.map(d => d.value);
        const rawMin = d3.min(rawValues) ?? 0;
        const rawMax = d3.max(rawValues) ?? 1;
        const globalSpan = rawMax - rawMin || 1;

        // Compute KDE per tissue
        const tissueKDEData = new Map<string, KDEData>();
        const allTMins: number[] = [];
        const allTMaxs: number[] = [];

        tissues.forEach(t => {
            const tValues = points.filter(d => d.tissue === t).map(d => d.value);
            if (tValues.length > 0) {
                const kdeData = computeTissueKDE(tValues, globalSpan, 80);
                tissueKDEData.set(t, kdeData);
                allTMins.push(kdeData.tMin);
                allTMaxs.push(kdeData.tMax);
            }
        });

        // Combined Y domain encompassing all violin tails and data points
        const combinedMin = Math.min(d3.min(allTMins) ?? rawMin, rawMin);
        const combinedMax = Math.max(d3.max(allTMaxs) ?? rawMax, rawMax);
        const totalSpan = combinedMax - combinedMin || 1;
        const yPadding = totalSpan * 0.08;

        const yDomain: [number, number] = [combinedMin - yPadding, combinedMax + yPadding];

        const yScale = d3.scaleLinear().domain(yDomain).nice().range([innerH, 0]);

        const xScale = d3.scaleBand<string>().domain(tissues).range([0, innerW]).padding(0.35);

        const maxViolinHalfWidth = Math.min(xScale.bandwidth() * 0.44, isCompact ? 55 : 90);

        // Setup SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('font-family', "'Roboto', 'Inter', system-ui, sans-serif");

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Subtle horizontal grid lines (matching DotPlot)
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

        // Tooltip
        const containerEl = svgRef.current.parentElement;
        let tooltip = d3.select(containerEl).select<HTMLDivElement>('.violin-tooltip');
        if (tooltip.empty() && containerEl) {
            tooltip = d3
                .select(containerEl)
                .append('div')
                .attr('class', 'violin-tooltip')
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
        }

        // 1. Violins
        tissues.forEach(tissue => {
            const kdeData = tissueKDEData.get(tissue);
            if (!kdeData || kdeData.kde.length === 0) return;

            const xCenter = (xScale(tissue) ?? 0) + xScale.bandwidth() / 2;

            // Normalized to each violin's maximum density (scale="width" approach)
            const wScale = d3.scaleLinear().domain([0, kdeData.maxDensity]).range([0, maxViolinHalfWidth]);

            // Closed path: right side going up, left side coming down
            const rightSide = kdeData.kde.map(([y, d]) => ({
                x: xCenter + wScale(d),
                y: yScale(y)
            }));
            const leftSide = kdeData.kde
                .slice()
                .reverse()
                .map(([y, d]) => ({
                    x: xCenter - wScale(d),
                    y: yScale(y)
                }));

            const polygonPoints = [...rightSide, ...leftSide];

            const lineGen = d3
                .line<{ x: number; y: number }>()
                .x(d => d.x)
                .y(d => d.y)
                .curve(d3.curveCatmullRomClosed);

            const pathD = lineGen(polygonPoints);
            const baseColor = TISSUE_COLORS[tissue] ?? DEFAULT_COLOR;
            const strokeColor = d3.color(baseColor)?.darker(0.35).formatHex() ?? '#4a739b';

            if (pathD) {
                g.append('path')
                    .attr('d', pathD)
                    .attr('fill', baseColor)
                    .attr('fill-opacity', 0.75)
                    .attr('stroke', strokeColor)
                    .attr('stroke-width', 1.5)
                    .attr('opacity', 0)
                    .transition()
                    .duration(400)
                    .attr('opacity', 1);
            }
        });

        // 2. Jittered Scatter Points inside violins (matching DotPlot circle aesthetic)
        tissues.forEach(tissue => {
            const tPoints = points.filter(d => d.tissue === tissue);
            const kdeData = tissueKDEData.get(tissue);
            if (!kdeData) return;

            const xCenter = (xScale(tissue) ?? 0) + xScale.bandwidth() / 2;
            const wScale = d3.scaleLinear().domain([0, kdeData.maxDensity]).range([0, maxViolinHalfWidth]);

            const pointGroups = g
                .selectAll(`.dot-group-${tissue.replace(/\s+/g, '')}`)
                .data(tPoints)
                .enter()
                .append('g')
                .attr('class', `dot-group-${tissue.replace(/\s+/g, '')}`);

            pointGroups
                .append('circle')
                .attr('cx', d => {
                    const density = interpolateDensity(d.value, kdeData.kde);
                    const halfW = wScale(density) * 0.7;
                    const jitter = pseudoRandom(d.cellLine) * halfW;
                    return xCenter + jitter;
                })
                .attr('cy', d => yScale(d.value))
                .attr('r', 0)
                .attr('fill', d => TISSUE_COLORS[d.tissue] ?? DEFAULT_COLOR)
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1.2)
                .attr('opacity', 0.95)
                .transition()
                .duration(400)
                .delay((_, i) => i * 8)
                .attr('r', isCompact ? 4.5 : 5.5);

            // Invisible larger hover target for smooth tooltip interaction
            pointGroups
                .append('circle')
                .attr('cx', d => {
                    const density = interpolateDensity(d.value, kdeData.kde);
                    const halfW = wScale(density) * 0.7;
                    const jitter = pseudoRandom(d.cellLine) * halfW;
                    return xCenter + jitter;
                })
                .attr('cy', d => yScale(d.value))
                .attr('r', isCompact ? 10 : 12)
                .attr('fill', 'transparent')
                .style('cursor', 'pointer')
                .on('mouseenter', (_event, d) => {
                    tooltip
                        .html(
                            `<strong>Gene: </strong>${geneName}<br/><strong>Cell Line: </strong>${d.cellLine}<br/><strong>Value: </strong>${d.value.toFixed(2)}<br/><strong>Tissue: </strong>${d.tissue}`
                        )
                        .style('opacity', '1');
                })
                .on('mousemove', event => {
                    const [mx, my] = d3.pointer(event, containerEl);
                    tooltip.style('left', `${mx + 14}px`).style('top', `${my - 10}px`);
                })
                .on('mouseleave', () => {
                    tooltip.style('opacity', '0');
                });
        });

        // 3. Axes (Clean styling matching DotPlot)

        // Left Y Axis
        const yAxis = g.append('g').call(d3.axisLeft(yScale).ticks(isCompact ? 5 : 6));

        yAxis.select('.domain').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick text').attr('fill', '#5f6f7f').attr('font-size', '11px');

        // Y Axis Label
        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerH / 2)
            .attr('y', -48)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text(yAxisTitle);

        // Bottom X Axis
        const xAxis = g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale));

        xAxis.select('.domain').attr('stroke', '#c4cdd5');
        xAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        xAxis
            .selectAll('.tick text')
            .attr('fill', '#5f6f7f')
            .attr('font-size', isCompact ? '11px' : '12px')
            .attr('dy', '1em');

        // X Axis Label
        g.append('text')
            .attr('x', innerW / 2)
            .attr('y', innerH + 45)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Tissue');

        // 4. Legend (Matching DotPlot tissue legend)
        if (showLegend) {
            const legend = g.append('g').attr('transform', `translate(${innerW + 20}, 0)`);

            // Header
            legend
                .append('text')
                .attr('x', 0)
                .attr('y', 0)
                .attr('fill', '#1f2937')
                .attr('font-size', '13px')
                .attr('font-weight', '600')
                .text('Tissue');

            tissues.forEach((t, i) => {
                const row = legend.append('g').attr('transform', `translate(0, ${16 + i * 20})`);

                row.append('circle')
                    .attr('cx', 5)
                    .attr('cy', 0)
                    .attr('r', 4.5)
                    .attr('fill', TISSUE_COLORS[t] ?? DEFAULT_COLOR);

                row.append('text').attr('x', 14).attr('y', 4).attr('fill', '#5f6f7f').attr('font-size', '11px').text(t);
            });
        }
    }, [points, width, height, geneName, showLegend, yAxisTitle, isCompact]);

    return (
        <div style={{ position: 'relative', width: '100%', height: height || 'auto', overflow: 'hidden' }}>
            <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        </div>
    );
};

// Main ViolinPlot Component
const ViolinPlot: React.FC<ViolinPlotProps> = ({ data, layerName = 'RNA-seq' }) => {
    const geneNames = useMemo(() => Object.keys(data), [data]);
    const [selectedGene, setSelectedGene] = useState<string>(geneNames[0] || '');

    const [containerRef, width] = useContainerSize();

    // Ensure selected gene is valid if data changes
    useEffect(() => {
        if (geneNames.length > 0 && !geneNames.includes(selectedGene)) {
            setSelectedGene(geneNames[0]);
        }
    }, [geneNames, selectedGene]);

    const isMultiGene = geneNames.length > 1;

    // Responsive height matching DotPlot
    const height = Math.max(Math.round(width * 0.5), 450);

    const activeGene = selectedGene || geneNames[0] || '';

    return (
        <div className="flex flex-col w-full" ref={containerRef}>
            {/* Header (matching DotPlot header style) */}
            {geneNames.length > 0 && (
                <div className="mb-3 flex flex-row justify-center items-center gap-1">
                    <h1 className="text-headingMd font-semibold text-text-primary">Selected:</h1>
                    <h2 className="text-headingSm text-text-primary font-light text-wrap break-words">
                        {isMultiGene ? activeGene : geneNames.join(', ')}
                    </h2>
                </div>
            )}

            {/* Clean gene switcher pills when multiple genes are selected */}
            {isMultiGene && (
                <div className="flex flex-row flex-wrap justify-center items-center gap-1.5 mb-4 overflow-x-auto pb-1 max-w-full">
                    {geneNames.map(g => (
                        <button
                            key={g}
                            type="button"
                            onClick={() => setSelectedGene(g)}
                            className={`px-3 py-1 rounded-md text-bodySm transition-all cursor-pointer ${
                                activeGene === g
                                    ? 'bg-primary text-white font-medium shadow-sm'
                                    : 'bg-background hover:bg-subsection-1 text-text-primary border border-border/75'
                            }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            )}

            {/* Plot rendering */}
            {geneNames.length === 0 ? (
                <div className="flex justify-center items-center py-12 text-text-secondary">No data available</div>
            ) : (
                <div className="w-full flex justify-center">
                    <div className="w-full">
                        {width > 0 && (
                            <SingleViolinChart
                                geneName={activeGene}
                                points={data[activeGene] || []}
                                width={width}
                                height={height}
                                showLegend={true}
                                yAxisTitle="Value"
                                isCompact={false}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViolinPlot;
