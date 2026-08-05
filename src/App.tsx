import { BrowserRouter } from 'react-router';
import Navbar from './components/Navbar';
import ProjectRoutes from './routes/Routes';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function App() {
    return (
        <BrowserRouter>
            <Navbar />
            <ProjectRoutes />
        </BrowserRouter>
    );
}

export default App;
