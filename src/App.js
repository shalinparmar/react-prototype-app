import React, { Component } from 'react';
import queryString from 'query-string';
import './App.css';

class PlaylistCounter extends Component {
  render() {
    return (
      <div style={{display: 'inline-block', width: '40%'}}>
        <h2>{this.props.playlists.length} playlists</h2>
      </div>
    )
  }
}

class HoursCounter extends Component {
  render() {
    let allSongs = this.props.playlists.reduce((songs, eachPlaylist) => songs.concat(eachPlaylist.songs), []);
    let totalDuration = allSongs.reduce((sum, eachSong) => sum += eachSong.duration, 0)
    let hours = Math.floor(totalDuration/3600);

    return (
      <div style={{display: 'inline-block', width: '40%'}}>
        <h2>{hours} hours, {Math.floor(totalDuration/60 - (hours*60)) + ' minutes'}</h2>
      </div>
    )
  }
}

class Filter extends Component {
  render() {
    return (
      <div>
        <img />
        <input type="text" onKeyUp={event => 
          this.props.onTextChange(event.target.value)} />
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist;
    return (
      <div style={{width: '25%', display: 'inline-block'}}>
        <img src={playlist.imageUrl} style={{width: '60px'}} />
        <h3>{playlist.name}</h3>
        <ul>
          {playlist.songs.map(song => 
            <li>{song.name}</li>)}
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: {},
      playlists: [],
      filterString: ''
    }
  }
  componentDidMount() {
    let parsed = queryString.parse(window.location.search);
    let accessToken = parsed.access_token;

    if (!accessToken)
      return;
      

    fetch('https://api.spotify.com/v1/me', { headers: { 'Authorization': 'Bearer ' + accessToken } })
      .then(response => response.json())
      .then(data => this.setState({ user: { name: data.display_name } }));

    fetch('https://api.spotify.com/v1/me/playlists', { headers: { 'Authorization': 'Bearer ' + accessToken } })
      .then(response => response.json())
      .then(playlistData => {
        let playlists = playlistData.items;

        let trackDataPromises = playlists.map(playlist => {
          let responsePromise = fetch(playlist.tracks.href, {
             headers: { 'Authorization': 'Bearer ' + accessToken } 
          });

          let trackDataPromise = responsePromise.then(response => response.json());
          return trackDataPromise;
        });

        let allTracksDatasPromises = Promise.all(trackDataPromises);
        let playlistsPromise = allTracksDatasPromises.then(trackDatas => {
          trackDatas.forEach((trackData, i) => {
            playlists[i].trackDatas = trackData.items
            .map(item => item.track)
            .map(track => ({
              name: track.name,
              duration: track.duration_ms / 1000
            }))
          });
          return playlists;
        });

        return playlistsPromise;
      })
      .then(playlists => this.setState({ playlists: playlists.map(item => ({
          name: item.name,
          imageUrl: item.images[0].url,
          songs: item.trackDatas.slice(0, 3)
        }))
      }));
  }

  render() {
    let playlistsToRender = this.state.user && this.state.playlists
      ? this.state.playlists.filter(
            playlist => playlist.name.toLowerCase().includes(this.state.filterString.toLowerCase())) 
      : [];
      
    return (
      <div className="App">
        {this.state.user && this.state.user.name
        ?<div>
          <h1>
              {this.state.user.name}'s Playlist
          </h1>
          <PlaylistCounter playlists={playlistsToRender} />
          <HoursCounter playlists={playlistsToRender} />
          <Filter onTextChange={text => this.setState({filterString: text})} />
          {playlistsToRender.map(playlist => 
            <Playlist playlist={playlist} />)}
          </div> 
        : <button onClick={() => window.location = 'http://localhost:8888/login'} 
              style={{padding: '20px', fontSize: '50px', marginTop: '20px'}}>Sign In with Spotify</button>}
      </div>
    )
  }
}

export default App;
