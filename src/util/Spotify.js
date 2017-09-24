const clientId = 'fe5de2e75fc149088e0f4407a11c1b28';
const redirectURI = 'http://localhost:3000/';
let accessToken = '';

const Spotify = {
  getAccessToken() {
    if (accessToken) {
      return accessToken;
    }
    let url = window.location.href;
    console.log(url);
    let access_Token = url.match(/access_token=([^&]*)/);
    let expiration_Time = url.match(/expires_in=([^&]*)/);
    if (access_Token !== null && expiration_Time !== null) {
      accessToken = access_Token[1];
      window.setTimeout(() => accessToken = '', Number(expiration_Time[1]) * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else if (accessToken === '' && access_Token === null) {
      window.location = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectURI}`;
    }
  },

  search(term) {
    console.log(term);
    let access_Token = Spotify.getAccessToken();
    console.log(access_Token);
    fetch(`https://api.spotify.com/v1/search?type=track&q=${term}`, {headers: {Authorization: `Bearer ${access_Token}`}}
    ).then(response => {
      console.log(response);
      if (response.ok) {
        return response.json();
      }
      throw new Error('Request failed!');
    }, networkError => console.log(networkError.message)
    ).then(jsonResponse => {
      console.log(jsonResponse);
      if (!jsonResponse.tracks) {
        return [];
      }
      return jsonResponse.tracks.items.map(track => ({
        id: track.id,
        name: track.name,
        length: track.duration_ms,
        image: track.album.images[2],
        artist: track.artists[0].name,
        album: track.album.name,
        uri: track.uri
      }));
    });
  },

  savePlaylist(name, uris) {
    if (name === '' || uris === []) {
      return;
    }
    let access_Token = accessToken;
    let headers = {Authorization: 'Bearer ' + access_Token};
    let userId = '';
    fetch('https://api.spotify.com/v1/me', {headers: headers}).then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Request failed!');
    }, networkError => console.log(networkError.message)
    ).then(jsonResponse => {
      userId = jsonResponse.id;
      fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({name: name})
      }).then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Request failed!');
      }, networkError => console.log(networkError.message)
      ).then(jsonResponse => {
        let playlistId = jsonResponse.id;
        fetch(`https://api.spotify.com/v1/users/${userId}/playlists/${playlistId}/tracks`, {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({uris: uris})
        }).then(response => {
          if (response.ok) {
            return response.json();
          }
          throw new Error('Request failed!');
        }, networkError => console.log(networkError.message)
        ).then(jsonResponse => {

        });
      });
    });
  }
};

export default Spotify;
