import React, { useEffect, useState } from 'react';
import { Image } from 'primereact/image';

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
                            The Soft Tissue Sarcoma (STS) Integrated Data Portal aims to establish a scalable,
                            reproducible, and FAIR-compliant research platform for the harmonization, integration,
                            exploration, and analysis of sarcoma datasets spanning clinical cohorts, preclinical model
                            systems, molecular profiles, imaging resources, and therapeutic response data. The platform
                            is designed to support translational sarcoma research by enabling seamless integration of
                            diverse data sources within a unified analytical environment.
                        </p>
                        <p className="text-bodyLg font-light xs:text-bodyMd">
                            Given the biological heterogeneity of STS and the fragmented nature of existing sarcoma
                            resources, the platform addresses major challenges associated with cross-institutional data
                            integration, lack of standardization, and inconsistent analytical workflows. Through
                            standardized metadata structures, harmonized identifiers, and interoperable computational
                            pipelines, the portal will facilitate reproducible, collaborative, and data-driven sarcoma
                            research across institutions and research programs.
                        </p>
                        <p className="text-bodyLg font-light xs:text-bodyMd">
                            The platform will integrate diverse data types, including transcriptomic, genomic,
                            proteomic, imaging, clinical, and pharmacogenomic datasets derived from both patient cohorts
                            and preclinical sarcoma models. Through interactive visualization, advanced filtering,
                            cohort exploration, biomarker discovery, translational analytics, and controlled data
                            access, the portal will support investigations into disease biology, therapeutic response,
                            patient outcomes, and precision oncology applications in soft tissue sarcoma.
                        </p>
                        <p className="text-bodyLg font-light xs:text-bodyMd">
                            Importantly, the portal will be developed in accordance with FAIR data principles to ensure
                            that sarcoma-related datasets are Findable, Accessible, Interoperable, and Reusable. By
                            promoting data harmonization, reproducibility, and long-term accessibility, the STS
                            Integrated Data Portal aims to establish a sustainable research infrastructure that
                            accelerates biomarker discovery, therapeutic development, and collaborative translational
                            sarcoma research.
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
                    <p className="text-bodyLg font-light xs:text-bodyMd">
                        To centralize, harmonize, and enable integrated exploration of clinical, molecular, imaging, and
                        therapeutic response data for soft tissue sarcoma research, biomarker discovery, and
                        translational oncology applications.
                    </p>
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
                    <p className="text-bodyLg font-light xs:text-bodyMd"></p>
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
                    <p className="text-bodyLg font-light xs:text-bodyMd"></p>
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
                        href="https://orcestra.ca/pset/61bb74e7308ac5003a648fbd"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        GDSC1
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
                    , and{' '}
                    <a
                        href="https://orcestra.ca/pset/60c3dc783940cf1de1bbc298"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        gCSI
                    </a>
                    for the pre clinical datasets, with plans to eventually add NCI Sarcoma, PRISM, and CRISPR. For
                    clinical datasets the platform only includes{' '}
                    <a
                        href="https://pubmed.ncbi.nlm.nih.gov/29100075/"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        TCGA SARC
                    </a>{' '}
                    with plans to include Stanford's{' '}
                    <a
                        href="https://doi.org/10.1016/j.gdata.2015.06.029"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        GSE45510
                    </a>{' '}
                    and Heidelberg University Hospital's{' '}
                    <a
                        href="https://doi.org/10.1038/s41467-017-02602-0"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 font-semibold"
                    >
                        EGAS00001002437
                    </a>
                    .
                </p>
            </div>
        </div>
    );
};
