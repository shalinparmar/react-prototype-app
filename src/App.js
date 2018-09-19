import React, { Component } from 'react';
import './App.css';

let fakeServerData = {
  user: {
    name: 'Shalin',
    playlists: [
      {
        name: 'Prabhatiya',
        songs: [{ name: 'Dhyan Dhar', duration: 800}, {name: 'Jago Mohan Pyara', duration: 680}, {name: 'Prit Kar', duration: 760}]
      },
      {
        name: 'Sandhya Aarti',
        songs: [{name: 'Jai Sadguru Swami', duration: 300}, {name: 'Ram Krishna Govind', duration: 220}, {name: 'Anant Kotindu', duration: 310}, {name: 'Nirvikalp Uttam Ati', duration: 175}, {name: 'Krupa Karo', duration: 320}]
      },
      {
        name: 'Thal',
        songs: [{name: 'Jamone Jamadu Re', duration: 380}, {name: 'Mare Gher Aavjo Chogladhari', duration: 155}, {name: 'Avinashi Avo Re', duration: 1600}]
      },
      {
        name: 'Chesta',
        songs: [{name: 'Pratham Shr Hari Ne', duration: 1000}, {name: 'Ora Avo Shyam Snehi', duration: 1820}, {name: 'Podho Podho Sahjanand Swami', duration: 290}, {name: 'Mitha Vhala Kem Visaru', duration: 245}, {name: 'Akshar Na Vasi Vhalo', duration: 460}]
      }
    ]
  }
}

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
    return (
      <div style={{display: 'inline-block', width: '40%'}}>
        <h2>{Math.floor(totalDuration/3600)} hours</h2>
      </div>
    )
  }
}

class Filter extends Component {
  render() {
    return (
      <div>
        <img />
        <input type="text" />
      </div>
    );
  }
}

class Playlist extends Component {
  render() {
    let playlist = this.props.playlist;
    return (
      <div style={{width: '25%', display: 'inline-block'}}>
        <img />
        <h3>{playlist.name}</h3>
        <ul>
          {playlist.songs.map(song => <li>{song.name}</li>)}
        </ul>
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {serverData: {}}
  }
  componentDidMount() {
    setTimeout(() =>
      this.setState({
        serverData: fakeServerData
      }), 5000);
  }

  render() {
    return (
      <div className="App">
        {this.state.serverData.user ?
        <div>
          <h1>
              {this.state.serverData.user.name}'s Playlist
          </h1>
          <PlaylistCounter playlists={this.state.serverData.user.playlists} />
          <HoursCounter playlists={this.state.serverData.user.playlists} />
          <Filter />
          {this.state.serverData.user.playlists.map(playlist => <Playlist playlist={playlist} />)}
        </div> : <h1>Loading.....</h1>}
      </div>
    )
  }
}

export default App;
