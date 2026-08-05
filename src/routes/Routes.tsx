import { Route, Routes } from 'react-router';
import Home from '../pages/Home';
import Analysis from '../pages/Analysis';
import Visualizations from '../pages/Visualizations';
import Datasets from '../pages/Datasets';
import About from '../pages/About';

const ProjectRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/visualizations" element={<Visualizations />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/datasets" element={<Datasets />} />
            <Route path="/about" element={<About />} />
        </Routes>
    );
};

export default ProjectRoutes;
