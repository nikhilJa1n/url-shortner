import React from 'react';
import logo from './logo.png';
import './App.css';
import UrlShortnerForm from './components/urlShortnerForm'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <UrlShortnerForm />
      </header>
    </div>
  );
}

export default App;
