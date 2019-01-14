import React, {Component} from 'react';
import moment from 'moment';

class MonthAmount extends Component {
    render() {
        const parsedDate = this.props.yearMonth.toString().substr(0, 4) + '-' + this.props.yearMonth.toString().substr(4, 2) + "-01";
        const date = moment(parsedDate).format('MMM Y');
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
