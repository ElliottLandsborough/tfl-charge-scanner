import React, {Component} from 'react';
import moment from 'moment';

class TflAmount extends Component {

  constructor(props) {
    super(props)
  }

  getTflAmounts() {
    // http://content.tfl.gov.uk/adult-fares-2019.pdf
    const amounts = [
      ['1-1', 35.10, 134.80, 1404],
      ['1-2', 35.10, 134.80, 1404],
      ['1-3', 41.20, 158.30, 1648],
      ['1-4', 50.50, 194.00, 2020],
      ['1-5', 60.00, 230.40, 2400],
      ['1-6', 64.20, 246.60, 2568],
      ['1-7', 69.80, 268.10, 2792],
      ['1-8', 82.50, 316.80, 3300],
      ['1-9', 91.50, 351.40, 3660],
      ['2-2', 26.30, 101.00, 1052],
      ['2-3', 26.30, 101.00, 1052],
      ['2-4', 29.10, 111.80, 1164],
      ['2-5', 34.90, 134.10, 1396],
      ['2-6', 43.90, 168.60, 1756],
      ['2-7', 45.60, 175.20, 1824],
      ['2-8', 62.00, 238.10, 2480],
      ['2-9', 62.00, 238.10, 2480],
      ['3-3', 26.30, 101.00, 1052],
      ['3-4', 26.30, 101.00, 1052],
      ['3-5', 29.10, 111.80, 1164],
      ['3-6', 34.90, 134.10, 1396],
      ['3-7', 45.60, 175.20, 1824],
      ['3-8', 62.00, 238.10, 2480],
      ['3-9', 62.00, 238.10, 2480],
      ['4-4', 26.30, 101.00, 1052],
      ['4-5', 26.30, 101.00, 1052],
      ['4-6', 29.10, 111.80, 1164],
      ['4-7', 33.00, 126.80, 1320],
      ['4-8', 55.50, 213.20, 2220],
      ['4-9', 55.50, 213.20, 2220],
      ['5-5', 26.30, 101.00, 1052],
      ['5-6', 26.30, 101.00, 1052],
      ['5-7', 33.00, 126.80, 1320],
      ['5-8', 55.50, 213.20, 2220],
      ['5-9', 55.50, 213.20, 2220],
      ['6-6', 26.30, 101.00, 1052],
      ['6-7', 33.00, 126.80, 1320],
      ['6-8', 55.50, 213.20, 2220],
      ['6-9', 55.50, 213.20, 2220],
      ['7-7', 33.00, 126.80, 1320],
      ['7-8', 55.50, 213.20, 2220],
      ['7-9', 55.50, 213.20, 2220],
      ['8-8', 55.50, 213.20, 2220],
      ['8-9', 55.50, 213.20, 2220],
      ['9-9', 82.80, 318.00, 3312]
    ];

    return amounts;
  }

  getYearlyAmount(start = 1, finish = 3)
  {
    if (start > finish) {
      [start, finish] = [finish, start]; // swap the vars, es6
    }

    let amount = 0, array, amounts = this.getTflAmounts();

    for (array of amounts) {
      if (array[0] == (start + '-' + finish)) {
        amount = array[3];
      }
    }

    return amount;
  }

  calculateCommuterClub(yearlyAmount)
  {
    // REPRESENTATIVE EXAMPLE: Credit Limit: £1200. Interest: £67 Total payable: £1267 in 11 monthly instalments of £115. Representative 11.61% APR. Interest rate: 5.6% pa
    return ((yearlyAmount / 100 * 5.6) + yearlyAmount);
  }

  render() {
    const yearlyAmount = this.getYearlyAmount(this.props.from, this.props.to);
    const perMonth = yearlyAmount / 12;
    const clubPrice = this.calculateCommuterClub(yearlyAmount);
    const clubPerMonth = clubPrice / 12;
    return (
      <div>
        <div><b>TFL Price:</b> £{yearlyAmount.toFixed(2)} (£{perMonth.toFixed(2)}/month)</div>
        <div><b>Commuterclub Price:</b> £{clubPrice.toFixed(2)} (£{clubPerMonth.toFixed(2)}/month)</div>
      </div>
    )
  }
}

export default TflAmount;
