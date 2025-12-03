
const mongoose = require('mongoose');

const mongoURI = process.env.MONGO_URI; // Assurez-vous que la variable existe dans .env

if (!mongoURI) {
    console.error("❌ Erreur: MONGO_URI n'est pas défini dans le fichier .env");
    process.exit(1); // Stopper l'application si la connexion est impossible
}

if (process.env.NODE_ENV !== 'test') {
    mongoose.connect(mongoURI)
        .then(() => console.log('✅ Connecté à MongoDB'))
        .catch(err => {
            console.error('❌ Erreur de connexion MongoDB:', err);
            process.exit(1); // Stopper l'application en cas d'erreur critique
        });
}

module.exports = mongoose; // Exporter mongoose pour l'utiliser ailleurs
