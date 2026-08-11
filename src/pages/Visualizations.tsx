import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Hospital, Microscope } from 'lucide-react';
import DotPlot, { type PlotDataPoint } from '../components/DotPlot';
import Heatmap from '../components/Heatmap';
import { Tooltip } from 'primereact/tooltip';

// Dummy data for multiple genes
const plotData: Record<string, PlotDataPoint[]> = {
    ATRX: [
        { cellLine: 'Rh41', value: 7.1, tissue: 'Soft Tissue' },
        { cellLine: 'Hs 729.T', value: 7.24, tissue: 'Soft Tissue' },
        { cellLine: 'GCT', value: 7.73, tissue: 'Soft Tissue' },
        { cellLine: 'Rh30', value: 7.93, tissue: 'Soft Tissue' },
        { cellLine: 'HT-1080', value: 7.97, tissue: 'Soft Tissue' },
        { cellLine: 'MES-SA', value: 8.16, tissue: 'Uterus' },
        { cellLine: 'RKN', value: 8.22, tissue: 'Soft Tissue' },
        { cellLine: 'RD', value: 8.26, tissue: 'Soft Tissue' },
        { cellLine: 'TE 159.T', value: 8.3, tissue: 'Soft Tissue' },
        { cellLine: 'TE 125.T', value: 8.33, tissue: 'Soft Tissue' },
        { cellLine: 'Rh18', value: 8.34, tissue: 'Soft Tissue' },
        { cellLine: 'TE 441.T', value: 8.49, tissue: 'Soft Tissue' },
        { cellLine: 'TE 617.T', value: 8.54, tissue: 'Soft Tissue' },
        { cellLine: 'ESS-1', value: 8.65, tissue: 'Uterus' },
        { cellLine: 'A-204', value: 8.7, tissue: 'Soft Tissue' },
        { cellLine: 'KYM-1', value: 8.96, tissue: 'Soft Tissue' },
        { cellLine: 'SK-UT-1', value: 9.08, tissue: 'Uterus' },
        { cellLine: 'SK-LMS-1', value: 9.18, tissue: 'Soft Tissue' }
    ],
    TP53: [
        { cellLine: 'Rh41', value: 5.8, tissue: 'Soft Tissue' },
        { cellLine: 'Hs 729.T', value: 6.12, tissue: 'Soft Tissue' },
        { cellLine: 'GCT', value: 6.44, tissue: 'Soft Tissue' },
        { cellLine: 'Rh30', value: 6.5, tissue: 'Soft Tissue' },
        { cellLine: 'HT-1080', value: 6.73, tissue: 'Soft Tissue' },
        { cellLine: 'MES-SA', value: 7.0, tissue: 'Uterus' },
        { cellLine: 'RKN', value: 7.15, tissue: 'Soft Tissue' },
        { cellLine: 'RD', value: 7.22, tissue: 'Soft Tissue' },
        { cellLine: 'TE 159.T', value: 7.35, tissue: 'Soft Tissue' },
        { cellLine: 'TE 125.T', value: 7.41, tissue: 'Soft Tissue' },
        { cellLine: 'Rh18', value: 7.48, tissue: 'Soft Tissue' },
        { cellLine: 'TE 441.T', value: 7.66, tissue: 'Soft Tissue' },
        { cellLine: 'TE 617.T', value: 7.78, tissue: 'Soft Tissue' },
        { cellLine: 'ESS-1', value: 7.9, tissue: 'Uterus' },
        { cellLine: 'A-204', value: 8.05, tissue: 'Soft Tissue' },
        { cellLine: 'KYM-1', value: 8.22, tissue: 'Soft Tissue' },
        { cellLine: 'SK-UT-1', value: 8.4, tissue: 'Uterus' },
        { cellLine: 'SK-LMS-1', value: 8.55, tissue: 'Soft Tissue' }
    ],
    RB1: [
        { cellLine: 'Rh41', value: 6.3, tissue: 'Soft Tissue' },
        { cellLine: 'Hs 729.T', value: 6.55, tissue: 'Soft Tissue' },
        { cellLine: 'GCT', value: 6.78, tissue: 'Soft Tissue' },
        { cellLine: 'Rh30', value: 6.91, tissue: 'Soft Tissue' },
        { cellLine: 'HT-1080', value: 7.02, tissue: 'Soft Tissue' },
        { cellLine: 'MES-SA', value: 7.18, tissue: 'Uterus' },
        { cellLine: 'RKN', value: 7.31, tissue: 'Soft Tissue' },
        { cellLine: 'RD', value: 7.45, tissue: 'Soft Tissue' },
        { cellLine: 'TE 159.T', value: 7.53, tissue: 'Soft Tissue' },
        { cellLine: 'TE 125.T', value: 7.6, tissue: 'Soft Tissue' },
        { cellLine: 'Rh18', value: 7.72, tissue: 'Soft Tissue' },
        { cellLine: 'TE 441.T', value: 7.88, tissue: 'Soft Tissue' },
        { cellLine: 'TE 617.T', value: 7.94, tissue: 'Soft Tissue' },
        { cellLine: 'ESS-1', value: 8.1, tissue: 'Uterus' },
        { cellLine: 'A-204', value: 8.25, tissue: 'Soft Tissue' },
        { cellLine: 'KYM-1', value: 8.38, tissue: 'Soft Tissue' },
        { cellLine: 'SK-UT-1', value: 8.52, tissue: 'Uterus' },
        { cellLine: 'SK-LMS-1', value: 8.7, tissue: 'Soft Tissue' }
    ]
};

