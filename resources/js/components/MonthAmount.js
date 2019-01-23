// resources/assets/js/components/MonthAmount.js

import React, {Component} from 'react';
// date-fns
import dateFormat from 'date-fns/format'
import dateParse from 'date-fns/parse'

class MonthAmount extends Component {
    render() {
        const parsedDate = this.props.yearMonth.toString().substr(0, 4) + '-' + this.props.yearMonth.toString().substr(4, 2) + "-01";
        const date = dateFormat(dateParse(parsedDate), 'MMM YYYY');
        return (
            <div className="col-md-2">
              <div className="month-amount">
                <p>£{this.props.amount.toFixed(2)}<span>{date}</span></p>
              </div>
            </div>
        )
    }
}

export default MonthAmount;
