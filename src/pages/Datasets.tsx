import React, { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Chart } from 'primereact/chart';

const Datasets: React.FC = () => {
    const [barChartData, setBarChartData] = useState({});
    const [barChartOptions, setBarChartOptions] = useState({});

    const clinical_datasets = [
        {
            name: 'TCGA',
            id: 1,
            description:
                'TCGA Sarcoma is described as a multi-platform molecular landscape of 206 adult soft tissue sarcomas representing 6 major types. Along with novel insights into the biology of individual sarcoma types, we report three overarching findings: 1) unlike most epithelial malignancies, these sarcomas (excepting synovial sarcoma) are characterized predominantly by copy number changes, with low mutational loads and only a few genes (TP53, ATRX, RB1) highly recurrently mutated across sarcoma types, 2) within sarcoma types, genomic and regulomic diversity of driver pathways defines molecular subtypes associated with patient outcome, and 3) the immune microenvironment, inferred from DNA methylation and mRNA profiles, associates with outcome and may inform clinical trials of immune checkpoint inhibitors.',
            version: '2017',
            layers: ['RNAseq', 'Mutations', 'Copy Number Variation', 'Methylation']
        },
        {
            name: 'German',
            id: 2,
            description:
                'TCGA Sarcoma is described as a multi-platform molecular landscape of 206 adult soft tissue sarcomas representing 6 major types. Along with novel insights into the biology of individual sarcoma types, we report three overarching findings: 1) unlike most epithelial malignancies, these sarcomas (excepting synovial sarcoma) are characterized predominantly by copy number changes, with low mutational loads and only a few genes (TP53, ATRX, RB1) highly recurrently mutated across sarcoma types, 2) within sarcoma types, genomic and regulomic diversity of driver pathways defines molecular subtypes associated with patient outcome, and 3) the immune microenvironment, inferred from DNA methylation and mRNA profiles, associates with outcome and may inform clinical trials of immune checkpoint inhibitors.',
            version: '2017',
            layers: ['RNAseq', 'Mutations', 'Copy Number Variation', 'Methylation']
        },
        {
            name: 'Hemming',
            id: 3,
            description:
                'TCGA Sarcoma is described as a multi-platform molecular landscape of 206 adult soft tissue sarcomas representing 6 major types. Along with novel insights into the biology of individual sarcoma types, we report three overarching findings: 1) unlike most epithelial malignancies, these sarcomas (excepting synovial sarcoma) are characterized predominantly by copy number changes, with low mutational loads and only a few genes (TP53, ATRX, RB1) highly recurrently mutated across sarcoma types, 2) within sarcoma types, genomic and regulomic diversity of driver pathways defines molecular subtypes associated with patient outcome, and 3) the immune microenvironment, inferred from DNA methylation and mRNA profiles, associates with outcome and may inform clinical trials of immune checkpoint inhibitors.',
            version: '2017',
            layers: ['RNAseq', 'Mutations', 'Copy Number Variation', 'Methylation']
        }
    ];

    const preclinical_datasets = [
        {
            name: 'CCLE',
            id: 1,
            description:
                'CCLE includes harmonized genomic, transcriptomic, and new proteomic profiles (RPPA) with standardized annotations, enabling the study of cancer-specific molecular features and therapeutic vulnerabilities across diverse cell lines',
            version: '2019',
            layers: [
                'Treatment Response',
                'RNA-seq',
                'Microarray',
                'Mutation',
                'Copy Number Variation',
                'Methylation',
                'RPPA'
            ]
        },
        {
            name: 'GDSC',
            id: 2,
            description:
                'CCLE includes harmonized genomic, transcriptomic, and new proteomic profiles (RPPA) with standardized annotations, enabling the study of cancer-specific molecular features and therapeutic vulnerabilities across diverse cell lines',
            version: '2020',
            layers: ['RNA-seq', 'Microarray', 'Mutation', 'Copy Number Variation', 'Methylation', 'RPPA']
        },
        {
            name: 'CTRP',
            id: 3,
            description:
                'CCLE includes harmonized genomic, transcriptomic, and new proteomic profiles (RPPA) with standardized annotations, enabling the study of cancer-specific molecular features and therapeutic vulnerabilities across diverse cell lines',
            version: '2015',
            layers: ['Treatment Response', 'Mutation', 'Copy Number Variation']
        },
        {
            name: 'gCSI',
            id: 4,
            description:
                'CCLE includes harmonized genomic, transcriptomic, and new proteomic profiles (RPPA) with standardized annotations, enabling the study of cancer-specific molecular features and therapeutic vulnerabilities across diverse cell lines',
            version: '2019',
            layers: ['RNA-seq', 'Mutation', 'Copy Number Variation', 'Methylation', 'RPPA']
        },
        {
            name: 'NCI Sarcoma',
            id: 5,
            description:
                'CCLE includes harmonized genomic, transcriptomic, and new proteomic profiles (RPPA) with standardized annotations, enabling the study of cancer-specific molecular features and therapeutic vulnerabilities across diverse cell lines',
            version: '2015',
            layers: ['Microarray', 'miRNA']
        }
    ];

    const pre_clinical_chart_data = {
        labels: preclinical_datasets.map(dataset => dataset.name), // ['CCLE', 'GDSC', 'CTRP', 'gCSI', 'NCI Sarcoma']
        datasets: [
            {
                label: 'Samples',
                data: [300, 50, 100, 500, 200],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(99, 117, 255)',
                    'rgb(255, 154, 99)'
                ],
                hoverOffset: 8
            },
            {
                label: 'Genes',
                data: [500, 200, 300, 600, 100],
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)',
                    'rgb(99, 117, 255)',
                    'rgb(255, 154, 99)'
                ],
                hoverOffset: 8
            }
        ]
    };

    const clinical_chart_data = {
        labels: clinical_datasets.map(dataset => dataset.name), // ['CCLE', 'GDSC', 'CTRP', 'gCSI', 'NCI Sarcoma']
        datasets: [
            {
                label: 'Samples',
                data: [300, 50, 100],
                backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
                hoverOffset: 8
            },
            {
                label: 'Genes',
                data: [500, 200, 300],
                backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
                hoverOffset: 8
            },
            {
                label: 'Genes',
                data: [500, 200, 300],
                backgroundColor: ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 205, 86)'],
                hoverOffset: 8
            }
        ]
    };

    useEffect(() => {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
        const data = {
            labels: ['Samples', 'Genes', 'Drugs', 'Cell Lines'],
            datasets: [
                {
                    type: 'bar',
                    label: 'TCGA',
                    backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                    data: [50, 25, 12, 48]
                },
                {
                    type: 'bar',
                    label: 'German',
                    backgroundColor: documentStyle.getPropertyValue('--green-500'),
                    data: [21, 84, 24, 75]
                },
                {
                    type: 'bar',
                    label: 'Hemming',
                    backgroundColor: documentStyle.getPropertyValue('--yellow-500'),
                    data: [41, 52, 24, 74]
                }
            ]
        };
        const options = {
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                tooltips: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    labels: {
                        color: textColor
                    }
                }
            },
            scales: {
                x: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    stacked: true,
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        };

        setBarChartData(data);
        setBarChartOptions(options);
    }, []);

    return (
        <div className="flex flex-col bg-background gap-10 min-h-screen items-center justify-center m-auto px-10 py-10">
            <div className="flex flex-row gap-20 items-center justify-center w-full">
                <div className="w-full max-w-5xl flex flex-col gap-2 items-center justify-center">
                    <Chart type="bar" data={barChartData} options={barChartOptions} className="w-full min-h-[800px]" />
                </div>
                <div className="w-full max-w-xl flex flex-col gap-2 items-center justify-center">
                    <h2 className="text-headingMd text-text-secon"> Preclinical Statistics</h2>
                    <Chart type="pie" data={pre_clinical_chart_data} className="w-full" />
                </div>
                <div className="w-full max-w-xl flex flex-col gap-2 items-center justify-center">
                    <h2 className="text-headingMd text-text-primary"> Clinical Statistics</h2>
                    <Chart type="pie" data={clinical_chart_data} className="w-full" />
                </div>
            </div>
            <div className="flex flex-col gap-4 w-full">
                <h1 className="text-heading2Xl font-semibold text-text-primary text-left">Preclinical Datasets</h1>
                <DataTable
                    value={preclinical_datasets}
                    sortMode="single"
                    sortField="info.dateCreated"
                    sortOrder={-1}
                    size="small"
                    showGridlines={true}
                    stripedRows
                >
                    <Column
                        field="name"
                        header="Object Name"
                        style={{ width: '10%' }}
                        body={rowData => <h3 className="text-headingSm text-primary font-bold">{rowData.name}</h3>}
                        sortable
                    />
                    <Column field="version" header="Version" style={{ width: '10%' }} />
                    <Column
                        body={rowData => (
                            <p
                                className="line-clamp-4 text-bodySm"
                                dangerouslySetInnerHTML={{ __html: rowData?.description }}
                            />
                        )}
                        header="Description"
                        style={{ width: '45%' }}
                    />
                    <Column
                        body={rowData => (
                            <div className="flex gap-2 flex-wrap">
                                {rowData?.layers &&
                                    rowData.layers.map((layer: any, ind: number) => (
                                        <span key={ind} className="rounded-lg bg-primary p-2 text-bodySm text-white">
                                            {layer}
                                        </span>
                                    ))}
                            </div>
                        )}
                        header="Data Layers"
                        style={{ width: '35%' }}
                    />
                </DataTable>
            </div>
            <div className="flex flex-col gap-4 w-full">
                <h1 className="text-heading2Xl font-semibold text-text-primary text-left">Clinical Datasets</h1>
                <DataTable
                    value={clinical_datasets}
                    sortMode="single"
                    sortField="info.dateCreated"
                    sortOrder={-1}
                    size="small"
                    showGridlines={true}
                    stripedRows
                >
                    <Column
                        field="name"
                        header="Object Name"
                        style={{ width: '10%' }}
                        body={rowData => <h3 className="text-headingSm text-primary font-bold">{rowData.name}</h3>}
                        sortable
                    />
                    <Column field="version" header="Version" style={{ width: '10%' }} />
                    <Column
                        body={rowData => (
                            <p className="text-bodySm" dangerouslySetInnerHTML={{ __html: rowData?.description }} />
                        )}
                        header="Description"
                        style={{ width: '45%' }}
                    />
                    <Column
                        body={rowData => (
                            <div className="flex gap-2 flex-wrap">
                                {rowData?.layers &&
                                    rowData.layers.map((layer: any, ind: number) => (
                                        <span key={ind} className="rounded-lg bg-primary p-2 text-bodySm text-white">
                                            {layer}
                                        </span>
                                    ))}
                            </div>
                        )}
                        header="Data Layers"
                        style={{ width: '35%' }}
                    />
                </DataTable>
            </div>
        </div>
    );
};

export default Datasets;
