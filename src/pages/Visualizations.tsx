import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Hospital, Microscope } from 'lucide-react';
import GeneExpressionDotPlot, { type DotPlotDataPoint } from '../components/GeneExpressionDotPlot';

// ── Dummy ATRX expression data (matches the reference image) ────────────────
const ATRX_DATA: DotPlotDataPoint[] = [
    { cellLine: 'Rh41', geneExpression: 7.1, tissue: 'Soft Tissue' },
    { cellLine: 'Hs 729.T', geneExpression: 7.24, tissue: 'Soft Tissue' },
    { cellLine: 'GCT', geneExpression: 7.73, tissue: 'Soft Tissue' },
    { cellLine: 'Rh30', geneExpression: 7.93, tissue: 'Soft Tissue' },
    { cellLine: 'HT-1080', geneExpression: 7.97, tissue: 'Soft Tissue' },
    { cellLine: 'MES-SA', geneExpression: 8.16, tissue: 'Uterus' },
    { cellLine: 'RKN', geneExpression: 8.22, tissue: 'Soft Tissue' },
    { cellLine: 'RD', geneExpression: 8.26, tissue: 'Soft Tissue' },
    { cellLine: 'TE 159.T', geneExpression: 8.3, tissue: 'Soft Tissue' },
    { cellLine: 'TE 125.T', geneExpression: 8.33, tissue: 'Soft Tissue' },
    { cellLine: 'Rh18', geneExpression: 8.34, tissue: 'Soft Tissue' },
    { cellLine: 'TE 441.T', geneExpression: 8.49, tissue: 'Soft Tissue' },
    { cellLine: 'TE 617.T', geneExpression: 8.54, tissue: 'Soft Tissue' },
    { cellLine: 'ESS-1', geneExpression: 8.65, tissue: 'Uterus' },
    { cellLine: 'A-204', geneExpression: 8.7, tissue: 'Soft Tissue' },
    { cellLine: 'KYM-1', geneExpression: 8.96, tissue: 'Soft Tissue' },
    { cellLine: 'SK-UT-1', geneExpression: 9.08, tissue: 'Uterus' },
    { cellLine: 'SK-LMS-1', geneExpression: 9.18, tissue: 'Soft Tissue' }
];

const Visualizations: React.FC = () => {
    const [clinical, setClinical] = useState(false);
    const [dataset, setDataset] = useState(null);
    const [availableVisualizations, setAvailableVisualizations] = useState(['Scatter Plot', 'Heatmap']);
    const [visualization, setVisualization] = useState('Scatter Plot');

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
            <div className="flex flex-col min-w-75 max-w-lg gap-4 bg-white p-4 rounded-md shadow-card border border-border/75">
                <div className="flex flex-row">
                    <div className="flex flex-row gap-4 justify-center">
                        <div
                            className={`p-2 rounded-md cursor-pointer ${!clinical ? 'bg-subsection-1' : ''} hover:bg-subsection-1`}
                            onClick={() => setClinical(false)}
                        >
                            <Microscope className={`${!clinical ? 'text-primary' : 'text-text-primary'}`} />
                        </div>

                        <div
                            className={`p-2 rounded-md cursor-pointer ${clinical ? 'bg-subsection-1' : ''} hover:bg-subsection-1`}
                            onClick={() => setClinical(true)}
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
                        optionLabel="name"
                        placeholder="Select a visualization"
                        className="w-full md:w-14rem"
                    />
                </div>
                <div className="flex">
                    <Dropdown
                        value={layer}
                        onChange={e => setLayer(e.value)}
                        options={availableLayers}
                        optionLabel="name"
                        placeholder="Select a molecular profile"
                        className="w-full md:w-14rem"
                    />
                </div>
                <div className="flex">
                    <Dropdown
                        value={gene}
                        onChange={e => setGene(e.value)}
                        options={availableGenes}
                        optionLabel="name"
                        placeholder="Select gene"
                        className="w-full md:w-14rem"
                    />
                </div>
            </div>
            <div className="flex flex-col flex-1 bg-white rounded-md shadow-card border border-border/75 p-6 items-center">
                <GeneExpressionDotPlot data={ATRX_DATA} gene="ATRX" width={1000} height={1000} />
            </div>
        </div>
    );
};

export default Visualizations;
