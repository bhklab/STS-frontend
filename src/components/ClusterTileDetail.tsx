import React, { useState } from 'react';
import { X, Layers, Users, Activity, Eye } from 'lucide-react';

export interface ExemplarTile {
    tile_id: number;
    slide_id: string;
    patient_id: string;
    tile_index: number;
    x: number;
    y: number;
    umap1: number;
    umap2: number;
    cluster_id: number;
    cluster: string;
    dist_to_centroid: number;
    histology?: string;
    tissue?: string;
    race?: string | null;
    sex?: string | null;
    age?: number | string | null;
    crop_url: string;
}

export interface ImagingCluster {
    cluster_id: number;
    name: string;
    tile_count: number;
    patient_count: number;
    dominant_histology: string;
    exemplars: ExemplarTile[];
}

interface ClusterTileDetailProps {
    cluster: ImagingCluster | null;
    color: string;
    onClose: () => void;
}

const ClusterTileDetail: React.FC<ClusterTileDetailProps> = ({ cluster, color, onClose }) => {
    const [selectedTile, setSelectedTile] = useState<ExemplarTile | null>(null);

    if (!cluster) return null;

    return (
        <div className="flex flex-col bg-white rounded-md shadow-card border border-border/75 p-6 gap-6 w-full animate-fadeIn">
            {/* Header */}
            <div className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full shadow-xs" style={{ backgroundColor: color }} />
                    <h2 className="text-headingLg font-semibold text-text-primary">
                        {cluster.name} — Morphological Phenotype
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="p-1.5 rounded-md hover:bg-background text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                    title="Close Details"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Metrics Ribbon */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col gap-3 p-3.5 bg-subsection-1/15 rounded-md border border-border/40">
                    <div className="flex flex-row gap-2 items-center">
                        <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <Layers className="w-5 h-5" />
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <div className="text-headingMd text-text-secondary font-medium">Tiles in Cluster:</div>
                            <div className="text-headingMd font-bold text-text-primary">
                                {cluster.tile_count.toLocaleString()}
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <Users className="w-5 h-5" />
                        </div>
                        <div className="flex flex-row gap-2 items-center">
                            <div className="text-caption text-text-secondary font-medium">Contributing Patients: </div>
                            <div className="text-headingMd font-bold text-text-primary">{cluster.patient_count}</div>
                        </div>
                    </div>
                    <div className="flex flex-row gap-2 items-center">
                        <div className="p-2 bg-primary/10 rounded-md text-primary">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-caption text-text-secondary font-medium">Dominant Histology</div>
                            <div
                                className="text-headingSm font-bold text-text-primary truncate max-w-[200px]"
                                title={cluster.dominant_histology}
                            >
                                {cluster.dominant_histology}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exemplar Tiles Section */}
            <div className="flex flex-col gap-3">
                <div className="flex flex-col items-start">
                    <h3 className="text-headingMd font-semibold text-text-primary">
                        Exemplar Tiles of Interest ({cluster.exemplars.length})
                    </h3>
                    <span className="text-bodyXs text-red-600">Ranked by Euclidean distance to centroid</span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                    {cluster.exemplars.map((tile, idx) => (
                        <div
                            key={`${tile.slide_id}-${tile.tile_id}-${idx}`}
                            onClick={() => setSelectedTile(tile)}
                            className="group flex flex-col bg-background/40 rounded-md border border-border/60 hover:border-primary/60 hover:shadow-md transition-all cursor-pointer overflow-hidden"
                        >
                            {/* Image container */}
                            <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                                <img
                                    src={tile.crop_url}
                                    alt={`Tile ${tile.tile_id}`}
                                    loading="lazy"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                    #{idx + 1}
                                </div>
                                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Eye className="w-6 h-6 text-white drop-shadow-md" />
                                </div>
                            </div>

                            {/* Metadata snippet */}
                            <div className="p-2.5 flex flex-col gap-1 text-[11px]">
                                <div className="font-semibold text-text-primary truncate" title={tile.patient_id}>
                                    {tile.patient_id}
                                </div>
                                <div className="text-text-secondary truncate">
                                    X: {Math.round(tile.x)}, Y: {Math.round(tile.y)}
                                </div>
                                <div className="text-[10px] text-primary font-mono mt-0.5">
                                    dist: {tile.dist_to_centroid.toFixed(3)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal for Focused Tile Inspection */}
            {selectedTile && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
                    onClick={() => setSelectedTile(null)}
                >
                    <div
                        className="bg-white rounded-lg shadow-2xl max-w-lg w-full p-6 flex flex-col gap-4 border border-border"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b pb-3">
                            <h4 className="text-headingMd font-bold text-text-primary">
                                Tile Inspection: {selectedTile.patient_id}
                            </h4>
                            <button
                                onClick={() => setSelectedTile(null)}
                                className="p-1 rounded-md hover:bg-background text-text-secondary cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="w-full aspect-square bg-slate-100 rounded-md overflow-hidden border border-border">
                            <img
                                src={selectedTile.crop_url}
                                alt="High-resolution tile"
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-bodySm text-text-primary bg-background/60 p-3 rounded-md border border-border/40">
                            <div>
                                <span className="font-semibold text-text-secondary">Slide ID: </span>
                                {selectedTile.slide_id}
                            </div>
                            <div>
                                <span className="font-semibold text-text-secondary">Patient: </span>
                                {selectedTile.patient_id}
                            </div>
                            <div>
                                <span className="font-semibold text-text-secondary">Coordinates: </span>(
                                {Math.round(selectedTile.x)}, {Math.round(selectedTile.y)})
                            </div>
                            <div>
                                <span className="font-semibold text-text-secondary">Histology: </span>
                                {selectedTile.histology || 'N/A'}
                            </div>
                            <div>
                                <span className="font-semibold text-text-secondary">Distance: </span>
                                {selectedTile.dist_to_centroid.toFixed(4)}
                            </div>
                            <div>
                                <span className="font-semibold text-text-secondary">Cluster: </span>
                                {selectedTile.cluster}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClusterTileDetail;
