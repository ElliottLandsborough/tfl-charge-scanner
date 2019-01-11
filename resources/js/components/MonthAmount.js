import React, {Component} from 'react';

class MonthAmount extends Component {
    render() {
        return (
            <div>
                <p>{this.props.yearMonth}: £{this.props.amount}</p>
            </div>
        )
    }
}

export default MonthAmount;
