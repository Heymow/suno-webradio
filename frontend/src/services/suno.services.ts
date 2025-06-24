import Axios from '../utils/Axios';

export const getSunoSong = async (sunoLink: string) => {
    try {
        const formattedLink = sunoLink.split('https://suno.com/song/')[1];
        const response = await Axios.get(`/suno-api/get-suno-clip/${formattedLink}`);
        return response.data.project;
    } catch (error) {
        console.error("Error while fetching sunoSong", error);
        return null;
    }
}

export const submitSunoLink = async (sunoLink: string) => {
    try {
        const response = await Axios.post('/suno-api/submit-link', { sunoLink });
        return response.data;
    } catch (error: any) {
        console.error("Error while submitting sunoLink:", error.response?.data || error);
        throw error;
    }
}

export const getSunoTrendingSongs = async (list: string, timeSpan: string) => {
    try {
        const response = await Axios.get(`/suno-api/trending/${list}/${timeSpan}`);
        return response.data;
    } catch (error) {
        console.error("Error while fetching trending songs:", error);
        return null;
    }
}


