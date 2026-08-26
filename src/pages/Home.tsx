import React, { useState, useEffect } from 'react';
import apiClient from '../api/axiosClient';
import { useNavigate } from 'react-router';
import { HardDrive, ChartLine, BotMessageSquare, CodeXml } from 'lucide-react';

interface AnimatedCounterProps {
    end: number;
    duration?: number;
}

interface DatasetStatistics {
    total_clinical_datasets: number;
    total_pre_clinical_datasets: number;
    total_pre_clinical_samples: number;
    total_clinical_samples: number;
    total_drugs: number;
    total_cell_lines: number;
    total_genes: number;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ end, duration = 2000 }) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        let animationFrame: number;

        const updateCounter = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = timestamp - startTime;
            const percentage = Math.min(progress / duration, 1);
            const easeOutCubic = 1 - Math.pow(1 - percentage, 3);

            setCount(Math.floor(easeOutCubic * end));

            if (percentage < 1) {
                animationFrame = requestAnimationFrame(updateCounter);
            } else {
                setCount(end);
            }
        };

        animationFrame = requestAnimationFrame(updateCounter);

        return () => cancelAnimationFrame(animationFrame);
    }, [end, duration]);

    return <>{count}</>;
};

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

const platformFeatures = [
    {
        icon: HardDrive,
        title: 'Integrated Data',
        description:
            'Clinical, molecular, imaging, pathology, and pharmacogenomic resources across patients and preclinical models',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200/80'
    },
    {
        icon: ChartLine,
        title: 'Translational Analytics',
        description: 'Cohort, genomic, survival, drug-response, biomarker, and cross-cohort analyses',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
    },
    {
        icon: BotMessageSquare,
        title: 'Agentic AI',
        description:
            'Governed AI-enabled workflows for data exploration, analysis orchestration, evidence synthesis, and hypothesis generation',
        badgeClass: 'bg-purple-50 text-purple-700 border-purple-200/80'
    },
    {
        icon: CodeXml,
        title: 'FAIR & Reproducible',
        description:
            'Harmonized metadata, standardized identifiers, provenance, controlled access, and reproducible workflows',
        badgeClass: 'bg-amber-50 text-amber-700 border-amber-200/80'
    }
];

const Home: React.FC = () => {
    const [landingPageStats, setLandingPageStats] = useState<DatasetStatistics>({
        total_clinical_datasets: 0,
        total_pre_clinical_datasets: 0,
        total_pre_clinical_samples: 0,
        total_clinical_samples: 0,
        total_drugs: 0,
        total_cell_lines: 0,
        total_genes: 0
    });
    const navigate = useNavigate();

    useEffect(() => {
        const getLandingPageStats = async () => {
            const res = await apiClient.get(`/api/datasets/statistics/landing-page`);
            setLandingPageStats(res.data);
        };
        getLandingPageStats();
    }, []);

    return (
        <div className="flex flex-col bg-background min-h-[95vh] justify-center items-center">
            <div className="flex flex-col justify-center items-center w-full px-24 py-20 max-w-[2200px]">
                <div className="flex flex-row md:flex-col gap-32 items-baseline mb-40">
                    <div className="flex flex-col gap-6 justify-center flex-1 w-full">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-6xl font-semibold text-primary">
                                Soft Tissue Sarcoma Integrated Research Platform
                            </h1>
                            <p className="text-headingLg font-light text-text-primary">
                                Integrating clinical and preclinical data with translational analytics and agentic
                                AI–enabled workflows.
                            </p>
                            {/* <p className="text-headingXs text-text-secondary font-light italic">
                                The Soft Tissue Sarcoma Integrated Research Platform provides a harmonized environment
                                for exploring clinical, molecular, pharmacogenomic, imaging, and pathology data across
                                patient cohorts and preclinical models. The platform supports interactive analysis,
                                cross-cohort investigation, biomarker discovery, and the future integration of governed
                                agentic AI workflows for translational sarcoma research.
                            </p> */}
                        </div>
                        <button
                            className="flex flex-row items-center justify-center w-48 gap-2 text-white bg-primary py-3 px-5 rounded-md hover:cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
                            onClick={() => navigate('/datasets')}
                        >
                            <span className="text-headingMd font-light">View Datasets</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-1 gap-4 flex-1 w-full">
                        {platformFeatures.map((feature, idx) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={idx}
                                    className="flex flex-col gap-3 p-5 bg-white shadow-md hover:shadow-md rounded-xl border border-border transition-all duration-300 ease-out hover:-translate-y-0.5"
                                >
                                    <div className="flex flex-row items-center gap-3">
                                        <div
                                            className={`flex items-center justify-center p-2 rounded-lg border ${feature.badgeClass}`}
                                        >
                                            <Icon className="w-5 h-5 shrink-0" />
                                        </div>
                                        <h2 className="font-semibold text-headingLg text-text-primary text-wrap overflow-hidden">
                                            {feature.title}
                                        </h2>
                                    </div>
                                    <p className="text-text-secondary text-bodyMd leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex flex-wrap justify-center items-center max-w-[1000px] w-full gap-4 absolute bottom-8 md:static md:bottom-3">
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading2Xl font-bold text-primary tracking-tight">
                            <AnimatedCounter end={landingPageStats.total_clinical_datasets} duration={1200} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-primary whitespace-nowrap">
                            Clinical Datasets
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading2Xl font-bold text-primary tracking-tight">
                            <AnimatedCounter end={landingPageStats.total_pre_clinical_datasets} duration={1300} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-primary whitespace-nowrap">
                            Preclinical Datasets
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading2Xl font-bold text-primary tracking-tight">
                            <AnimatedCounter end={landingPageStats.total_clinical_samples} duration={1800} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-primary whitespace-nowrap">
                            Clinical Samples
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5  bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading2Xl font-bold text-primary tracking-tight">
                            <AnimatedCounter end={landingPageStats.total_pre_clinical_samples} duration={2200} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-primary whitespace-nowrap">
                            Preclinical Samples
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5  bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading2Xl font-bold text-primary tracking-tight">
                            <AnimatedCounter end={landingPageStats.total_drugs} duration={2200} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-primary whitespace-nowrap">Drugs</span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5  bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading2Xl font-bold text-primary tracking-tight">
                            <AnimatedCounter end={landingPageStats.total_cell_lines} duration={2200} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-primary whitespace-nowrap">Cell Lines</span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading2Xl font-bold text-primary tracking-tight">
                            <AnimatedCounter end={landingPageStats.total_genes} duration={1400} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-primary whitespace-nowrap">Genes</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
