import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";
import Nav from "./Nav";
import Settings from "./components/Settings";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="App container">
        <Nav />
        <Settings />
      </div>
    );
  }
}

export default App;
