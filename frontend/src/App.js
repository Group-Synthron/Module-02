import React from 'react';
import './App.css';
import RegisterVessel from './RegisterVessel'; // Import the component
import QueryVessel from './QueryVessel'; // Import the component
import RecordCatch from './RecordCatch'; // Import
import CatchManager from './CatchManager'; // Import

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Fish Supply Chain Traceability</h1>
      </header>
      <main>
        <RegisterVessel /> 
        <QueryVessel /> 
        <hr />
        <RecordCatch /> {/* Use the component */}
        <CatchManager /> {/* Use the component */}
      </main>
    </div>
  );
}

export default App;