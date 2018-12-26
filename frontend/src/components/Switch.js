import React, { Component } from "react";
import PropTypes from "prop-types";

class Switch extends Component {
  constructor(props) {
    super(props);
    this.state = { value: props.value === true };
  }
  render() {
    return (
      <div class="custom-control custom-switch">
        <input
          type="checkbox"
          class="custom-control-input"
          id={this.props.name}
          onChange={event => {
            this.setState({ value: event.target.checked });
            this.props.onChange(event.target.checked);
          }}
          checked={this.state.value}
        />
        <label class="custom-control-label" for={this.props.name}>
          {this.props.name}
        </label>
      </div>
    );
  }
}

Switch.propTypes = {
  name: PropTypes.string,
  onChange: PropTypes.func
};

export default Switch;
