import React, { Component } from 'react';
import queryString from 'query-string';
import 'reset-css/reset.css';
import './App.css';

let defaultStyle = {
  'font-family': 'Papyrus Regular'
}

let counterStyle = {
  ...defaultStyle, 
        display: 'inline-block', 
        width: '40%',
        'margin-bottom': '20px',
        'font-size': '20px',
        'line-height': '30px'
}

class PlaylistCounter extends Component {
  render() {
    let playlistCounterStyle = counterStyle;
    return (
      <div style={playlistCounterStyle}>
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

    let isTooLow = hours < 1;

    let hoursCounterStyle = {
      ...counterStyle,
      color: isTooLow ? 'red' : 'black',
      fontWeight: isTooLow? 'bold' : 'normal'
    }

    return (
      <div style={hoursCounterStyle}>
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
        <input type="text" style={{ ...defaultStyle, padding: '10px', fontSize: '20px'}} onKeyUp={event => 
          this.props.onTextChange(event.target.value)} />
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist;
    return (
      <div style={{...defaultStyle, 
        width: '24%', 
        padding: '10px',
        marginTop: '10px',
        marginRight: '10px',
        display: 'inline-block',
        backgroundColor: this.props.index % 2 ? '#C0C0C0' : '#808080'}}>
        <img src={playlist.imageUrl} style={{width: '60px'}} />
        <h3 style={{fontWeight: 'bold'}}>{playlist.name}</h3>
        <ul style={{marginTop: '10px'}}>
          {playlist.songs.map(song => 
            <li style={{paddingTop: '2px'}}>{song.name}</li>)}
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      user: null,
      playlists: null,
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
      ? this.state.playlists.filter(playlist => {
          let matchesPlaylist = playlist.name.toLowerCase().includes(this.state.filterString.toLowerCase());
          let matchesSong = playlist.songs.find(song => song.name.toLowerCase().includes(this.state.filterString.toLowerCase()));
          return matchesPlaylist || matchesSong;
        })
      : [];
      
    return (
      <div className="App">
        {this.state.user
        ?<div>
          <h1 style={{...defaultStyle,
            fontSize: '50px',
            marginTop: '5px'}}>
              {this.state.user.name}'s Playlist
          </h1>
          <PlaylistCounter playlists={playlistsToRender} />
          <HoursCounter playlists={playlistsToRender} />
          <Filter onTextChange={text => this.setState({filterString: text})} />
          {playlistsToRender.map((playlist, i) => 
            <Playlist playlist={playlist} index={i} />)}
          </div> 
        : <button onClick={() => window.location = 'http://localhost:8888/login'} 
              style={{padding: '20px', fontSize: '50px', marginTop: '20px'}}>Sign In with Spotify</button>}
      </div>
    )
  }
}

export default App;
