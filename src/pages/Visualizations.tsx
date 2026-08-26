import React, { useState, useEffect, useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Hospital, Microscope } from 'lucide-react';
import DotPlot from '../components/DotPlot';
import { type PlotDataPoint } from '../components/plotConstants';
import Heatmap from '../components/Heatmap';
import ViolinPlot from '../components/ViolinPlot';
import { Tooltip } from 'primereact/tooltip';
import { ProgressSpinner } from 'primereact/progressspinner';
import { MultiSelect } from 'primereact/multiselect';
import axios from 'axios';

interface Dataset {
    id: number;
    name: string;
    clinical: boolean;
    description?: string;
    version?: string;
    layers?: string[];
}

interface Gene {
    gene_id: string;
    name: string;
}

interface Drug {
    treatment_id: string;
    cid: string;
}

interface AgeRange {
    label: string;
    min: number;
    max: number;
}

const AGE_RANGES: AgeRange[] = [
    { label: '0-14', min: 0, max: 14 },
    { label: '15-24', min: 15, max: 24 },
    { label: '25-34', min: 25, max: 34 },
    { label: '35-44', min: 35, max: 44 },
    { label: '45-54', min: 45, max: 54 },
    { label: '55-64', min: 55, max: 64 },
    { label: '65-74', min: 65, max: 74 },
    { label: '75-84', min: 75, max: 84 },
    { label: '85-94', min: 85, max: 94 },
    { label: '95+', min: 95, max: Infinity }
];

