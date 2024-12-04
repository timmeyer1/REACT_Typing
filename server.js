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

// Création des tables si elles n'existent pas déjà
const createUserTable = `
CREATE TABLE IF NOT EXISTS User (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
)`;
db.query(createUserTable, (err) => {
    if (err) throw err;
    console.log('Table User vérifiée/créée');
});

const createScoresTable = `
CREATE TABLE IF NOT EXISTS Scores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  words_per_minute FLOAT NOT NULL,
  accuracy FLOAT NOT NULL,
  average_errors INT NOT NULL,
  date_typed DATETIME NOT NULL,
  FOREIGN KEY (user_id) REFERENCES User(id) ON DELETE CASCADE
)`;
db.query(createScoresTable, (err) => {
    if (err) throw err;
    console.log('Table Scores vérifiée/créée');
});

// Middleware pour vérifier et décoder le token JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Non authentifié. Veuillez vous connecter.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: 'Session expirée. Veuillez vous reconnecter.' });
            }
            return res.status(403).json({ message: 'Token invalide.' });
        }

        req.user = user;
        next();
    });
};

// Inscription de l'utilisateur
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    db.query('SELECT * FROM User WHERE email = ?', [email], async (err, result) => {
        if (result.length > 0) {
            return res.status(400).json({ message: 'Email déjà utilisé.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        db.query('INSERT INTO User (username, email, password) VALUES (?, ?, ?)', [username, email, hashedPassword], (err) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de l\'inscription.' });
            }
            res.status(201).json({ message: 'Utilisateur créé avec succès.' });
        });
    });
});

// Connexion de l'utilisateur
app.post('/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM User WHERE email = ?', [email], async (err, result) => {
        if (result.length === 0) {
            return res.status(400).json({ message: 'Utilisateur non trouvé.' });
        }

        const user = result[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Mot de passe incorrect.' });
        }

        const token = jwt.sign(
            { username: user.username, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' } // Durée d'expiration du token
        );

        res.json({ message: 'Connexion réussie.', token });
    });
});

// Route protégée pour enregistrer les scores
app.post('/save-score', authenticateToken, (req, res) => {
    const { words_per_minute, accuracy, average_errors } = req.body;
    const email = req.user.email;
    const current_date = new Date(); // Obtenir la date et l'heure actuelles

    db.query('SELECT id FROM User WHERE email = ?', [email], (err, userResult) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur.' });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const userId = userResult[0].id;

        db.query(
            'INSERT INTO Scores (user_id, words_per_minute, accuracy, average_errors, date_typed) VALUES (?, ?, ?, ?, ?)',
            [userId, words_per_minute, accuracy, average_errors, current_date],
            (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Erreur lors de l\'enregistrement du score.' });
                }
                res.status(201).json({ message: 'Score enregistré avec succès.' });
            }
        );
    });
});

// Route protégée pour récupérer les meilleurs scores
app.get('/top-scores', authenticateToken, (req, res) => {
    const email = req.user.email;

    db.query('SELECT id FROM User WHERE email = ?', [email], (err, userResult) => {
        if (err) {
            return res.status(500).json({ message: 'Erreur lors de la récupération de l\'utilisateur.' });
        }

        if (userResult.length === 0) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const userId = userResult[0].id;

        db.query(`
            SELECT 
                id,
                words_per_minute, 
                accuracy, 
                average_errors,
                date_typed,
                (
                    (words_per_minute * 0.5) +  # Mots par minute (50%)
                    (accuracy * 100 * 0.3) +    # Précision (30%)
                    ((100 - (average_errors * 10)) * 0.2)  # Erreurs (20%) - inversé
                ) as combined_score
            FROM Scores 
            WHERE user_id = ?
            ORDER BY 
                words_per_minute DESC,  # D'abord par vitesse (wps)
                accuracy DESC,          # Ensuite par précision (%)
                average_errors ASC      # Enfin par erreurs (moins = mieux)
            LIMIT 10
        `, [userId], (err, scores) => {
            if (err) {
                return res.status(500).json({ message: 'Erreur lors de la récupération des scores.' });
            }
            res.json(scores);
        });
    });
});


// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});