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

            <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                    id="dac-team"
                >
                    DAC Team
                </h3>
                <div className="flex flex-col gap-4">
                    <p className="text-bodyLg font-light xs:text-bodyMd">***DAC TEAM ACKNOWLEDGEMENT***</p>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                    id="acknowledgements"
                >
                    Acknowledgements
                </h3>
                <div className="flex flex-col gap-4">
                    <p className="text-bodyLg font-light xs:text-bodyMd">***GENERAL ACKNOWLEDGEMENTS***</p>
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
                        The platform currently supports 3 different plots (scatter, heatmap, and violin plot) which are
                        used to visualize the various data layers for a given dataset. These data layers can have their
                        samples futher filtered by sex, age, race, cancer histology/subtype, and drug FDA approval
                        status. These visualizations allow users to explore the data in a variety of ways and identify
                        potential biomarkers, therapeutic targets, or even patient cohorts of interest.
                    </p>
                </div>
            </div>
            {/* <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                    id="analyses"
                >
                    Analyses
                </h3>
                <div className="flex flex-col gap-4">
                    <p className="text-bodyMd font-light xs:text-bodySm text-gray-500">Coming soon!</p>
                </div>
            </div> */}
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
                        functionality in the <span className="font-bold">Q1 of 2027</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export const Contact: React.FC<SectionProps> = ({ scrollTarget }) => {
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
            <h2 className="text-heading4Xl xs:text-headingXl font-semibold text-primary">Contact</h2>
            <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                    id="location"
                >
                    Location
                </h3>
                <div className="flex flex-col gap-4">
                    <p className="text-bodyLg font-light xs:text-bodyMd">
                        The platform has been produced by the Benjamin Haibe-Kains Lab at Allan Slaight Medical
                        Innovation Labs (formerly, Princess Margaret Cancer Research Tower), 101 College St, Toronto, ON
                        M5G 2C4, Canada.
                    </p>
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1944.3614653643756!2d-79.39037271454299!3d43.659613992242505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b34b63ed85d6b%3A0x6a2acad7b5f4519!2sAllan%20Slaight%20Medical%20Innovation%20Labs!5e0!3m2!1sen!2sca!4v1789490055327!5m2!1sen!2sca"
                        width="100%"
                        height="600px"
                        style={{ border: '0' }}
                        allowFullScreen={true}
                        loading="lazy"
                        referrerPolicy="strict-origin-when-cross-origin"
                    />
                </div>
            </div>
            <div className="flex flex-col gap-2">
                <h3
                    className="text-headingLg xs:text-headingMd font-semibold text-black-900 scroll-mt-20 "
                    id="contact"
                >
                    Digital Contact
                </h3>
                <div className="flex flex-col gap-4">
                    <p className="text-bodyLg font-light xs:text-bodyMd">
                        Feel free to reach out to the team regarding new recommendations, dataset requests, platform
                        bugs, collaboration opportunities, or any other comments. You can reach the team at{' '}
                        <a href="mailto:soft-tissue-sarcoma@bhklab.ca" className="text-primary hover:underline">
                            soft-tissue-sarcoma@bhklab.ca
                        </a>
                        . We look forward to hearing from you!
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
                    The platform currently includes 5 preclinical and 1 clinical dataset. All pre clinical datasets have
                    undergone the same processing steps, terminology standardizations (utilizing{' '}
                    <a
                        href="https://oncotree.org"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                    >
                        Oncotree
                    </a>{' '}
                    and{' '}
                    <a
                        href="http://annotationdb.bhklab.ca"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                    >
                        AnnotationDB
                    </a>
                    ), and molecular profile harmonizations. All of the produced preclinical dataset objects can also be
                    found on{' '}
                    <a
                        href="https://orcestra.ca/pset/search"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                    >
                        https://orcestra.ca/pset/search
                    </a>
                    . For this platform, the preclinical datasets have only included cell lines filtered with{' '}
                    <a
                        href="https://oncotree.mskcc.org/?version=oncotree_latest_stable&field=NAME"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                    >
                        Oncotree
                    </a>{' '}
                    tissue type = <span className="font-bold">&quot;Soft Tissue&quot;</span> directly through their{' '}
                    <a
                        href="https://oncotree.mskcc.org/swagger/index.html#/TumorTypes/get_api_tumorTypes_search__type___query_"
                        target="_blank"
                        rel="noreferrer noopener"
                        className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                    >
                        API
                    </a>
                    . There are a few edge cases of tissue type = <span className="font-bold">"Uterus"</span> being
                    included in the platform as recommended by clinicians and/or disease site experts who have deemed
                    them relevant for Soft Tissue subtyping.
                </p>
                <div>
                    <h3 className="text-headingMd font-semibold text-black-900 mb-2 text-text-secondary">
                        Preclinical dataset(s):
                    </h3>
                    <ul className="list-disc pl-6">
                        <li className="text-headingSm">
                            <a
                                href="https://orcestra.ca/pset/691b7d79f27eb50d59c52e80"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                            >
                                CCLE 2019
                            </a>{' '}
                            (Treatment Response and Microarray from{' '}
                            <a
                                href="https://orcestra.ca/pset/5ef3659e785cc307d861e79c"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                            >
                                CCLE 2015
                            </a>
                            )
                        </li>
                        <li className="text-headingSm">
                            <a
                                href="https://orcestra.ca/pset/6a6c9c128a85a3c3fb977e58"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                            >
                                CTRPv2
                            </a>{' '}
                        </li>
                        <li className="text-headingSm">
                            <a
                                href="https://orcestra.ca/pset/61bb751a308ac5003a648fbe"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                            >
                                GDSC2
                            </a>{' '}
                        </li>
                        <li className="text-headingSm">
                            <a
                                href="https://orcestra.ca/pset/60c3dc783940cf1de1bbc298"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                            >
                                gCSI
                            </a>{' '}
                        </li>
                        <li className="text-headingSm">
                            <a
                                href="https://orcestra.ca/pset/611d353d01d3364d6cb9978f"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                            >
                                PRISM
                            </a>{' '}
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-headingMd font-semibold text-black-900 mb-2 text-text-secondary">
                        Clinical dataset(s):
                    </h3>{' '}
                    <ul className="list-disc pl-6">
                        <li className="text-headingSm">
                            <a
                                href="https://portal.gdc.cancer.gov/projects/TCGA-SARC"
                                target="_blank"
                                rel="noreferrer noopener"
                                className="text-blue-600 hover:underline decoration-blue-600 decoration-1"
                            >
                                TCGA SARC
                            </a>{' '}
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};
