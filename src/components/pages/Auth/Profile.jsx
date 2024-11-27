import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import Logout from './Logout';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [topScores, setTopScores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser(decoded);

                // Récupérer les meilleurs scores
                const fetchTopScores = async () => {
                    try {
                        const response = await axios.get('http://localhost:5000/top-scores', {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        setTopScores(response.data);
                        setIsLoading(false);
                    } catch (error) {
                        console.error('Erreur lors de la récupération des scores', error);
                        setIsLoading(false);
                    }
                };

                fetchTopScores();
            } catch (error) {
                console.error('Erreur de décodage du token', error);
            }
        }
    }, []);

    if (!user) {
        return <p>Vous n'êtes pas connecté. Veuillez vous connecter.</p>;
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-4">Profil</h2>
            <p className="mb-2">Email: {user.email}</p>
            <Logout />

            <div className="mt-6">
                <h3 className="text-xl font-semibold mb-4">Vos 3 meilleurs scores</h3>
                {isLoading ? (
                    <p>Chargement des scores...</p>
                ) : topScores.length === 0 ? (
                    <p>Aucun score enregistré</p>
                ) : (
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="border p-2">Classement</th>
                                <th className="border p-2">Mots par minute</th>
                                <th className="border p-2">Précision</th>
                                <th className="border p-2">Erreurs moyennes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topScores.map((score, index) => (
                                <tr key={score.id} className={index % 2 === 0 ? 'bg-gray-100' : ''}>
                                    <td className="border p-2 text-center">{index + 1}</td>
                                    <td className="border p-2 text-center">{score.words_per_minute.toFixed(2)}</td>
                                    <td className="border p-2 text-center">{score.accuracy.toFixed(2)}%</td>
                                    <td className="border p-2 text-center">{score.average_errors}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Profile;