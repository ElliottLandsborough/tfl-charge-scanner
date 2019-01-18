import React, {Component} from 'react';
import moment from 'moment';
import {Bar} from 'react-chartjs-2';
import TflAmount from './TflAmount'

class GraphAmounts extends Component {

  randomScalingFactor() {
    return Math.floor(Math.random() * 101);
  }

  constructor(props) {
    super(props)
  }

  travelTotalPositiveInteger(integer) {
    return integer * -1 / 100;
  }

  isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]';
  }

  barChartData() {
    let self = this;
    const labelDates = Object.keys(this.props.yearMonths);
    let labels = [];
    let monzoPayments = [];
    let tflPrices = [];
    let clubPrices = [];

    let yealyAmount = (self.props.yearlyAmount / 12).toFixed(2);
    let clubAmount = (self.props.clubAmount / 12).toFixed(2);

    labelDates.forEach(function(value) {
      const parsedDate = value.toString().substr(0, 4) + '-' + value.toString().substr(4, 2) + "-01";
      const date = moment(parsedDate).format('MMM Y');
      labels.push(date);
      monzoPayments.push(self.travelTotalPositiveInteger(self.props.yearMonths[value]));
      tflPrices.push(yealyAmount);
      clubPrices.push(clubAmount);
    });

    const barChartData = {
        labels: labels,
        datasets: [{
          label: 'Monzo Payments',
          data: monzoPayments
        },{
          label: 'TFL Price',
          data: tflPrices,

          // Changes this dataset to become a line
          type: 'line'
        },{
          label: 'Club Price',
          data: clubPrices,

          // Changes this dataset to become a line
          type: 'line'
        }]
    };

    console.log(this.props.yearMonths);

    return barChartData;
  }

  render() {
    const chartData = this.barChartData();
    const chartOptions = {};
    return (
      <div className="price-graph">
        <Bar data={chartData} options={chartOptions}/>
      </div>
    )
  }
}

export default GraphAmounts;
