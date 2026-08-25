import React, { useState, useEffect, useMemo } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Hospital, Microscope } from 'lucide-react';
import DotPlot, { type PlotDataPoint } from '../components/DotPlot';
import Heatmap from '../components/Heatmap';
import ViolinPlot from '../components/ViolinPlot';
import { Tooltip } from 'primereact/tooltip';
import { ProgressSpinner } from 'primereact/progressspinner';
import { MultiSelect } from 'primereact/multiselect';
import axios from 'axios';

// Dummy data for multiple genes

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

    const isTreatment = layer === 'Treatment Response'; // True, if 'Treatment Response' is selected
    const entityLabel = useMemo(() => {
        if (isTreatment) return 'Drug';
        if (layer === 'RPPA') return 'Antigen';
        if (layer === 'MiRNA') return 'miRNA';
        if (layer === 'Methylation') return 'Probe';
        return 'Gene';
    }, [isTreatment, layer]);
    const valueLabel = isTreatment ? (responseType === 'IC50' ? 'IC50 Response' : 'AAC Response') : 'Value'; // Defining y-axis values

    // Format data for plots based on layer and responseType
    const formattedPlotData = useMemo<Record<string, PlotDataPoint[]>>(() => {
        if (!plotData || Object.keys(plotData).length === 0) return {};
        if (!isTreatment) return plotData as Record<string, PlotDataPoint[]>;

        const metric = responseType === 'IC50' ? 'ic50_recomputed' : 'aac_recomputed';
        const transformed: Record<string, PlotDataPoint[]> = {};

        for (const [drugName, items] of Object.entries(plotData)) {
            transformed[drugName] = (items as any[])
                .filter(p => p[metric] !== null && p[metric] !== undefined && !isNaN(Number(p[metric])))
                .map(p => ({
                    cellLine: p.cellLine,
                    value: Number(p[metric]),
                    tissue: p.tissue
                }));
        }
        return transformed;
    }, [plotData, isTreatment, responseType]);

    useEffect(() => {
        const getDatasets = async () => {
            const res = await axios.get('/api/datasets/all');
            res.data.forEach((dataset: Dataset) => {
                if (dataset.clinical) {
                    setClinicalDatasets(prev => [...prev, dataset]);
                } else {
                    setPreclinicalDatasets(prev => [...prev, dataset]);
                }
            });
            setDataset(res.data[0]);
        };
        getDatasets();
    }, []);

    useEffect(() => {
        if (dataset) {
            getDataLayers(dataset.id);
        }
    }, [dataset]);

    const selectDataset = async (dataset: Dataset) => {
        setDataset(dataset);
        setAvailableLayers([]);
        setAvailableGenes([]);
        setAvailableDrugs([]);
        setSelectedGenes([]);
        setSelectedDrugs([]);
        setPlotData({});
        getDataLayers(dataset.id);
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

    const selectDataLayer = async (layer: String) => {
        setLayer(layer);
        if (!dataset) return;
        if (layer === 'Treatment Response') {
            if (!responseType) setResponseType('AAC');
            getAvailableDrugs(dataset.id);
        } else {
            getAvailableGenes(dataset.id, layer);
        }
        setSelectedGenes([]);
        setSelectedDrugs([]);
        setPlotData({});
    };

    const getAvailableGenes = async (dataset_id: number, layer: String) => {
        setRetrievingGenes(true);
        const res = await axios.get(`/api/datasets/genes`, {
            params: {
                dataset_id: dataset_id,
                molecular_profile: layer
            }
        });
        setAvailableGenes(res.data);
        setRetrievingGenes(false);
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
                cellLine: p.cellLine ?? String(p.sample),
                value: p.value ?? (p.mutation !== undefined ? (p.mutation ? 1 : 0) : 0),
                tissue: p.tissue
            }));
        }
        setPlotData(normalized);
    };

    const getAvailableDrugs = async (dataset_id: number) => {
        setRetrievingDrugs(true);
        const res = await axios.get(`/api/datasets/drugs`, {
            params: {
                dataset_id: dataset_id
            }
        });
        setAvailableDrugs(res.data);
        setRetrievingDrugs(false);
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
                </div>
                <div className="flex flex-1 bg-white rounded-md shadow-card border border-border/75 p-6 wrap:w-full wrap:flex-0">
                    {formattedPlotData && Object.keys(formattedPlotData).length > 0 ? (
                        visualization === 'Scatter Plot' ? (
                            <DotPlot
                                data={formattedPlotData}
                                treatment={isTreatment}
                                entityLabel={entityLabel}
                                valueLabel={valueLabel}
                            />
                        ) : visualization === 'Heatmap' ? (
                            <Heatmap
                                data={formattedPlotData}
                                treatment={isTreatment}
                                entityLabel={entityLabel}
                                valueLabel={valueLabel}
                            />
                        ) : (
                            <ViolinPlot
                                data={formattedPlotData}
                                layerName={layer as string}
                                treatment={isTreatment}
                                entityLabel={entityLabel}
                                valueLabel={valueLabel}
                            />
                        )
                    ) : (
                        <div className="flex flex-row justify-center items-center w-full">
                            <h1 className="font-light text-text-primary">Make a data selection to visualize</h1>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Visualizations;
