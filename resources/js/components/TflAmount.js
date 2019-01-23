// resources/assets/js/components/TflAmount.js

import React, {Component} from 'react';

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
        <div className="amount-info"><b>TFL:</b> £{yearlyAmount.toFixed(2)} (£{perMonth.toFixed(2)}/m)</div>
        <div className="amount-info"><b>Commuter Club:</b> £{clubAmount.toFixed(2)} (£{clubPerMonth.toFixed(2)}/m)</div>
        <div className="amount-info"><b>Average Monzo Cost:</b> £{this.props.monzoMonthlyAverage}/m</div>
      </div>
    )
  }
}

export default TflAmount;
