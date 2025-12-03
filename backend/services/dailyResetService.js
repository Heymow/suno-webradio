const User = require("../models/users");

// Fonction pour réinitialiser les likes de tous les utilisateurs
const resetDailyLikes = async () => {
  try {
    await User.updateMany({}, { $set: { likesRemainingToday: 10 } });
    console.log("Daily likes reset completed successfully");
  } catch (error) {
    console.error("Error resetting daily likes:", error);
  }
};

// Fonction pour calculer le temps jusqu'à minuit
const getTimeUntilMidnight = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
};

// Planifier la réinitialisation quotidienne à minuit
const scheduleDailyReset = () => {
  const resetAndSchedule = () => {
    resetDailyLikes();
    // Planifier le prochain reset
    setTimeout(resetAndSchedule, getTimeUntilMidnight());
  };

  // Démarrer le premier reset
  setTimeout(resetAndSchedule, getTimeUntilMidnight());
};

module.exports = { resetDailyLikes, scheduleDailyReset };
