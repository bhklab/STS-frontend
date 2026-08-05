import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputSwitch } from 'primereact/inputswitch';
import { Hospital, Microscope } from 'lucide-react';

const Visualizations: React.FC = () => {
    const [clinical, setClinical] = useState(false);
    const [dataset, setDataset] = useState(null);
    const [clinicalDatasets, setClinicalDatasets] = useState<Object[]>([
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
    return (
        <div className={`flex flex-row bg-background h-screen justify-center items-center px-10`}>
            <div className="flex flex-col max-w-lg gap-4 bg-white p-4 rounded-md shadow-card border border-border/75">
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
                <div className="card flex justify-content-center">
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
            </div>
            <div className="flex flex-col bg-white"></div>
        </div>
    );
};

export default Visualizations;
