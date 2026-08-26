import { BrowserRouter } from 'react-router';
import { PrimeReactProvider } from 'primereact/api';
import Navbar from './components/Navbar';
import ProjectRoutes from './routes/Routes';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

function App() {
    return (
        <PrimeReactProvider>
            <BrowserRouter>
                <Navbar />
                <ProjectRoutes />
            </BrowserRouter>
        </PrimeReactProvider>
    );
}

export default App;
