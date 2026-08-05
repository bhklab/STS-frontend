import React from 'react';
import { useNavigate } from 'react-router';

const Home: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col bg-background h-screen justify-center items-center">
            <div className="flex flex-col justify-between items-center min-h-[93vh] max-h-[93vh] w-full px-24 py-20">
                <div className="flex flex-row gap-6 items-center z-10">
                    <div className="flex flex-col gap-10 justify-start max-w-1/2">
                        <h1 className="text-7xl font-semibold  text-primary">Sarcoma Translation Suite</h1>
                        <p className="text-headingXl text-text-primary font-light">
                            Get access to comprehensively curated Small Tissue Sarcoma datasets alongside advanced
                            analytics & predictive tools.
                        </p>
                        <button
                            className="flex flex-row items-center justify-center w-48 gap-2 text-white bg-primary py-3 px-5 rounded-md hover:cursor-pointer transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl"
                            onClick={() => navigate('/datasets')}
                        >
                            <span className="text-headingMd font-light">View Datasets</span>
                        </button>
                    </div>
                    <div className="flex flex-col gap-4 max-w-1/2"></div>
                </div>
                <div className="flex flex-wrap justify-center items-center max-w-7xl w-full gap-4">
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border-border">
                        <span className="text-heading3Xl font-bold text-blue-600 tracking-tight">3</span>
                        <span className="text-bodyLg font-medium text-text-secondary whitespace-nowrap">
                            Clinical Datasets
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border-border">
                        <span className="text-heading3Xl font-bold text-blue-600 tracking-tight">60</span>
                        <span className="text-bodyLg font-medium text-text-secondary whitespace-nowrap">
                            Clinical Samples
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border-border">
                        <span className="text-heading3Xl font-bold text-cyan-700 tracking-tight">7</span>
                        <span className="text-bodyLg font-medium text-text-secondary whitespace-nowrap">
                            Pre Clinical Datasets
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5  bg-white rounded-full shadow-lg border-border">
                        <span className="text-heading3Xl font-bold text-cyan-700 tracking-tight">200</span>
                        <span className="text-bodyLg font-medium text-text-secondary whitespace-nowrap">
                            Pre Clinical Samples
                        </span>
                    </div>
                    <div className="flex flex-row items-center justify-center gap-3 py-1.5 px-5 bg-white rounded-full shadow-lg border-border">
                        <span className="text-heading3Xl font-bold text-green-600 tracking-tight">8</span>
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
