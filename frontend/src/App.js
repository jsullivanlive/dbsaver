import React, { Component } from "react";
// import logo from "./logo.svg";
import "./App.css";
import Nav from "./Nav";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async componentDidMount() {
    this.setState({ loading: true });
    this.setState({ authNeeded: false });
    await fetch("/api/settings", { redirect: "follow" })
      .then(async res => {
        if (res.status === 401) {
          this.setState({ authNeeded: true });
        } else {
          this.setState({ settings: await res.json() });
        }
      })
      .catch(e => {
        alert("problem getting settings");
      });
    this.setState({ loading: false });
  }
  render() {
    if (this.state.loading !== false) {
      return <div>loading...</div>;
    }
    if (!this.state.settings)
      return (
        <div>
          <a href="/auth">please login</a>
        </div>
      );
    return (
      <div className="App container">
        <Nav />
        <header className="App-header">
          <p>settings: {JSON.stringify(this.state.settings)}</p>
        </header>
      </div>
    );
  }
}

export default App;
