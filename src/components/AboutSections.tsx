import React, { useEffect } from 'react';

type SectionProps = {
    scrollTarget?: string | null;
};

export const Overview: React.FC<SectionProps> = ({ scrollTarget }) => {
    useEffect(() => {
        async function scrollTo() {
            await new Promise(resolve => setTimeout(resolve, 75));
            if (!scrollTarget) return;
            const el = document.getElementById(scrollTarget);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        scrollTo();
    }, [scrollTarget]);
    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h2 className="text-heading4Xl xs:text-headingXl font-semibold text-primary">Overview</h2>
                <div className="flex flex-col gap-2">
                    <h3
                        className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                        id="sts-overview"
                    >
                        Soft Tissue Sarcoma
                    </h3>
                    <div className="flex flex-col gap-4">
                        <p className="text-bodyLg font-light xs:text-bodyMd">
                            The Soft Tissue Sarcoma Integrated Research Platform is a harmonized research environment
                            for exploring clinical and preclinical sarcoma datasets across molecular, pharmacogenomic,
                            imaging, pathology, and clinical data layers. The platform supports interactive exploration,
                            translational analyses, biomarker discovery, cross-cohort analysis, and reproducible
                            research workflows.
                        </p>
                        <p className="text-bodyLg font-light xs:text-bodyMd">
                            The platform is being developed to improve data integration and standardization across
                            heterogeneous sarcoma resources while supporting transparent data provenance, controlled
                            access, and FAIR and reproducible research practices.
                        </p>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                    id="platform-goals"
                >
                    Platform Goals
                </h3>
                <div className="flex flex-col gap-4">
                    <ul className="text-bodyLg font-light xs:text-bodyMd list-disc pl-6">
                        <li>Integrate clinical and preclinical sarcoma datasets.</li>
                        <li>Harmonize metadata and identifiers across data sources.</li>
                        <li>Support cohort exploration and cross-dataset analyses.</li>
                        <li>Enable biomarker, genomic,survival, and pharmacogenomic investigations.</li>
                        <li>Support reproducible and transparent analytical workflows.</li>
                        <li>Enable future governed AI-enabled research workflows.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export const Functionality: React.FC<SectionProps> = ({ scrollTarget }) => {
    useEffect(() => {
        async function scrollTo() {
            await new Promise(resolve => setTimeout(resolve, 75));
            if (!scrollTarget) return;
            const el = document.getElementById(scrollTarget);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        scrollTo();
    }, [scrollTarget]);
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-heading4Xl xs:text-headingXl font-semibold text-primary">Functionalities</h2>
            <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                    id="visualizations"
                >
                    Visualizations
                </h3>
                <div className="flex flex-col gap-4">
                    <p className="text-bodyLg font-light xs:text-bodyMd">
                        The platform includes several plots to visualize the various molecular, H&E, and treatment
                        response data layers.{' '}
                    </p>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                    id="analyses"
                >
                    Analyses
                </h3>
                <div className="flex flex-col gap-4">
                    <p className="text-bodyMd font-light xs:text-bodySm text-gray-500">Coming soon!</p>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                    id="ai-integration"
                >
                    AI Integration
                </h3>
                <div className="flex flex-col gap-4">
                    <p className="text-bodyLg font-light xs:text-bodyMd">
                        In the future our team plans to integrate an embedded AI agent that can create personalized
                        visualizations, execute novel analyses, provide significantly more granular data exports, and
                        answer complex questions about the platform's data. We plan to roll out this additional
                        functionality in the <span className="font-bold text-primary">Q1 of 2027</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const Data: React.FC<SectionProps> = ({ scrollTarget }) => {
    useEffect(() => {
        async function scrollTo() {
            await new Promise(resolve => setTimeout(resolve, 75));
            if (!scrollTarget) return;
            const el = document.getElementById(scrollTarget);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        scrollTo();
    }, [scrollTarget]);
    return (
        <div className="flex flex-col gap-4">
            <h2 className="text-heading4Xl xs:text-headingXl font-semibold text-primary">Data Sources</h2>
            <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-text-primary scroll-mt-20 "
                    id="datasets"
                >
                    Datasets
                </h3>
                <p className="text-bodyLg font-light xs:text-bodyMd">
                    The platform currently includes several datasets in both clinical and pre clinical research. As it
                    stands the platform includes{' '}
                    <a
                        href="https://orcestra.ca/pset/691b7d79f27eb50d59c52e80"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        CCLE
                    </a>
                    ,{' '}
                    <a
                        href="https://orcestra.ca/pset/6a6c9c128a85a3c3fb977e58"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        CTRPv2
                    </a>
                    ,{' '}
                    <a
                        href="https://orcestra.ca/pset/61bb751a308ac5003a648fbe"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        GDSC2
                    </a>
                    ,{' '}
                    <a
                        href="https://orcestra.ca/pset/60c3dc783940cf1de1bbc298"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        gCSI
                    </a>
                    , and{' '}
                    <a
                        href="https://orcestra.ca/pset/611d353d01d3364d6cb9978f"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        PRISM
                    </a>{' '}
                    for the pre clinical datasets, with plans to eventually add NCI Sarcoma, and CRISPR. For clinical
                    datasets the platform only includes{' '}
                    <a
                        href="https://pubmed.ncbi.nlm.nih.gov/29100075/"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        TCGA SARC
                    </a>{' '}
                    with plans to include a private dataset from Stanford.
                </p>
            </div>
        </div>
    );
};
