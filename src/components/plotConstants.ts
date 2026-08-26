export interface PlotDataPoint {
    cellLine: string;
    value: number;
    tissue: string;
    // Pre-clinical cell line metadata
    sex?: string | null;
    age?: number | string | null;
    second_level?: string | null;
    disease_descriptions?: string | null;
    // Clinical sample metadata
    race?: string | null;
    histology?: string | null;
    // Drug metadata (treatment response only)
    fda_approval?: boolean | null;
    mechanism_action_type?: string | null;
    mechanism_of_action?: string | null;
}

export const TISSUE_COLORS: Record<string, string> = {
    'Soft Tissue': '#6a9fc8', // muted steel-blue
    Uterus: '#e8917a' // warm salmon
};

// 20 distinct, accessible, and curated colors for up to 20 genes
export const GENE_COLORS = [
    '#006494', // Baltic Blue
    '#10b981', // Emerald
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#f97316', // Orange
    '#6366f1', // Indigo
    '#84cc16', // Lime
    '#14b8a6', // Teal
    '#d946ef', // Fuchsia
    '#e11d48', // Rose
    '#3b82f6', // Bright Blue
    '#a855f7', // Violet
    '#eab308', // Yellow
    '#22c55e', // Green
    '#64748b', // Slate
    '#ca8a04', // Dark Goldenrod
    '#0284c7', // Sky Blue
    '#9333ea' // Dark Purple
];

export const DEFAULT_COLOR = '#999999';
