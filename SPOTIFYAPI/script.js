const clientId = 'YOUR_TOKEN';
const clientSecret = 'YOUR_TOKEN';

async function getAccessToken() {
    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });
        const result = await response.json();
        console.log("Access Token:", result.access_token);
        return result.access_token;
    } catch (error) {
        console.error("Error saat mendapatkan token:", error);
        throw error;
    }
}

async function searchTrack(query) {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&market=ID&limit=10`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const result = await response.json();
    console.log("Track Search Result:", result);
    return result.tracks.items.filter(track => track.name.toLowerCase().includes(query.toLowerCase()));
}

async function searchArtist(query) {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&market=ID&limit=10`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const result = await response.json();
    console.log("Artist Search Result:", result);
    return result.artists.items.filter(artist => artist.name.toLowerCase().includes(query.toLowerCase()));
}

async function searchAlbum(query) {
    const accessToken = await getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=album&market=ID&limit=10`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const result = await response.json();
    console.log("Album Search Result:", result);
    return result.albums.items.filter(album => album.name.toLowerCase().includes(query.toLowerCase()));
}

function displayResults(items, type) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (!items || items.length === 0) {
        resultsDiv.innerHTML = '<p class="error">Tidak ada hasil ditemukan.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'result-item';

        let imageUrl = 'https://via.placeholder.com/100';
        if (type === 'track' && item.album.images.length > 0) {
            imageUrl = item.album.images[0].url;
        } else if ((type === 'artist' || type === 'album') && item.images.length > 0) {
            imageUrl = item.images[0].url;
        }

        card.innerHTML = `
            <img src="${imageUrl}" alt="${item.name}">
            <div>
                <h2>${item.name}</h2>
                <a href="${item.external_urls.spotify}" target="_blank">Lihat di Spotify</a>
            </div>
        `;

        resultsDiv.appendChild(card);
    });
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('searchButton').addEventListener('click', async () => {
        const query = document.getElementById('searchInput').value.trim();
        const type = document.getElementById('searchType').value;
        const messageDiv = document.getElementById('message');

        if (!query) {
            messageDiv.innerHTML = '<p class="error">Masukkan kata kunci pencarian.</p>';
            return;
        }

        messageDiv.innerHTML = '<p class="loading">Memuat data...</p>';

        try {
            let results = [];
            if (type === 'track') {
                results = await searchTrack(query);
            } else if (type === 'artist') {
                results = await searchArtist(query);
            } else if (type === 'album') {
                results = await searchAlbum(query);
            }

            console.log("Final Filtered Results:", results);
            messageDiv.innerHTML = '';
            displayResults(results, type);
        } catch (error) {
            console.error("Error saat mencari:", error);
            messageDiv.innerHTML = '<p class="error">Terjadi kesalahan saat mengambil data.</p>';
        }
    });
});
