import React, { useState, useMemo } from 'react';
import { Overview, Functionality, Data } from '../components/AboutSections';

type SectionProps = {
    scrollTarget?: string | null;
};

type SectionDef = {
    id: string;
    component: React.FC<SectionProps>;
    subsections: { id: string; value: string }[];
};

const About: React.FC = () => {
    const sections: SectionDef[] = useMemo(
        () => [
            {
                id: 'Overview',
                component: Overview,
                subsections: [
                    { id: 'sts-overview', value: 'Soft Tissue Sarcoma' },
                    { id: 'platform-goals', value: 'Platform Goals' }
                ]
            },
            {
                id: 'Data',
                component: Data,
                subsections: [{ id: 'datasets', value: 'Datasets' }]
            },
            {
                id: 'Functionalities',
                component: Functionality,
                subsections: [
                    { id: 'visualizations', value: 'Visualizations' },
                    { id: 'analyses', value: 'Analyses' },
                    { id: 'ai-integration', value: 'AI Integration' }
                ]
            }
        ],
        []
    );

    const [selected, setSelected] = useState<string>('Overview');
    const [selectedSub, setSelectedSub] = useState<string | undefined>(undefined);
    const [scrollTarget, setScrollTarget] = useState<string | null>(null);

    const Active = sections.find(s => s.id === selected)?.component;

    return (
        <div className="grid grid-cols-4 gap-6 py-32 max-w-300 m-auto">
            <div className="flex flex-col gap-2 col-span-1 sticky top-32 h-fit shrink-0 bg-white py-4 pl-10 rounded-lg border border-border/50 shadow-sm">
                <ul className="list-disc">
                    {sections.map(sects => (
                        <li
                            key={sects.id}
                            className={`text-headingMd py-1 hover:cursor-pointer hover:font-semibold hover:text-primary group w-fit ${selected === sects.id ? 'font-semibold text-primary' : 'font-light text-text-secondary'}`}
                            onClick={() => {
                                setSelected(sects.id);
                                setSelectedSub(undefined);
                                setScrollTarget(null);
                            }}
                        >
                            <div className="w-fit">
                                {sects.id}
                                <span
                                    className={`block group-hover:max-w-full group-hover:bg-primary transition-all duration-500 h-0.5  ${selected === sects.id ? 'bg-primary max-w-full' : 'bg-text-secondary max-w-0'}`}
                                />
                            </div>

                            {sects.subsections.length !== 0 && (
                                <ul className="list-disc pl-6">
                                    {sects.subsections.map(sub => (
                                        <li
                                            key={sub.id}
                                            className={`text-headingMd py-1 hover:cursor-pointer hover:text-primary group w-fit  font-light ${selectedSub === sub.id ? 'text-primary' : 'text-text-secondary'}`}
                                            onClick={e => {
                                                e.stopPropagation();
                                                setSelected(sects.id);
                                                setSelectedSub(sub.id);
                                                setScrollTarget(sub.id);
                                            }}
                                        >
                                            {sub.value}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col gap-10 mx-auto smd:px-4 col-span-3 text-text-primary p-6 bg-white border border-border/50 shadow-sm rounded-lg">
                {Active ? <Active scrollTarget={scrollTarget} /> : null}
            </div>
        </div>
    );
};

export default About;