const Visualizations: React.FC = () => {
    const [clinical, setClinical] = useState(false);
    const [dataset, setDataset] = useState(null);

    const [availableVisualizations, setAvailableVisualizations] = useState(['Scatter Plot', 'Heatmap']);
    const [visualization, setVisualization] = useState('Scatter Plot');

    const [availableResponseTypes, setAvailableResponseTypes] = useState<String[]>(['AAC', 'AUC', 'IC50']);
    const [responseType, setResponseType] = useState<String | null>(null);

    const [clinicalDatasets] = useState<Object[]>([
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
    ]);

    const [preclinicalDatasets, setPreclinicalDatasets] = useState<Object[]>([
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
    ]);

    const [availableLayers, setAvailableLayers] = useState<String[]>([
        'Treatment Response',
        'RNA-seq',
        'Microarray',
        'Mutation',
        'Copy Number Variation',
        'Methylation',
        'RPPA'
    ]);
    const [layer, setLayer] = useState<String>('RNA-seq');
    const [availableGenes, setAvailableGenes] = useState<string[]>(['TP53', 'ATRX', 'RB1']);
    const [gene, setGene] = useState<string>('ATRX');

    return (
        <div className={`flex flex-row gap-4 bg-background min-h-screen justify-center items-start px-10 py-10`}>
            <Tooltip target=".preclinical-icon" />
            <Tooltip target=".clinical-icon" />
            <div className="flex flex-col min-w-75 max-w-lg gap-4 bg-white p-4 rounded-md shadow-card border border-border/75">
                <div className="flex flex-row">
                    <div className="flex flex-row gap-4 justify-center">
                        <div
                            className={`p-2 rounded-md cursor-pointer ${!clinical ? 'bg-subsection-1' : ''} hover:bg-subsection-1 preclinical-icon`}
                            onClick={() => setClinical(false)}
                            data-pr-tooltip="Pre-clinical data"
                            data-pr-position="top"
                            data-pr-at="center top-10"
                        >
                            <Microscope className={`${!clinical ? 'text-primary' : 'text-text-primary'}`} />
                        </div>

                        <div
                            className={`p-2 rounded-md cursor-pointer ${clinical ? 'bg-subsection-1' : ''} hover:bg-subsection-1 clinical-icon`}
                            onClick={() => setClinical(true)}
                            data-pr-tooltip="Clinical data"
                            data-pr-position="top"
                            data-pr-at="center top-10"
                        >
                            <Hospital className={`${clinical ? 'text-primary' : 'text-text-primary'}`} />
                        </div>
                    </div>
                </div>
                <div className="flex">
                    {clinical ? (
                        <Dropdown
                            value={dataset}
                            onChange={e => setDataset(e.value)}
                            options={clinicalDatasets}
                            optionLabel="name"
                            placeholder="Select a clinical dataset"
                            className="w-full md:w-14rem"
                        />
                    ) : (
                        <Dropdown
                            value={dataset}
                            onChange={e => setDataset(e.value)}
                            options={preclinicalDatasets}
                            optionLabel="name"
                            placeholder="Select a preclinical dataset"
                            className="w-full md:w-14rem"
                        />
                    )}
                </div>
                <div className="flex">
                    <Dropdown
                        value={visualization}
                        onChange={e => setVisualization(e.value)}
                        options={availableVisualizations}
                        placeholder="Select a visualization"
                        className="w-full md:w-14rem"
                    />
                </div>
                <div className="flex">
                    <Dropdown
                        value={layer}
                        onChange={e => setLayer(e.value)}
                        options={availableLayers}
                        placeholder="Select a molecular profile"
                        className="w-full md:w-14rem"
                    />
                </div>
                {layer === 'Treatment Response' && (
                    <div className="flex">
                        <Dropdown
                            value={responseType}
                            onChange={e => setResponseType(e.value)}
                            options={availableResponseTypes}
                            placeholder="Select a response type"
                            className="w-full md:w-14rem"
                        />
                    </div>
                )}
                {visualization === 'Scatter Plot' && (
                    <div className="flex">
                        <Dropdown
                            value={gene}
                            onChange={e => setGene(e.value)}
                            options={availableGenes}
                            placeholder="Select gene"
                            className="w-full md:w-14rem"
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col flex-1 bg-white rounded-md shadow-card border border-border/75 p-6 items-center">
                {visualization === 'Scatter Plot' ? (
                    <DotPlot data={plotData[gene]} gene={gene} width={1000} height={1000} />
                ) : (
                    <Heatmap data={plotData} width={1000} height={500} />
                )}
            </div>
        </div>
    );
};

export default Visualizations;
