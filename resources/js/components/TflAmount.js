// resources/assets/js/components/TflAmount.js

import React, {Component} from 'react';

/**
 * The total/monthly prices of card/tfl/commuterclub
 */
class TflAmount extends Component {

  constructor(props) {
    super(props)
  }

  render() {
    const yearlyAmount = this.props.yearlyAmount;
    const fullTotal = this.props.fullTotal * -1 / 100;
    const perMonth = yearlyAmount / 12;
    const clubAmount = this.props.clubAmount;
    const clubPerMonth = clubAmount / 12;

    return (
      <div>
        <div className="amount-info"><b>Card Spend:</b> £{fullTotal.toFixed(2)} (£{this.props.monthlyAverage}/m)</div>
        <div className="amount-info"><b>Travel Card:</b> £{yearlyAmount.toFixed(2)} (£{perMonth.toFixed(2)}/m)</div>
        <div className="amount-info"><b>Commuter Club:</b> £{clubAmount.toFixed(2)} (£{clubPerMonth.toFixed(2)}/m)</div>
      </div>
    )
  }
}

export default TflAmount;
