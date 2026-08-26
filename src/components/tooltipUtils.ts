import type { PlotDataPoint } from './plotConstants';

/**
 * Build rich tooltip HTML from a data point, showing all populated metadata fields.
 * Used by DotPlot, Heatmap, and ViolinPlot.
 */
export function buildTooltipHtml(
    entityLabel: string,
    entityValue: string,
    valueLabel: string,
    point: { cellLine: string; value: number; tissue: string } & Record<string, any>
): string {
    const lines: string[] = [
        `<strong>${entityLabel}: </strong>${entityValue}`,
        `<strong>Cell Line: </strong>${point.cellLine}`,
        `<strong>${valueLabel}: </strong>${point.value.toFixed(2)}`,
        `<strong>Tissue: </strong>${point.tissue}`,
    ];

    // Clinical sample metadata
    if (point.race != null) lines.push(`<strong>Race: </strong>${point.race}`);
    if (point.histology != null) lines.push(`<strong>Histology: </strong>${point.histology}`);

    // Cell line / sample metadata
    if (point.sex != null) lines.push(`<strong>Sex: </strong>${point.sex}`);
    if (point.age != null) lines.push(`<strong>Age: </strong>${point.age}`);
    if (point.second_level != null) lines.push(`<strong>Subtype: </strong>${point.second_level}`);
    if (point.disease_descriptions != null) lines.push(`<strong>Disease: </strong>${point.disease_descriptions}`);

    // Drug metadata
    if (point.fda_approval != null) lines.push(`<strong>FDA Approved Drug: </strong>${point.fda_approval ? 'True' : 'False'}`);
    if (point.mechanism_action_type != null) lines.push(`<strong>Mechanism of Action Type: </strong>${point.mechanism_action_type}`);
    if (point.mechanism_of_action != null) lines.push(`<strong>Mechanism of Action: </strong>${point.mechanism_of_action}`);

    return lines.join('<br/>');
}
