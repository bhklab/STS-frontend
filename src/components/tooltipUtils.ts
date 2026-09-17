/**
 * Rich tooltip HTML from a data point, showing all populated metadata fields.
 * Used by DotPlot, Heatmap, and ViolinPlot.
 */
export function buildTooltipHtml(
    entityLabel: string,
    entityValue: string,
    valueLabel: string,
    point: { cellLine: string; value: number; tissue: string } & Record<string, any>
): string {
    const lines: string[] = [
		`<strong style="color: #99cadd">General Metadata</strong>`,
        `${entityLabel}: ${entityValue}`,
        `Cell Line: ${point.cellLine}`,
        `${valueLabel}: ${point.value.toFixed(2)}`,
        `Tissue: ${point.tissue}`,
    ];

    // Clinical sample metadata
	if (point.race != null || point.histology != null) lines.push(`<strong style="color: #99cadd">Sample Metadata</strong>`);
    if (point.race != null) lines.push(`Race: ${point.race}`);
    if (point.histology != null) lines.push(`Histology: ${point.histology}`);

	// Drug metadata
	if (point.fda_approval != null || point.mechanism_action_type != null || point.mechanism_of_action != null) lines.push(`<strong style="color: #99cadd">Drug Metadata</strong>`);
    if (point.fda_approval != null) lines.push(`FDA Approved Drug: ${point.fda_approval ? 'True' : 'False'}`);
    if (point.mechanism_action_type != null) lines.push(`Mechanism of Action Type: ${point.mechanism_action_type}`);
    if (point.mechanism_of_action != null) lines.push(`Mechanism of Action: ${point.mechanism_of_action}`);

    // Cell line / sample metadata
	if (point.sex != null || point.age != null || point.second_level != null || point.disease_descriptions != null) lines.push(`<strong style="color: #99cadd">Cell Line Metadata</strong>`);
    if (point.sex != null) lines.push(`Sex: ${point.sex}`);
    if (point.age != null) lines.push(`Age: ${point.age}`);
    if (point.second_level != null) lines.push(`Subtype: ${point.second_level}`);
    if (point.disease_descriptions != null) lines.push(`Disease: ${point.disease_descriptions}`);


    return lines.join('<br/>');
}
