import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

interface AnimatedCounterProps {
    end: number;
    duration?: number;
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

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col bg-background min-h-[95vh] justify-center items-center">
            <div className="flex flex-col justify-center items-center w-full px-24 py-20">
                <div className="flex flex-row gap-6 items-center">
                    <div className="flex flex-col gap-6 justify-center max-w-2/3">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-7xl font-semibold  text-primary">
                                Explore The Sarcoma Data Collection
                            </h1>
                            <p className="text-headingXl text-text-primary font-light">
                                Get access to clinical and preclinical collections of{' '}
                                <span className="font-semibold text-soft-tissue">soft tissue sarcoma</span> and{' '}
                                <span className="font-semibold text-uterus">uterine datasets</span> alongside{' '}
                                <span className="font-semibold text-secondary">advanced analytics</span> and{' '}
                                <span className="font-semibold text-secondary">predictive tools</span>.
                            </p>
                        </div>
                        <button
                            className="flex flex-row items-center justify-center w-48 gap-2 text-white bg-primary py-3 px-5 rounded-md hover:cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
                            onClick={() => navigate('/datasets')}
                        >
                            <span className="text-headingMd font-light">View Datasets</span>
                        </button>
                    </div>
                    <div className="flex flex-row max-w-1/3"></div>
                </div>
                <div className="flex flex-wrap justify-center items-center max-w-7xl w-full gap-4 absolute bottom-8">
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading3Xl font-bold text-blue-600 tracking-tight">
                            <AnimatedCounter end={clinical_datasets.length} duration={1200} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-secondary whitespace-nowrap">
                            Clinical Datasets
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading3Xl font-bold text-cyan-700 tracking-tight">
                            <AnimatedCounter end={preclinical_datasets.length} duration={1300} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-secondary whitespace-nowrap">
                            Preclinical Datasets
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading3Xl font-bold text-rose-600 tracking-tight">
                            <AnimatedCounter end={60} duration={1800} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-secondary whitespace-nowrap">
                            Clinical Samples
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5  bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading3Xl font-bold text-orange-600 tracking-tight">
                            <AnimatedCounter end={200} duration={2200} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-secondary whitespace-nowrap">
                            Preclinical Samples
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border border-border">
                        <span className="text-heading3Xl font-bold text-green-600 tracking-tight">
                            <AnimatedCounter end={8} duration={1400} />
                        </span>
                        <span className="text-bodyLg font-medium text-text-secondary whitespace-nowrap">
                            Unique Data Layers
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
