'use client';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Tooltip, type TooltipPassThroughOptions } from 'primereact/tooltip';

const tooltipPt: TooltipPassThroughOptions = {
    arrow: {
        style: {
            borderBottomColor: 'rgba(31, 41, 55, 0.92)'
        }
    },
    text: {
        style: {
            background: 'rgba(31, 41, 55, 0.92)',
            color: '#fff',
            padding: '6px 10px',
            borderRadius: '6px',
            fontSize: '12px',
            lineHeight: '1.4',
            whiteSpace: 'nowrap',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)'
        }
    }
};

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [y, setY] = useState(0);

    useEffect(() => {
        window.addEventListener('scroll', () => setY(window.scrollY));
        return () => window.removeEventListener('scroll', () => setY(window.scrollY));
    }, []);

    const navItems = [
        { label: 'Visualizations', path: '/visualizations', comingSoon: false, id: 'visualizations' },
        { label: 'Analyses', path: '/analyses', comingSoon: true, id: 'analyses' },
        { label: 'Datasets', path: '/datasets', comingSoon: false, id: 'datasets' },
        { label: 'AI Assistant', path: '/ai-assistant', comingSoon: true, id: 'ai-assistant' },
        { label: 'Docs', path: '/docs', comingSoon: false, id: 'docs' }
    ];

    return (
        <div
            className={`sticky top-0 flex flex-row gap-4 items-center px-4 w-full bg-white py-1 z-20 ${
                y > 10 ? 'shadow-xl' : 'shadow-sm'
            }`}
        >
            <Tooltip target=".analyses" position="right" content="Coming Soon!" pt={tooltipPt} mouseTrack={false} />
            <Tooltip target=".ai-assistant" position="right" content="Coming Soon!" pt={tooltipPt} mouseTrack={false} />
            <div className="flex flex-row gap-6">
                <img
                    src="/logos/sts_portal-logo-2.png"
                    alt="logo"
                    className="w-14 hover:cursor-pointer transition-transform duration-300 ease-out hover:-rotate-12"
                    onClick={() => navigate('/')}
                />

                <div className="flex flex-row gap-4 items-center">
                    {navItems.map(item =>
                        item.comingSoon ? (
                            <button
                                key={item.path}
                                className={`items-center justify-center my-auto hover:cursor-not-allowed group inline-grid place-items-center ${item.id}`}
                            >
                                <span
                                    className="col-start-1 row-start-1 text-headingSm font-medium invisible select-none"
                                    aria-hidden="true"
                                >
                                    {item.label}
                                </span>
                                <span
                                    className={`col-start-1 row-start-1 text-headingSm text-text-secondary/50 group-hover:text-text-secondary/50 group-hover:font-medium font-light`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        ) : (
                            <button
                                key={item.path}
                                className="items-center justify-center my-auto hover:cursor-pointer group inline-grid place-items-center"
                                onClick={() => navigate(item.path)}
                            >
                                {/* Grid wrapper stacks visible text over invisible bold width placeholder */}
                                <span
                                    className="col-start-1 row-start-1 text-headingSm font-medium invisible select-none"
                                    aria-hidden="true"
                                >
                                    {item.label}
                                </span>
                                <span
                                    className={`col-start-1 row-start-1 text-headingSm group-hover:text-primary group-hover:font-medium ${
                                        location.pathname === item.path
                                            ? 'text-primary font-medium'
                                            : 'text-text-secondary font-light'
                                    }`}
                                >
                                    {item.label}
                                </span>
                            </button>
                        )
                    )}
                </div>
            </div>
            <button
                className="ml-auto flex items-center justify-center my-auto hover:cursor-pointer group absolute right-6"
                onClick={() => navigate('/login')}
            >
                <div
                    className={`w-5 h-5 transition-colors group-hover:bg-primary [mask-image:url(/icons/navbar/account.svg)] [mask-size:contain] [mask-repeat:no-repeat] [mask-position:center] ${
                        location.pathname === '/login' ? 'bg-primary' : 'bg-gray-400'
                    }`}
                />
            </button>
        </div>
    );
};

export default Navbar;
