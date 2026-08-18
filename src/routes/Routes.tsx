import { Route, Routes } from 'react-router';
import Home from '../pages/Home';
import Analyses from '../pages/Analyses';
import Visualizations from '../pages/Visualizations';
import Datasets from '../pages/Datasets';
import About from '../pages/About';
import Assistant from '../pages/Assistant';
import Help from '../pages/Help';

const ProjectRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/visualizations" element={<Visualizations />} />
            <Route path="/analyses" element={<Analyses />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/ai-assistant" element={<Assistant />} />
            <Route path="/help" element={<Help />} />
            <Route path="/about" element={<About />} />
        </Routes>
    );
};

export default ProjectRoutes;
