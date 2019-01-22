// resources/assets/js/components/Loader.js

import React, {Component} from 'react';
import { Link } from 'react-router-dom'

class Loader extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    const percentage = this.props.daysPercentage;
    const loadingIsComplete = this.props.loadingIsComplete;
    const style = {
        width: percentage + '%',
        display: loadingIsComplete ? 'none' : 'block',
    };
    return (
      <div className="progress">
        <div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow={percentage} aria-valuemin="0" aria-valuemax="100" style={style}></div>
      </div>
    )
  }
}

export default Loader




