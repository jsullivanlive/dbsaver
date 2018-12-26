import React, { Component } from "react";
import Switch from "./Switch";
class Settings extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  async componentDidMount() {
    this.setState({ loading: true });
    // this.setState({ authNeeded: false });
    await fetch("/api/settings")
      .then(async res => {
        if (res.status !== 200) {
          alert("problem getting settings: " + res.body);
        } else {
          this.setState(await res.json());
        }
      })
      .catch(e => {
        alert("problem getting settings");
      });
    this.setState({ loading: false });
  }
  save() {
    fetch("/api/settings", {
      method: "post",
      body: JSON.stringify(this.state),
      headers: { "Content-Type": "application/json" }
    })
      .then(async res => {
        if (res.status !== 200) {
          alert("problem saving settings: " + res.body);
        } else {
          this.setState(await res.json());
        }
      })
      .catch(e => {
        alert("problem saving settings");
      });
  }
  render() {
    if (this.state.loading !== false) {
      return <div>loading...</div>;
    }
    return (
      <div className="App container">
        <header className="App-header">
          <p>settings:</p>
          <div>
            <Switch
              name="Daily Checkpoint"
              value={this.state.daily}
              onChange={val => this.setState({ daily: val })}
            />
            <Switch
              name="Daily Email"
              value={this.state.dailyEmail}
              onChange={val => this.setState({ dailyEmail: val })}
            />
          </div>
          <div>
            <button onClick={this.save.bind(this)}>Save</button>
          </div>
          <small>debug: {JSON.stringify(this.state)}</small>
        </header>
      </div>
    );
  }
}
export default Settings;
