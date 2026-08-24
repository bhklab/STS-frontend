/**
 * ViolinPlot Component
 *
 * How the Violin Plot is Produced:
 * A violin plot combines a kernel density estimate (KDE) with overlaid jittered scatter points.
 * For a given dataset (grouped by gene or tissue), values are evaluated across an evenly spaced grid of points.
 * At each evaluation point along the value axis (y), a probability density is computed using a 1D Kernel
 * Density Estimator. The resulting density values are mapped to symmetrical horizontal widths (±x from the center),
 * producing the characteristic violin shape. Individual cell line data points are then rendered on top with
 * deterministic pseudo-random horizontal jitter scaled proportionally to the local violin width at that y-value.
 *
 * Gaussian Kernel Function:
 * The KDE utilizes a standard Gaussian (normal distribution) kernel:
 *   K(u) = (1 / sqrt(2 * PI)) * exp(-0.5 * u^2), where u = (y - x_i) / bandwidth.
 * Each data point contributes a bell curve centered at its value, and their normalized sum forms the continuous
 * density curve.
 *
 * Silverman's Rule of Thumb:
 * The kernel bandwidth (smoothing parameter) controls the trade-off between bias and variance. Bandwidth is
 * estimated using Silverman's Rule of Thumb:
 *   bandwidth = 1.06 * stdDev * (n ^ (-1/5))
 * where stdDev is the sample standard deviation and n is the number of points. To maintain smooth visual rendering
 * and prevent degenerate shapes for narrow distributions or small sample sizes, a relative floor is applied
 * based on the global span of the data.
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useContainerSize } from '../hooks/useContainerSize';
import * as d3 from 'd3';
import { type PlotDataPoint, TISSUE_COLORS, DEFAULT_COLOR } from './DotPlot';

interface ViolinPlotProps {
    data: Record<string, PlotDataPoint[]>;
    layerName?: string;
    treatment?: boolean;
    entityLabel?: string;
    valueLabel?: string;
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

// 1D Kernel Density Estimator
function computeKDEData(values: number[], globalSpan: number, steps = 80): KDEData {
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

// Helper to create or select a tooltip in the container
function getOrCreateTooltip(containerEl: HTMLElement | null) {
    if (!containerEl) return null;
    let tooltip = d3.select(containerEl).select<HTMLDivElement>('.violin-tooltip');
    if (tooltip.empty()) {
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
    return tooltip;
}

// --------------------------------------------------------------------------------------
// 1. Single Gene View (Tissues across X-axis: "Soft Tissue", "Uterus")
// --------------------------------------------------------------------------------------
interface SingleViolinChartProps {
    geneName: string;
    points: PlotDataPoint[];
    width: number;
    height: number;
    showLegend?: boolean;
    yAxisTitle?: string;
    entityLabel?: string;
}

const SingleViolinChart: React.FC<SingleViolinChartProps> = ({
    geneName,
    points,
    width,
    height,
    showLegend = true,
    yAxisTitle = 'Value',
    entityLabel = 'Gene'
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current || points.length === 0 || width <= 0 || height <= 0) return;

        // Group points by tissue
        const tissues = Array.from(new Set(points.map(d => d.tissue))).filter(Boolean);
        tissues.sort((a, b) => {
            if (a === 'Soft Tissue') return -1;
            if (b === 'Soft Tissue') return 1;
            return a.localeCompare(b);
        });

        const margin = { top: 35, right: showLegend ? 160 : 35, bottom: 70, left: 70 };
        const innerW = Math.max(width - margin.left - margin.right, 40);
        const innerH = Math.max(height - margin.top - margin.bottom, 40);

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
                const kdeData = computeKDEData(tValues, globalSpan, 80);
                tissueKDEData.set(t, kdeData);
                allTMins.push(kdeData.tMin);
                allTMaxs.push(kdeData.tMax);
            }
        });

        // Combined Y domain
        const combinedMin = Math.min(d3.min(allTMins) ?? rawMin, rawMin);
        const combinedMax = Math.max(d3.max(allTMaxs) ?? rawMax, rawMax);
        const totalSpan = combinedMax - combinedMin || 1;
        const yPadding = totalSpan * 0.08;

        const yDomain: [number, number] = [combinedMin - yPadding, combinedMax + yPadding];
        const yScale = d3.scaleLinear().domain(yDomain).nice().range([innerH, 0]);

        const xScale = d3.scaleBand<string>().domain(tissues).range([0, innerW]).padding(0.35);
        const maxViolinHalfWidth = Math.min(xScale.bandwidth() * 0.44, 90);

        // Setup SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('font-family', "'Roboto', 'Inter', system-ui, sans-serif");

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Horizontal dashed grid lines
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

        const containerEl = svgRef.current.parentElement;
        const tooltip = getOrCreateTooltip(containerEl);

        // 1. Violins
        tissues.forEach(tissue => {
            const kdeData = tissueKDEData.get(tissue);
            if (!kdeData || kdeData.kde.length === 0) return;

            const xCenter = (xScale(tissue) ?? 0) + xScale.bandwidth() / 2;
            const wScale = d3.scaleLinear().domain([0, kdeData.maxDensity]).range([0, maxViolinHalfWidth]);

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

        // 2. Scatter Points inside violins
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
                .attr('r', 5.5);

            // Hover target
            pointGroups
                .append('circle')
                .attr('cx', d => {
                    const density = interpolateDensity(d.value, kdeData.kde);
                    const halfW = wScale(density) * 0.7;
                    const jitter = pseudoRandom(d.cellLine) * halfW;
                    return xCenter + jitter;
                })
                .attr('cy', d => yScale(d.value))
                .attr('r', 12)
                .attr('fill', 'transparent')
                .style('cursor', 'pointer')
                .on('mouseenter', (_event, d) => {
                    if (tooltip) {
                        tooltip
                            .html(
                                `<strong>${entityLabel}: </strong>${geneName}<br/><strong>Cell Line: </strong>${d.cellLine}<br/><strong>${yAxisTitle}: </strong>${d.value.toFixed(2)}<br/><strong>Tissue: </strong>${d.tissue}`
                            )
                            .style('opacity', '1');
                    }
                })
                .on('mousemove', event => {
                    if (tooltip) {
                        const [mx, my] = d3.pointer(event, containerEl);
                        tooltip.style('left', `${mx + 14}px`).style('top', `${my - 10}px`);
                    }
                })
                .on('mouseleave', () => {
                    if (tooltip) tooltip.style('opacity', '0');
                });
        });

        // 3. Axes
        const yAxis = g.append('g').call(d3.axisLeft(yScale).ticks(6));
        yAxis.select('.domain').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick text').attr('fill', '#5f6f7f').attr('font-size', '11px');

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerH / 2)
            .attr('y', -48)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text(yAxisTitle);

        const xAxis = g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale));
        xAxis.select('.domain').attr('stroke', '#c4cdd5');
        xAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        xAxis.selectAll('.tick text').attr('fill', '#5f6f7f').attr('font-size', '12px').attr('dy', '1em');

        g.append('text')
            .attr('x', innerW / 2)
            .attr('y', innerH + 45)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text('Tissue');

        // 4. Legend
        if (showLegend) {
            const legend = g.append('g').attr('transform', `translate(${innerW + 20}, 0)`);
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
    }, [points, width, height, geneName, showLegend, yAxisTitle, entityLabel]);

    return (
        <div style={{ position: 'relative', width: '100%', height: height || 'auto', overflow: 'hidden' }}>
            <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        </div>
    );
};

// --------------------------------------------------------------------------------------
// 2. All Genes View (Genes across X-axis, one unified violin per gene with tissue-colored dots)
// --------------------------------------------------------------------------------------
interface AllGenesViolinChartProps {
    data: Record<string, PlotDataPoint[]>;
    geneNames: string[];
    width: number;
    height: number;
    yAxisTitle?: string;
    entityLabel?: string;
}

const AllGenesViolinChart: React.FC<AllGenesViolinChartProps> = ({
    data,
    geneNames,
    width,
    height,
    yAxisTitle = 'Value',
    entityLabel = 'Gene'
}) => {
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (!svgRef.current || geneNames.length === 0 || width <= 0 || height <= 0) return;

        // Flatten all points to calculate global Y domain
        const allPoints: PlotDataPoint[] = [];
        const tissuesSet = new Set<string>();

        geneNames.forEach(gene => {
            (data[gene] || []).forEach(p => {
                allPoints.push(p);
                if (p.tissue) tissuesSet.add(p.tissue);
            });
        });

        if (allPoints.length === 0) return;

        const tissues = Array.from(tissuesSet);
        tissues.sort((a, b) => {
            if (a === 'Soft Tissue') return -1;
            if (b === 'Soft Tissue') return 1;
            return a.localeCompare(b);
        });

        const isRotated = geneNames.length > 6;
        const margin = { top: 35, right: 160, bottom: isRotated ? 75 : 65, left: 70 };
        const innerW = Math.max(width - margin.left - margin.right, 50);
        const innerH = Math.max(height - margin.top - margin.bottom, 50);

        const rawValues = allPoints.map(d => d.value);
        const rawMin = d3.min(rawValues) ?? 0;
        const rawMax = d3.max(rawValues) ?? 1;
        const globalSpan = rawMax - rawMin || 1;

        // Compute 1 combined KDE per gene (encompassing both soft tissue and uterus)
        const geneKDEData = new Map<string, KDEData>();
        const allTMins: number[] = [];
        const allTMaxs: number[] = [];

        geneNames.forEach(gene => {
            const genePoints = data[gene] || [];
            const gValues = genePoints.map(d => d.value);
            if (gValues.length > 0) {
                const kdeData = computeKDEData(gValues, globalSpan, 80);
                geneKDEData.set(gene, kdeData);
                allTMins.push(kdeData.tMin);
                allTMaxs.push(kdeData.tMax);
            }
        });

        const combinedMin = Math.min(d3.min(allTMins) ?? rawMin, rawMin);
        const combinedMax = Math.max(d3.max(allTMaxs) ?? rawMax, rawMax);
        const totalSpan = combinedMax - combinedMin || 1;
        const yPadding = totalSpan * 0.08;

        const yDomain: [number, number] = [combinedMin - yPadding, combinedMax + yPadding];
        const yScale = d3.scaleLinear().domain(yDomain).nice().range([innerH, 0]);

        // Main X Scale: Genes
        const xScale = d3.scaleBand<string>().domain(geneNames).range([0, innerW]).padding(0.28);
        const maxViolinHalfWidth = Math.min(xScale.bandwidth() * 0.44, 90);

        // Setup SVG
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        svg.attr('width', width)
            .attr('height', height)
            .attr('viewBox', `0 0 ${width} ${height}`)
            .style('font-family', "'Roboto', 'Inter', system-ui, sans-serif");

        const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

        // Horizontal dashed grid lines
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

        const containerEl = svgRef.current.parentElement;
        const tooltip = getOrCreateTooltip(containerEl);

        // Dot radius scaled based on number of genes for optimal clarity
        const dotRadius = geneNames.length <= 4 ? 5.5 : geneNames.length <= 10 ? 4.5 : 3.5;

        // 1. One Violin per Gene with tissue-colored scatter points
        geneNames.forEach(gene => {
            const genePoints = data[gene] || [];
            const kdeData = geneKDEData.get(gene);
            if (!kdeData || kdeData.kde.length === 0) return;

            const xCenter = (xScale(gene) ?? 0) + xScale.bandwidth() / 2;
            const wScale = d3.scaleLinear().domain([0, kdeData.maxDensity]).range([0, maxViolinHalfWidth]);

            // Closed violin path
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

            // Clean Baltic blue tinted neutral violin fill
            if (pathD) {
                g.append('path')
                    .attr('d', pathD)
                    .attr('fill', '#e6f2f7')
                    .attr('fill-opacity', 0.8)
                    .attr('stroke', '#99cadd')
                    .attr('stroke-width', 1.5)
                    .attr('opacity', 0)
                    .transition()
                    .duration(400)
                    .attr('opacity', 1);
            }

            // Scatter points inside this gene violin (colored by tissue!)
            const pointGroups = g
                .selectAll(`.dot-group-${gene}`)
                .data(genePoints)
                .enter()
                .append('g')
                .attr('class', `dot-group-${gene}`);

            pointGroups
                .append('circle')
                .attr('cx', d => {
                    const density = interpolateDensity(d.value, kdeData.kde);
                    const halfW = wScale(density) * 0.72;
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
                .delay((_, i) => i * 6)
                .attr('r', dotRadius);

            // Hover target
            pointGroups
                .append('circle')
                .attr('cx', d => {
                    const density = interpolateDensity(d.value, kdeData.kde);
                    const halfW = wScale(density) * 0.72;
                    const jitter = pseudoRandom(d.cellLine) * halfW;
                    return xCenter + jitter;
                })
                .attr('cy', d => yScale(d.value))
                .attr('r', 10)
                .attr('fill', 'transparent')
                .style('cursor', 'pointer')
                .on('mouseenter', (_event, d) => {
                    if (tooltip) {
                        tooltip
                            .html(
                                `<strong>${entityLabel}: </strong>${gene}<br/><strong>Cell Line: </strong>${d.cellLine}<br/><strong>${yAxisTitle}: </strong>${d.value.toFixed(2)}<br/><strong>Tissue: </strong>${d.tissue}`
                            )
                            .style('opacity', '1');
                    }
                })
                .on('mousemove', event => {
                    if (tooltip) {
                        const [mx, my] = d3.pointer(event, containerEl);
                        tooltip.style('left', `${mx + 14}px`).style('top', `${my - 10}px`);
                    }
                })
                .on('mouseleave', () => {
                    if (tooltip) tooltip.style('opacity', '0');
                });
        });

        // 2. Axes
        const yAxis = g.append('g').call(d3.axisLeft(yScale).ticks(6));
        yAxis.select('.domain').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');
        yAxis.selectAll('.tick text').attr('fill', '#5f6f7f').attr('font-size', '11px');

        g.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('x', -innerH / 2)
            .attr('y', -48)
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text(yAxisTitle);

        const xAxis = g.append('g').attr('transform', `translate(0,${innerH})`).call(d3.axisBottom(xScale));
        xAxis.select('.domain').attr('stroke', '#c4cdd5');
        xAxis.selectAll('.tick line').attr('stroke', '#c4cdd5');

        if (isRotated) {
            xAxis
                .selectAll('.tick text')
                .attr('fill', '#5f6f7f')
                .attr('font-size', '11px')
                .attr('text-anchor', 'end')
                .attr('transform', 'rotate(-35)')
                .attr('dx', '-0.5em')
                .attr('dy', '0.2em')
                .text(d => {
                    const str = String(d);
                    return str.length > 14 ? `${str.substring(0, 13)}…` : str;
                })
                .each(function (d) {
                    const str = String(d);
                    if (str.length > 14) {
                        d3.select(this).append('title').text(str);
                    }
                });
        } else {
            xAxis
                .selectAll('.tick text')
                .attr('fill', '#5f6f7f')
                .attr('font-size', '12px')
                .attr('dy', '1em')
                .text(d => {
                    const str = String(d);
                    return str.length > 14 ? `${str.substring(0, 13)}…` : str;
                })
                .each(function (d) {
                    const str = String(d);
                    if (str.length > 14) {
                        d3.select(this).append('title').text(str);
                    }
                });
        }

        g.append('text')
            .attr('x', innerW / 2)
            .attr('y', innerH + (isRotated ? 58 : 45))
            .attr('text-anchor', 'middle')
            .attr('fill', '#1f2937')
            .attr('font-size', '13px')
            .attr('font-weight', '500')
            .text(entityLabel);

        // 3. Legend
        const legend = g.append('g').attr('transform', `translate(${innerW + 20}, 0)`);
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
    }, [data, geneNames, width, height, yAxisTitle, entityLabel]);

    return (
        <div style={{ position: 'relative', width: '100%', height: height || 'auto', overflow: 'hidden' }}>
            <svg ref={svgRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />
        </div>
    );
};

// --------------------------------------------------------------------------------------
// Main ViolinPlot Component
// --------------------------------------------------------------------------------------
const ViolinPlot: React.FC<ViolinPlotProps> = ({
    data,
    layerName = 'RNA-seq',
    treatment,
    entityLabel,
    valueLabel
}) => {
    const currentEntityLabel = entityLabel ?? (treatment ? 'Drug' : 'Gene');
    const currentValueLabel = valueLabel ?? (treatment ? 'Response' : 'Value');

    const geneNames = useMemo(() => Object.keys(data), [data]);
    const isMultiGene = geneNames.length > 1;

    // View state: 'ALL' for the unified all-genes view, or a specific gene name
    const [selectedView, setSelectedView] = useState<string>('ALL');

    const [containerRef, width] = useContainerSize();

    // Default to 'ALL' when multiple genes, or geneNames[0] when 1 gene
    useEffect(() => {
        if (!isMultiGene) {
            setSelectedView(geneNames[0] || '');
        } else if (selectedView !== 'ALL' && !geneNames.includes(selectedView)) {
            setSelectedView('ALL');
        }
    }, [geneNames, isMultiGene, selectedView]);

    const height = Math.max(Math.round(width * 0.5), 450);

    return (
        <div className="flex flex-col w-full" ref={containerRef}>
            {/* Header info */}
            {geneNames.length > 0 && (
                <div className="mb-3 flex flex-row justify-center items-center gap-1">
                    <h1 className="text-headingMd font-semibold text-text-primary">Selected:</h1>
                    <h2 className="text-headingSm text-text-primary font-light text-wrap break-words">
                        {selectedView === 'ALL' ? geneNames.join(', ') : selectedView}
                    </h2>
                </div>
            )}

            {/* Clean button selectors when multiple genes are selected */}
            {isMultiGene && (
                <div className="flex flex-row flex-wrap justify-center items-center gap-1.5 mb-4 overflow-x-auto pb-1 max-w-full">
                    <button
                        type="button"
                        onClick={() => setSelectedView('ALL')}
                        className={`px-3 py-1 rounded-md text-bodySm transition-all cursor-pointer ${
                            selectedView === 'ALL'
                                ? 'bg-primary text-white font-medium shadow-sm'
                                : 'bg-background hover:bg-subsection-1 text-text-primary border border-border/75'
                        }`}
                    >
                        {`All Selected ${currentEntityLabel}s`}
                    </button>

                    {/* Individual gene buttons */}
                    {geneNames.map(g => (
                        <button
                            key={g}
                            type="button"
                            onClick={() => setSelectedView(g)}
                            className={`px-3 py-1 rounded-md text-bodySm transition-all cursor-pointer ${
                                selectedView === g
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
            ) : isMultiGene && selectedView === 'ALL' ? (
                /* All Genes View: 1 combined violin per gene with tissue-colored dots */
                <div className="w-full flex justify-center">
                    <div className="w-full">
                        {width > 0 && (
                            <AllGenesViolinChart
                                data={data}
                                geneNames={geneNames}
                                width={width}
                                height={height}
                                yAxisTitle={currentValueLabel}
                                entityLabel={currentEntityLabel}
                            />
                        )}
                    </div>
                </div>
            ) : (
                /* Specific Gene View: Soft Tissue and Uterus violins on X-axis */
                <div className="w-full flex justify-center">
                    <div className="w-full">
                        {width > 0 && (
                            <SingleViolinChart
                                geneName={selectedView && selectedView !== 'ALL' ? selectedView : geneNames[0]}
                                points={
                                    data[selectedView && selectedView !== 'ALL' ? selectedView : geneNames[0]] || []
                                }
                                width={width}
                                height={height}
                                showLegend={true}
                                yAxisTitle={currentValueLabel}
                                entityLabel={currentEntityLabel}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViolinPlot;
