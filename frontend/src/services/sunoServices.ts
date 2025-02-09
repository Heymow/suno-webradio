export const getSunoSong = async (sunoLink: string) => {

    try {
        const formattedLink = sunoLink.split('https://suno.com/song/')[1];
        const fetchSuno = await fetch(`http://localhost:3000/suno-api/get-suno-clip/${formattedLink}`)
        const response: { project: SunoSong } = await fetchSuno.json();
        return response.project;
    } catch (error) {
        console.error("Error while fetching sunoSong", error);
        return null;
    }
}