import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Logout from './Logout';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [topScores, setTopScores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserDataAndScores = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    throw new Error('Token expiré');
                }

                setUser(decoded);

                const response = await axios.get('http://localhost:5000/top-scores', {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setTopScores(response.data);
            } catch (error) {
                console.error('Erreur:', error);
                localStorage.removeItem('token');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDataAndScores();
    }, [navigate]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
                        <h2 className="text-3xl font-bold text-white">
                            Profil de {user.username.charAt(0).toUpperCase() + user.username.slice(1)}
                        </h2>
                    </div>
                    <div className="p-6">
                        <Logout className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300" />

                        <div className="mt-8">
                            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Vos meilleurs scores</h3>
                            {topScores.length === 0 ? (
                                <p className="text-gray-600">Aucun score enregistré</p>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-200">
                                                <th className="p-3 font-semibold">Rang</th>
                                                <th className="p-3 font-semibold">Mots/min</th>
                                                <th className="p-3 font-semibold">Précision</th>
                                                <th className="p-3 font-semibold">Nombre d'erreurs</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {topScores.map((score, index) => (
                                                <tr key={score.id} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                                    <td className="p-3 font-medium">{index + 1}</td>
                                                    <td className="p-3">{score.words_per_minute.toFixed(2)}</td>
                                                    <td className="p-3">{score.accuracy.toFixed(2)}%</td>
                                                    <td className="p-3">{score.average_errors}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;