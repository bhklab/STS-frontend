'use client';
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';

const Navbar: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [y, setY] = useState(0);

    useEffect(() => {
        window.addEventListener('scroll', () => setY(window.scrollY));
        return () => window.removeEventListener('scroll', () => setY(window.scrollY));
    }, []);

    const navItems = [
        { label: 'Visualizations', path: '/visualizations' },
        { label: 'Analyses', path: '/analyses' },
        { label: 'Datasets', path: '/datasets' },
        { label: 'AI Assistant', path: '/ai-assistant' },
        { label: 'Help', path: '/help' },
        { label: 'About', path: '/about' }
    ];

    return (
        <div
            className={`sticky top-0 flex flex-row gap-4 items-center px-4 w-full bg-white py-1 z-20 ${
                y > 10 ? 'shadow-xl' : 'shadow-sm'
            }`}
        >
            <div className="flex flex-row gap-6">
                <img
                    src="/logos/sts_portal-logo-2.png"
                    alt="logo"
                    className="w-14 hover:cursor-pointer transition-transform duration-300 ease-out hover:-rotate-12"
                    onClick={() => navigate('/')}
                />

                <div className="flex flex-row gap-4 items-center">
                    {navItems.map(item => (
                        <button
                            key={item.path}
                            className="flex items-center justify-center my-auto hover:cursor-pointer group"
                            onClick={() => navigate(item.path)}
                        >
                            {/* Grid wrapper stacks visible text over invisible bold width placeholder */}
                            <span className="inline-grid place-items-center">
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
                            </span>
                        </button>
                    ))}
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
