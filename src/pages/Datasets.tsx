import React, { useEffect, useState, useMemo } from 'react';
import apiClient from '../api/axiosClient';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';
import { ProgressSpinner } from 'primereact/progressspinner';

interface DatasetItem {
    id: number;
    name: string;
    description?: string;
    version?: string;
    link?: string;
    publication?: string;
    PMID?: string;
    key_study_findings?: string | null;
    total_samples: number;
    total_genes: number;
    total_drugs: number;
    total_cell_lines: number;
    data_layers: string[];
}

const DATASET_COLORS = [
    '#3b82f6', // blue
    '#10b981', // emerald
    '#f59e0b', // amber
    '#8b5cf6', // purple
    '#ef4444', // red
    '#06b6d4', // cyan
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f97316' // orange
];

const Datasets: React.FC = () => {
    const [preclinicalDatasets, setPreclinicalDatasets] = useState<DatasetItem[]>([]);
    const [clinicalDatasets, setClinicalDatasets] = useState<DatasetItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getDatasetStatistics = async () => {
            setLoading(true);
            try {
                const res = await apiClient.get('/api/datasets/statistics/dataset-page');
                setClinicalDatasets(res.data.clinical_datasets || []);
                setPreclinicalDatasets(res.data.preclinical_datasets || []);
            } catch (error) {
                console.error('Error fetching dataset statistics:', error);
            } finally {
                setLoading(false);
            }
        };
        getDatasetStatistics();
    }, []);

    // Helper to generate multi-ring doughnut datasets across all 5 metrics
    const createMultiLevelChartData = (datasets: DatasetItem[]) => {
        if (!datasets || datasets.length === 0) {
            return { labels: [], datasets: [] };
        }

        const labels = datasets.map(d => d.name);

        return {
            labels,
            datasets: [
                // Ring 1 (Outermost): Samples
                {
                    label: 'Samples',
                    data: datasets.map(d => d.total_samples || 0),
                    backgroundColor: DATASET_COLORS.slice(0, datasets.length),
                    hoverOffset: 6
                },
                // Ring 2: Cell Lines
                {
                    label: 'Cell Lines',
                    data: datasets.map(d => d.total_cell_lines || 0),
                    backgroundColor: DATASET_COLORS.slice(0, datasets.length),
                    hoverOffset: 6
                },
                // Ring 3: Drugs
                {
                    label: 'Drugs',
                    data: datasets.map(d => d.total_drugs || 0),
                    backgroundColor: DATASET_COLORS.slice(0, datasets.length),
                    hoverOffset: 6
                },
                // Ring 4: Genes
                {
                    label: 'Genes',
                    data: datasets.map(d => d.total_genes || 0),
                    backgroundColor: DATASET_COLORS.slice(0, datasets.length),
                    hoverOffset: 6
                },
                // Ring 5 (Innermost): Data Layers Count
                {
                    label: 'Data Layers',
                    data: datasets.map(d => (d.data_layers || []).length),
                    backgroundColor: DATASET_COLORS.slice(0, datasets.length),
                    hoverOffset: 6
                }
            ]
        };
    };

    const pre_clinical_chart_data = useMemo(
        () => createMultiLevelChartData(preclinicalDatasets),
        [preclinicalDatasets]
    );

    const clinical_chart_data = useMemo(() => createMultiLevelChartData(clinicalDatasets), [clinicalDatasets]);

    const getChartOptions = (datasetList: DatasetItem[]) => ({
        maintainAspectRatio: false,
        responsive: true,
        cutout: '22%',
        plugins: {
            tooltip: {
                callbacks: {
                    title: function (context: any) {
                        const item = context[0];
                        const datasetName = item.chart.data.labels[item.dataIndex];
                        const ringLabel = item.dataset.label;
                        return `${datasetName} — ${ringLabel}`;
                    },
                    label: function (context: any) {
                        const ringLabel = context.dataset.label;
                        const value = context.parsed;
                        const datasetName = context.chart.data.labels[context.dataIndex];

                        if (ringLabel === 'Data Layers') {
                            const ds = datasetList.find(d => d.name === datasetName);
                            const layers = ds?.data_layers?.join(', ') || 'None';
                            return ` ${value} Layers (${layers})`;
                        }
                        return ` ${value.toLocaleString()}`;
                    }
                }
            },
            legend: {
                position: 'bottom' as const,
                labels: {
                    usePointStyle: true,
                    padding: 16,
                    font: {
                        size: 12,
                        family: "'Roboto', 'Inter', system-ui, sans-serif"
                    }
                }
            }
        }
    });

    return (
        <div className="flex flex-col bg-background gap-10 min-h-screen items-center justify-center m-auto px-10 py-10 w-full">
            {/* Overview Multi-level Pie / Doughnut Charts */}
            {loading ? (
                <div className="w-full flex flex-col gap-6 justify-center items-center h-96">
                    <ProgressSpinner style={{ width: '150px', height: '150px' }} strokeWidth="4" />
                    <span className="text-bodyMd font-medium">Fetching dataset statistics ...</span>
                </div>
            ) : (
                <div>
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 w-full">
                        <div className="flex flex-col gap-6 items-center bg-white p-6 rounded-md shadow-card border border-border/75">
                            <h2 className="text-headingLg font-semibold text-text-primary">
                                Preclinical Datasets Breakdown
                            </h2>
                            <div className="w-full flex justify-center items-center h-96">
                                {preclinicalDatasets.length > 0 ? (
                                    <Chart
                                        type="doughnut"
                                        data={pre_clinical_chart_data}
                                        options={getChartOptions(preclinicalDatasets)}
                                        className="w-full h-full max-w-md"
                                    />
                                ) : (
                                    <div className="text-text-secondary text-bodySm">
                                        No preclinical datasets available
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-6 items-center bg-white p-6 rounded-md shadow-card border border-border/75">
                            <h2 className="text-headingLg font-semibold text-text-primary">
                                Clinical Datasets Breakdown
                            </h2>
                            <div className="w-full flex justify-center items-center h-96">
                                {clinicalDatasets.length > 0 ? (
                                    <Chart
                                        type="doughnut"
                                        data={clinical_chart_data}
                                        options={getChartOptions(clinicalDatasets)}
                                        className="w-full h-full max-w-md"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-text-secondary text-bodySm py-12 gap-2">
                                        <span className="text-bodyMd font-medium">No clinical datasets available</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <h1 className="text-heading2Xl font-semibold text-text-primary text-left">
                            Preclinical Datasets
                        </h1>
                        <DataTable
                            value={preclinicalDatasets}
                            loading={loading}
                            sortMode="single"
                            sortField="name"
                            sortOrder={1}
                            size="small"
                            showGridlines={true}
                            stripedRows
                            className="shadow-card rounded-md overflow-hidden bg-white"
                        >
                            <Column
                                field="name"
                                header="Object Name"
                                style={{ width: '5%' }}
                                body={rowData =>
                                    rowData.link ? (
                                        <a
                                            href={rowData.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-headingSm text-primary font-bold hover:underline"
                                        >
                                            {rowData.name}
                                        </a>
                                    ) : (
                                        <h3 className="text-headingSm text-primary font-bold">{rowData.name}</h3>
                                    )
                                }
                                sortable
                            />
                            <Column field="version" header="Version" style={{ width: '5%' }} sortable />
                            <Column field="PMID" header="PMID" style={{ width: '5%' }} sortable />
                            <Column
                                field="description"
                                header="Description"
                                style={{ width: '20%' }}
                                body={rowData => (
                                    <p
                                        className="line-clamp-4 text-bodySm text-text-secondary whitespace-pre-line"
                                        dangerouslySetInnerHTML={{ __html: rowData?.description || '' }}
                                    />
                                )}
                            />
                            <Column field="total_samples" header="Total Samples" style={{ width: '8%' }} sortable />
                            <Column field="total_genes" header="Total Genes" style={{ width: '8%' }} sortable />
                            <Column field="total_drugs" header="Total Drugs" style={{ width: '8%' }} sortable />
                            <Column
                                field="total_cell_lines"
                                header="Total Cell Lines"
                                style={{ width: '8%' }}
                                sortable
                            />
                            <Column
                                header="Data Layers"
                                style={{ width: '20%' }}
                                body={rowData => (
                                    <div className="flex gap-1.5 flex-wrap">
                                        {(rowData?.data_layers || []).map((layer: string, ind: number) => (
                                            <span
                                                key={ind}
                                                className="rounded-md bg-primary px-2.5 py-1 text-caption text-white font-medium shadow-xs"
                                            >
                                                {layer}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            />
                        </DataTable>
                    </div>

                    <div className="flex flex-col gap-4 w-full">
                        <h1 className="text-heading2Xl font-semibold text-text-primary text-left">
                            Preclinical Datasets
                        </h1>
                        <DataTable
                            value={clinicalDatasets}
                            loading={loading}
                            sortMode="single"
                            sortField="name"
                            sortOrder={1}
                            size="small"
                            showGridlines={true}
                            stripedRows
                            className="shadow-card rounded-md overflow-hidden bg-white"
                        >
                            <Column
                                field="name"
                                header="Object Name"
                                style={{ width: '5%' }}
                                body={rowData =>
                                    rowData.link ? (
                                        <a
                                            href={rowData.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-headingSm text-primary font-bold hover:underline"
                                        >
                                            {rowData.name}
                                        </a>
                                    ) : (
                                        <h3 className="text-headingSm text-primary font-bold">{rowData.name}</h3>
                                    )
                                }
                                sortable
                            />
                            <Column field="version" header="Version" style={{ width: '5%' }} sortable />
                            <Column field="PMID" header="PMID" style={{ width: '5%' }} sortable />
                            <Column
                                field="description"
                                header="Description"
                                style={{ width: '28%' }}
                                body={rowData => (
                                    <p
                                        className="line-clamp-4 text-bodySm text-text-secondary whitespace-pre-line"
                                        dangerouslySetInnerHTML={{ __html: rowData?.description || '' }}
                                    />
                                )}
                            />
                            <Column field="total_samples" header="Total Samples" style={{ width: '8%' }} sortable />
                            <Column field="total_genes" header="Total Genes" style={{ width: '8%' }} sortable />
                            <Column field="total_drugs" header="Total Drugs" style={{ width: '8%' }} sortable />
                            <Column
                                header="Data Layers"
                                style={{ width: '20%' }}
                                body={rowData => (
                                    <div className="flex gap-1.5 flex-wrap">
                                        {(rowData?.data_layers || []).map((layer: string, ind: number) => (
                                            <span
                                                key={ind}
                                                className="rounded-md bg-primary px-2.5 py-1 text-caption text-white font-medium shadow-xs"
                                            >
                                                {layer}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            />
                        </DataTable>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Datasets;
