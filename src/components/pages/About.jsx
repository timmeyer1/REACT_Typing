import React from 'react';

const About = () => {
    React.useEffect(() => {
        document.title = 'A propos';
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 font-sans">
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-extrabold text-indigo-600 mb-4">À propos de nous</h1>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            Typing Speed Test est une application web qui permet aux utilisateurs de mesurer leur vitesse de frappe facilement en mettant en place un test de dactylographie gratuit et efficace.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center transition-transform duration-300 hover:-translate-y-2">
                            <div className="text-4xl font-bold text-indigo-600 mb-2">1M+</div>
                            <div className="text-lg font-semibold text-gray-700">Utilisateurs</div>
                            <div className="text-sm text-gray-500 mt-2">Dernière mise à jour : Juin 2023</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center transition-transform duration-300 hover:-translate-y-2">
                            <div className="text-4xl font-bold text-indigo-600 mb-2">50M+</div>
                            <div className="text-lg font-semibold text-gray-700">Tests effectués</div>
                            <div className="text-sm text-gray-500 mt-2">Dernière mise à jour : Juin 2023</div>
                        </div>
                        <div className="bg-white rounded-xl shadow-lg p-8 text-center transition-transform duration-300 hover:-translate-y-2">
                            <div className="text-4xl font-bold text-indigo-600 mb-2">60+</div>
                            <div className="text-lg font-semibold text-gray-700">Anecdotes</div>
                            <div className="text-sm text-gray-500 mt-2">Dernière mise à jour : Juin 2023</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default About;