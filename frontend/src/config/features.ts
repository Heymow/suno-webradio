interface FeatureFlags {
    ANALYZE: boolean;
    WATCHED_SONGS: boolean;
    SETTINGS: boolean;
    ABOUT: boolean;
    // Add other feature flags here
}

// In development, you can change these values to true
// In production, make sure to set them to false for features you want to hide
export const FEATURES: FeatureFlags = {
    ANALYZE: false,
    WATCHED_SONGS: false,
    SETTINGS: false,
    ABOUT: false,
    // Add other feature flags here
};

// Utility function to check if a feature is enabled
export const isFeatureEnabled = (featureName: keyof FeatureFlags): boolean => {
    return FEATURES[featureName];
}; 