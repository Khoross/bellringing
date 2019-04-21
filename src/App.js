import React, { Component } from 'react';
import {webSocket} from 'rxjs/webSocket';
import {SerialConfig} from './components'
import logo from './logo.svg';
import './App.css';

const ws$ = webSocket('ws://localhost:8765')
ws$.subscribe((msg)=>console.log(msg), (err)=>console.log("ERROR"), ()=>console.log("HALTED"))
window.ws$ = ws$


class App extends Component {
  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <SerialConfig ws$={ws$} dev='COM3' sig='cd'/>
        </header>
      </div>
    );
  }
}

export default App;
