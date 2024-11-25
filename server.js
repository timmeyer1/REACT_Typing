// backend/server.js
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors()); // Permettre les requêtes du front-end React

// Configuration de la connexion MariaDB
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: 'admin', 
    database: 'typing_test',
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion à la base de données:', err);
    } else {
        console.log('Connexion à MariaDB réussie');
    }
});

// Créez la base de données et la table des utilisateurs
const createUserTable = `CREATE TABLE IF NOT EXISTS User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
)`;

db.query(createUserTable, (err, result) => {
    if (err) throw err;
    console.log('Table User créée');
});

// Inscription de l'utilisateur
app.post('/register', async (req, res) => {
    const { email, password } = req.body;

    // Vérifiez si l'utilisateur existe déjà
    db.query('SELECT * FROM User WHERE email = ?', [email], async (err, result) => {
        if (result.length > 0) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertion de l'utilisateur dans la base de données
        db.query('INSERT INTO User (email, password) VALUES (?, ?)', [email, hashedPassword], (err, result) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur d\'inscription' });
            }
            res.status(201).json({ message: 'Utilisateur créé' });
        });
    });
});

// Connexion de l'utilisateur
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Vérifiez si l'utilisateur existe
    db.query('SELECT * FROM User WHERE email = ?', [email], async (err, result) => {
        if (result.length === 0) {
            return res.status(400).json({ message: 'Utilisateur non trouvé' });
        }

        const user = result[0];

        // Vérifiez le mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect' });
        }

        // Créez un token JWT
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ message: 'Connexion réussie', token });
    });
});

// Démarrer le serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
