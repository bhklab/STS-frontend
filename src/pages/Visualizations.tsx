import React, { useState, useEffect } from 'react';
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

const Visualizations: React.FC = () => {
    const [clinical, setClinical] = useState(false);
    const [dataset, setDataset] = useState<Dataset | null>(null);
    const [preclinicalDatasets, setPreclinicalDatasets] = useState<Dataset[]>([]);
    const [clinicalDatasets, setClinicalDatasets] = useState<Dataset[]>([]);

    const [availableVisualizations, setAvailableVisualizations] = useState<String[]>(['Scatter Plot', 'Heatmap', 'Violin Plot']);
    const [visualization, setVisualization] = useState('Scatter Plot');

    // Data layer state
    const [availableLayers, setAvailableLayers] = useState<String[]>([]);
    const [layer, setLayer] = useState<String>('RNA-seq');

    // Response type state
    const [availableResponseTypes, setAvailableResponseTypes] = useState<String[]>(['AAC', 'IC50']);
    const [responseType, setResponseType] = useState<String | null>(null);

    // Gene state
    const [availableGenes, setAvailableGenes] = useState<Gene[]>([]);
    const [genes, setGenes] = useState<Gene[]>([]);
    const [retrievingGenes, setRetrievingGenes] = useState(false);

    // Plot Data state
    const [plotData, setPlotData] = useState<Record<string, PlotDataPoint[]>>({});

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
        getDataLayers(dataset.id);
    };

    const getDataLayers = async (dataset_id: number) => {
        const res = await axios.get(`/api/datasets/data-layers`, {
            params: {
                dataset_id: dataset_id
            }
        });
        setGenes([]);
        setPlotData({});
        getAvailableGenes(dataset_id, res.data[0]);
        setAvailableLayers(res.data);
    };

    const selectDataLayer = async (layer: String) => {
        setLayer(layer);
        if (!dataset) return;
        const res = await axios.get(`/api/datasets/genes`, {
            params: {
                dataset_id: dataset.id,
                molecular_profile: layer
            }
        });
        setGenes([]);
        setPlotData({});
        setAvailableGenes(res.data);
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
        setGenes(genes);
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
        setPlotData(res.data);
    };

    return (
        <div className="w-full bg-background px-10 py-10 wrap:py-4">
            <div
                className={`flex flex-row gap-4 max-w-[2000px] m-auto min-h-screen justify-center items-start wrap:justify-start wrap:flex-col wrap:w-full`}
            >
                <Tooltip target=".preclinical-icon" />
                <Tooltip target=".clinical-icon" />
                <div className="flex flex-col min-w-75 gap-4 bg-white p-4 rounded-md shadow-card border border-border/75 wrap:w-full wrap:flex-row wrap:flex-wrap">
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
                                onChange={e => setDataset(e.value)}
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
                    <div className="flex gap-2 items-center max-w-[270px]">
                        <MultiSelect
                            value={genes}
                            onChange={e => selectGenes(e.value)}
                            options={availableGenes}
                            optionLabel="name"
                            dataKey="gene_id"
                            filter
                            selectionLimit={20}
                            virtualScrollerOptions={{ itemSize: 40 }}
                            display="chip"
                            placeholder="Select gene"
                            className="w-full wrap:w-14rem"
                        />
                        {retrievingGenes && (
                            <div className="flex flex-row justify-center">
                                <ProgressSpinner style={{ width: '20px', height: '20px' }} strokeWidth="4" />
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-1 bg-white rounded-md shadow-card border border-border/75 p-6 wrap:w-full wrap:flex-0">
                    {plotData && Object.keys(plotData).length > 0 ? (
                        visualization === 'Scatter Plot' ? (
                            genes && <DotPlot data={plotData} />
                        ) : visualization === 'Heatmap' ? (
                            genes && <Heatmap data={plotData} />
                        ) : (
                            genes && <ViolinPlot data={plotData} layerName={layer as string} />
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
