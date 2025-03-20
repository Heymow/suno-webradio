const MAX_WIDTH = 300;
const MAX_HEIGHT = 300;
const COMPRESSION_QUALITY = 0.7;
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Utility functions
const validateMimeType = (file: File): boolean => {
    return ALLOWED_MIME_TYPES.indexOf(file.type) !== -1;
};

const calculateDimensions = (width: number, height: number) => {
    if (width > height && width > MAX_WIDTH) {
        height *= MAX_WIDTH / width;
        width = MAX_WIDTH;
    } else if (height > MAX_HEIGHT) {
        width *= MAX_HEIGHT / height;
        height = MAX_HEIGHT;
    }
    return { width, height };
};

const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
};

const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const { width, height } = calculateDimensions(img.width, img.height);

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => blob ?
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        })) :
                        reject(new Error('Échec de la conversion canvas vers blob')),
                    'image/jpeg',
                    COMPRESSION_QUALITY
                );
            };
        };
        reader.onerror = reject;
    });
};

// Exported function
export const processAvatar = async (file: File): Promise<string> => {
    try {
        if (!validateMimeType(file)) {
            throw new Error('Type de fichier non autorisé. Types acceptés : JPEG, PNG, GIF, WEBP');
        }
        const compressedFile = await compressImage(file);
        return await convertToBase64(compressedFile);
    } catch (error) {
        throw error instanceof Error ? error : new Error('Erreur lors du traitement de l\'avatar');
    }
}; 