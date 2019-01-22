// resources/assets/js/components/TflAmount.js

import React, {Component} from 'react';
import moment from 'moment';

class TflAmount extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const yearlyAmount = this.props.yearlyAmount;
    const perMonth = yearlyAmount / 12;
    const clubAmount = this.props.clubAmount;
    const clubPerMonth = clubAmount / 12;
    return (
      <div>
        <div className="amount-info"><b>TFL Price:</b> £{yearlyAmount.toFixed(2)} (£{perMonth.toFixed(2)}/month)</div>
        <div className="amount-info"><b>Commuter Club Price:</b> £{clubAmount.toFixed(2)} (£{clubPerMonth.toFixed(2)}/month)</div>
      </div>
    )
  }
}

export default TflAmount;