const Visualizations: React.FC = () => {
    const [clinical, setClinical] = useState(false);
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [preclinicalDatasets, setPreclinicalDatasets] = useState<Dataset[]>([]);
    const [clinicalDatasets, setClinicalDatasets] = useState<Dataset[]>([]);

    const [availableVisualizations, setAvailableVisualizations] = useState<String[]>([
        'Scatter Plot',
        'Heatmap',
        'Violin Plot'
    ]);
    const [visualization, setVisualization] = useState('Scatter Plot');

    // Data layer state
    const [availableLayers, setAvailableLayers] = useState<String[]>([]);
    const [layer, setLayer] = useState<String>('RNA-seq');

    // Response type state
    const [availableResponseTypes, setAvailableResponseTypes] = useState<String[]>(['AAC', 'IC50']);
    const [responseType, setResponseType] = useState<String>('AAC');

    // Gene state
    const [availableGenes, setAvailableGenes] = useState<Gene[]>([]);
    const [selectedGenes, setSelectedGenes] = useState<Gene[]>([]);
    const [retrievingGenes, setRetrievingGenes] = useState(false);

    // Drug State
    const [availableDrugs, setAvailableDrugs] = useState<Drug[]>([]);
    const [selectedDrugs, setSelectedDrugs] = useState<Drug[]>([]);
    const [retrievingDrugs, setRetrievingDrugs] = useState(false);

    // Plot Data state
    const [plotData, setPlotData] = useState<Record<string, PlotDataPoint[]>>({});

    // Filter state
    const [filterSex, setFilterSex] = useState<string[]>([]);
    const [filterAge, setFilterAge] = useState<string[]>([]);
    const [filterSecondLevel, setFilterSecondLevel] = useState<string[]>([]);
    const [filterFdaApproval, setFilterFdaApproval] = useState<string | null>(null);
    const [filterRace, setFilterRace] = useState<string[]>([]);
    const [filterHistology, setFilterHistology] = useState<string[]>([]);

    const isTreatment = layer === 'Treatment Response'; // True, if 'Treatment Response' is selected
    const entityLabel = useMemo(() => {
        if (isTreatment) return 'Drug';
        if (layer === 'RPPA') return 'Antigen';
        if (layer === 'MiRNA') return 'miRNA';
        if (layer === 'Methylation') return 'Probe';
        return 'Gene';
    }, [isTreatment, layer]);
    const valueLabel = isTreatment ? (responseType === 'IC50' ? 'IC50 Response' : 'AAC Response') : 'Value'; // Defining y-axis values

    const hasActiveFilters =
        filterSex.length > 0 ||
        filterAge.length > 0 ||
        filterSecondLevel.length > 0 ||
        filterRace.length > 0 ||
        filterHistology.length > 0 ||
        filterFdaApproval !== null;

    // Format data for plots based on layer and responseType
    const formattedPlotData = useMemo<Record<string, PlotDataPoint[]>>(() => {
        if (!plotData || Object.keys(plotData).length === 0) return {};

        let data: Record<string, PlotDataPoint[]>;
        if (!isTreatment) {
            data = plotData as Record<string, PlotDataPoint[]>;
        } else {
            const metric = responseType === 'IC50' ? 'ic50_recomputed' : 'aac_recomputed';
            const transformed: Record<string, PlotDataPoint[]> = {};
            for (const [drugName, items] of Object.entries(plotData)) {
                transformed[drugName] = (items as any[])
                    .filter(p => p[metric] !== null && p[metric] !== undefined && !isNaN(Number(p[metric])))
                    .map(p => ({
                        ...p,
                        cellLine: p.cellLine,
                        value: Number(p[metric]),
                        tissue: p.tissue
                    }));
            }
            data = transformed;
        }

        // Apply filters
        const filtered: Record<string, PlotDataPoint[]> = {};
        for (const [key, points] of Object.entries(data)) {
            const fp = points.filter(p => {
                if (filterSex.length > 0) {
                    const s = String(p.sex ?? '').toUpperCase();
                    const match = filterSex.some(sel => {
                        const u = sel.toUpperCase();
                        if (u === s) return true;
                        if ((u === 'MALE' || u === 'M') && (s === 'M' || s === 'MALE')) return true;
                        if ((u === 'FEMALE' || u === 'F') && (s === 'F' || s === 'FEMALE')) return true;
                        return false;
                    });
                    if (!match) return false;
                }
                if (filterAge.length > 0) {
                    if (p.age == null || p.age === '' || isNaN(Number(p.age))) return false;
                    const ageNum = Number(p.age);
                    const matchesAge = filterAge.some(selectedRange => {
                        const range = AGE_RANGES.find(r => r.label === selectedRange);
                        return range && ageNum >= range.min && ageNum <= range.max;
                    });
                    if (!matchesAge) return false;
                }
                if (filterSecondLevel.length > 0 && !filterSecondLevel.includes(String(p.second_level ?? '')))
                    return false;
                if (filterRace.length > 0 && !filterRace.includes(String(p.race ?? ''))) return false;
                if (filterHistology.length > 0 && !filterHistology.includes(String(p.histology ?? ''))) return false;
                if (filterFdaApproval !== null) {
                    const approved = Boolean(p.fda_approval);
                    if (filterFdaApproval === 'Yes' && !approved) return false;
                    if (filterFdaApproval === 'No' && approved) return false;
                }
                return true;
            });
            if (fp.length > 0) filtered[key] = fp;
        }
        return filtered;
    }, [
        plotData,
        isTreatment,
        responseType,
        filterSex,
        filterAge,
        filterSecondLevel,
        filterFdaApproval,
        filterRace,
        filterHistology
    ]);

    useEffect(() => {
        const getDatasets = async () => {
            const res = await axios.get('/api/datasets/all');
            const clinicalList: Dataset[] = [];
            const preclinicalList: Dataset[] = [];
            res.data.forEach((d: Dataset) => {
                if (d.clinical) {
                    clinicalList.push(d);
                } else {
                    preclinicalList.push(d);
                }
            });
            setClinicalDatasets(clinicalList);
            setPreclinicalDatasets(preclinicalList);
            if (res.data.length > 0) {
                setDataset(res.data[0]);
            }
        };
        getDatasets();
    }, []);

    useEffect(() => {
        if (dataset) {
            getDataLayers(dataset.id);
        }
    }, [dataset]);

    const clearFilters = () => {
        setFilterSex([]);
        setFilterAge([]);
        setFilterSecondLevel([]);
        setFilterFdaApproval(null);
        setFilterRace([]);
        setFilterHistology([]);
    };

    const selectDataset = async (dataset: Dataset) => {
        setDataset(dataset);
        setAvailableLayers([]);
        setAvailableGenes([]);
        setAvailableDrugs([]);
        setSelectedGenes([]);
        setSelectedDrugs([]);
        setPlotData({});
        clearFilters();
    };

    const getDataLayers = async (dataset_id: number) => {
        const res = await axios.get(`/api/datasets/data-layers`, {
            params: {
                dataset_id: dataset_id
            }
        });
        setSelectedGenes([]);
        setSelectedDrugs([]);
        setPlotData({});
        const firstLayer = res.data[0];
        setLayer(firstLayer);
        if (firstLayer === 'Treatment Response') {
            if (!responseType) setResponseType('AAC');
            getAvailableDrugs(dataset_id);
        } else {
            getAvailableGenes(dataset_id, firstLayer);
        }
        setAvailableLayers(res.data);
    };

    const handleToggleClinical = (isClinical: boolean) => {
        setClinical(isClinical);
        const targetList = isClinical ? clinicalDatasets : preclinicalDatasets;
        if (targetList.length > 0) {
            selectDataset(targetList[0]);
        }
    };

    const selectDataLayer = async (layer: String) => {
        setLayer(layer);
        setSelectedGenes([]);
        setSelectedDrugs([]);
        setPlotData({});
        clearFilters();
        if (!dataset) return;
        if (layer === 'Treatment Response') {
            if (!responseType) setResponseType('AAC');
            getAvailableDrugs(dataset.id);
        } else {
            getAvailableGenes(dataset.id, layer);
        }
    };

    const getAvailableGenes = async (dataset_id: number, layer: String) => {
        setRetrievingGenes(true);
        setAvailableGenes([]);
        try {
            const res = await axios.get(`/api/datasets/genes`, {
                params: {
                    dataset_id: dataset_id,
                    molecular_profile: layer
                }
            });
            setAvailableGenes(res.data);
        } catch (err) {
            console.error('Failed to retrieve genes/antigens/probes:', err);
            setAvailableGenes([]);
        } finally {
            setRetrievingGenes(false);
        }
    };

    const selectGenes = async (genes: Gene[]) => {
        setSelectedGenes(genes);
        if (!dataset || genes.length === 0) {
            setPlotData({});
            return;
        }
        const res = await axios.get(`/api/data-layer/molecular-profile`, {
            params: {
                dataset_id: dataset.id,
                molecular_profile: layer,
                gene: genes.map((gene: Gene) => gene.gene_id)
            },
            paramsSerializer: {
                indexes: null // serializes as ?gene=ID1&gene=ID2
            }
        });
        // Clinical data returns `sample` instead of `cellLine`; normalize to a common shape
        const normalized: Record<string, PlotDataPoint[]> = {};
        for (const [geneName, points] of Object.entries(res.data as Record<string, any[]>)) {
            normalized[geneName] = points.map(p => ({
                ...p,
                cellLine: p.cellLine ?? String(p.sample),
                value: p.value ?? (p.mutation !== undefined ? (p.mutation ? 1 : 0) : 0),
                tissue: p.tissue
            }));
        }
        setPlotData(normalized);
    };

    const getAvailableDrugs = async (dataset_id: number) => {
        setRetrievingDrugs(true);
        setAvailableDrugs([]);
        try {
            const res = await axios.get(`/api/datasets/drugs`, {
                params: {
                    dataset_id: dataset_id
                }
            });
            setAvailableDrugs(res.data);
        } catch (err) {
            console.error('Failed to retrieve drugs:', err);
            setAvailableDrugs([]);
        } finally {
            setRetrievingDrugs(false);
        }
    };

    const selectDrugs = async (drugs: Drug[]) => {
        setSelectedDrugs(drugs);
        if (!dataset || drugs.length === 0) {
            setPlotData({});
            return;
        }
        const res = await axios.get(`/api/data-layer/treatment-response`, {
            params: {
                dataset_id: dataset.id,
                drug: drugs.map((drug: Drug) => drug.treatment_id)
            },
            paramsSerializer: {
                indexes: null // serializes as ?drug=ID1&drug=ID2
            }
        });
        setPlotData(res.data);
    };

    return (
        <div className="w-full bg-background px-10 py-10 wrap:py-4">
            <div
                className={`flex flex-row gap-4 max-w-[2000px] m-auto min-h-screen justify-center items-start wrap:justify-start wrap:flex-col wrap:w-full`}
            >
                <Tooltip target=".preclinical-icon" />
                <Tooltip target=".clinical-icon" />
                <div className="flex flex-col w-60 gap-4 bg-white p-4 rounded-md shadow-card border border-border/75 wrap:w-full wrap:flex-row wrap:flex-wrap">
                    <div className="flex flex-row">
                        <div className="flex flex-row gap-4 justify-center">
                            <div
                                className={`p-2 rounded-md cursor-pointer ${!clinical ? 'bg-subsection-1' : ''} hover:bg-subsection-1 preclinical-icon`}
                                onClick={() => handleToggleClinical(false)}
                                data-pr-tooltip="Pre-clinical data"
                                data-pr-position="top"
                                data-pr-at="center top-10"
                            >
                                <Microscope className={`${!clinical ? 'text-primary' : 'text-text-primary'}`} />
                            </div>

                            <div
                                className={`p-2 rounded-md cursor-pointer ${clinical ? 'bg-subsection-1' : ''} hover:bg-subsection-1 clinical-icon`}
                                onClick={() => handleToggleClinical(true)}
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
                                onChange={e => selectDataset(e.value)}
                                options={clinicalDatasets}
                                optionLabel="name"
                                placeholder="Select a clinical dataset"
                                className="w-full wrap:w-14rem"
                            />
                        ) : (
                            <Dropdown
                                value={dataset}
                                onChange={e => selectDataset(e.value)}
                                options={preclinicalDatasets}
                                optionLabel="name"
                                placeholder="Select a preclinical dataset"
                                className="w-full wrap:w-14rem"
                            />
                        )}
                    </div>
                    <div className="flex">
                        <Dropdown
                            value={visualization}
                            onChange={e => setVisualization(e.value)}
                            options={availableVisualizations}
                            placeholder="Select a visualization"
                            className="w-full wrap:w-14rem"
                        />
                    </div>
                    <div className="flex">
                        <Dropdown
                            value={layer}
                            onChange={e => selectDataLayer(e.value)}
                            options={availableLayers}
                            placeholder="Select a molecular profile"
                            className="w-full wrap:w-14rem"
                        />
                    </div>
                    {layer === 'Treatment Response' && (
                        <div className="flex">
                            <Dropdown
                                value={responseType}
                                onChange={e => setResponseType(e.value)}
                                options={availableResponseTypes}
                                placeholder="Select a response type"
                                className="w-full wrap:w-14rem"
                            />
                        </div>
                    )}
                    {layer !== 'Treatment Response' ? (
                        <div className="flex gap-2 items-center max-w-[270px]">
                            <MultiSelect
                                value={selectedGenes}
                                onChange={e => selectGenes(e.value)}
                                options={availableGenes}
                                optionLabel="name"
                                dataKey="gene_id"
                                filter
                                filterBy="name,gene_id"
                                selectionLimit={20}
                                virtualScrollerOptions={{ itemSize: 40 }}
                                display="chip"
                                placeholder={`Select ${entityLabel.toLowerCase()}`}
                                className="w-full wrap:w-14rem"
                            />
                            {retrievingGenes && (
                                <div className="flex flex-row justify-center">
                                    <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="4" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex gap-2 items-center max-w-[270px]">
                            <MultiSelect
                                value={selectedDrugs}
                                onChange={e => selectDrugs(e.value)}
                                options={availableDrugs}
                                optionLabel="treatment_id"
                                dataKey="treatment_id"
                                filter
                                selectionLimit={20}
                                virtualScrollerOptions={{ itemSize: 40 }}
                                display="chip"
                                placeholder="Select a drug"
                                className="w-full wrap:w-14rem"
                            />
                            {retrievingDrugs && (
                                <div className="flex flex-row justify-center">
                                    <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="4" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Optional Filters */}
                    {Object.keys(plotData).length > 0 && (
                        <>
                            <div className="flex items-center justify-between border-t border-border/50 pt-3 mt-1">
                                <span className="text-xs font-medium text-text-primary/60 uppercase tracking-wide">
                                    Optional Filters
                                </span>
                                {hasActiveFilters && (
                                    <button
                                        type="button"
                                        onClick={clearFilters}
                                        className="text-xs text-primary hover:underline font-medium cursor-pointer"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>

                            {/* Sex filter — available for both pre-clinical & clinical */}
                            {(() => {
                                const options = [
                                    ...new Set(
                                        Object.values(plotData)
                                            .flat()
                                            .map(p => String(p.sex ?? ''))
                                            .filter(Boolean)
                                    )
                                ].sort();
                                return options.length > 0 ? (
                                    <div className="flex">
                                        <MultiSelect
                                            value={filterSex}
                                            onChange={e => setFilterSex(e.value)}
                                            options={options}
                                            display="chip"
                                            placeholder="Filter by sex"
                                            className="w-full wrap:w-14rem text-sm"
                                        />
                                    </div>
                                ) : null;
                            })()}

                            {/* Age filter */}
                            {(() => {
                                const presentRanges = AGE_RANGES.filter(range =>
                                    Object.values(plotData)
                                        .flat()
                                        .some(p => {
                                            if (p.age == null || p.age === '' || isNaN(Number(p.age))) return false;
                                            const ageNum = Number(p.age);
                                            return ageNum >= range.min && ageNum <= range.max;
                                        })
                                ).map(r => r.label);

                                return presentRanges.length > 0 ? (
                                    <div className="flex">
                                        <MultiSelect
                                            value={filterAge}
                                            onChange={e => setFilterAge(e.value)}
                                            options={presentRanges}
                                            display="chip"
                                            placeholder="Filter by age"
                                            className="w-full wrap:w-14rem text-sm"
                                        />
                                    </div>
                                ) : null;
                            })()}

                            {/* Subtype (second_level) — pre-clinical only */}
                            {!clinical &&
                                (() => {
                                    const options = [
                                        ...new Set(
                                            Object.values(plotData)
                                                .flat()
                                                .map(p => String(p.second_level ?? ''))
                                                .filter(Boolean)
                                        )
                                    ].sort();
                                    return options.length > 0 ? (
                                        <div className="flex">
                                            <MultiSelect
                                                value={filterSecondLevel}
                                                onChange={e => setFilterSecondLevel(e.value)}
                                                options={options}
                                                display="chip"
                                                placeholder="Filter by subtype"
                                                className="w-full wrap:w-14rem text-sm"
                                            />
                                        </div>
                                    ) : null;
                                })()}

                            {/* Race — clinical only */}
                            {clinical &&
                                (() => {
                                    const options = [
                                        ...new Set(
                                            Object.values(plotData)
                                                .flat()
                                                .map(p => String(p.race ?? ''))
                                                .filter(Boolean)
                                        )
                                    ].sort();
                                    return options.length > 0 ? (
                                        <div className="flex">
                                            <MultiSelect
                                                value={filterRace}
                                                onChange={e => setFilterRace(e.value)}
                                                options={options}
                                                display="chip"
                                                placeholder="Filter by race"
                                                className="w-full wrap:w-14rem text-sm"
                                            />
                                        </div>
                                    ) : null;
                                })()}

                            {/* Histology — clinical only */}
                            {clinical &&
                                (() => {
                                    const options = [
                                        ...new Set(
                                            Object.values(plotData)
                                                .flat()
                                                .map(p => String(p.histology ?? ''))
                                                .filter(Boolean)
                                        )
                                    ].sort();
                                    return options.length > 0 ? (
                                        <div className="flex">
                                            <MultiSelect
                                                value={filterHistology}
                                                onChange={e => setFilterHistology(e.value)}
                                                options={options}
                                                display="chip"
                                                placeholder="Filter by histology"
                                                className="w-full wrap:w-14rem text-sm"
                                            />
                                        </div>
                                    ) : null;
                                })()}

                            {/* FDA Approval — treatment response only */}
                            {isTreatment &&
                                (() => {
                                    const hasField = Object.values(plotData)
                                        .flat()
                                        .some(p => p.fda_approval != null);
                                    return hasField ? (
                                        <div className="flex">
                                            <Dropdown
                                                value={filterFdaApproval}
                                                onChange={e => setFilterFdaApproval(e.value)}
                                                options={[
                                                    { label: 'Any Drug Status', value: null },
                                                    { label: 'FDA Approved', value: 'Yes' },
                                                    { label: 'Not FDA Approved', value: 'No' }
                                                ]}
                                                optionLabel="label"
                                                optionValue="value"
                                                placeholder="FDA approval"
                                                className="w-full wrap:w-14rem text-sm"
                                            />
                                        </div>
                                    ) : null;
                                })()}
                        </>
                    )}
                </div>
                <div className="flex flex-1 bg-white rounded-md shadow-card border border-border/75 p-6 wrap:w-full wrap:flex-0">
                    {formattedPlotData && Object.keys(formattedPlotData).length > 0 ? (
                        visualization === 'Scatter Plot' ? (
                            <DotPlot
                                data={formattedPlotData}
                                treatment={layer === 'Treatment Response'}
                                entityLabel={entityLabel}
                                valueLabel={valueLabel}
                            />
                        ) : visualization === 'Heatmap' ? (
                            <Heatmap
                                data={formattedPlotData}
                                treatment={layer === 'Treatment Response'}
                                entityLabel={entityLabel}
                                valueLabel={valueLabel}
                            />
                        ) : (
                            <ViolinPlot
                                data={formattedPlotData}
                                layerName={layer.toString()}
                                treatment={layer === 'Treatment Response'}
                                entityLabel={entityLabel}
                                valueLabel={valueLabel}
                            />
                        )
                    ) : (
                        <div className="flex flex-1 justify-center items-center h-full min-h-[400px]">
                            <p className="text-gray-400 font-medium">
                                Please select {layer === 'Treatment Response' ? 'drugs' : `${entityLabel.toLowerCase()}s`} to display visualization
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Visualizations;
