// resources/assets/js/components/GraphAmounts.js

import React, {Component} from 'react'
import {Bar} from 'react-chartjs-2'
// date-fns
import dateFormat from 'date-fns/format'
import dateParse from 'date-fns/parse'

class GraphAmounts extends Component {

  constructor(props) {
    super(props);
  }

  // invert number and convert pence to pounds
  travelTotalPositiveInteger(integer) {
    return integer * -1 / 100;
  }

  // generate the bar chart data
  barChartData() {
    let self = this;
    const labelDates = Object.keys(this.props.yearMonths);
    let labels = [];
    let monzoPayments = [];
    let tflPrices = [];
    let clubPrices = [];
    let monzoPrices = [];

    let yealyAmount = (self.props.yearlyAmount / 12).toFixed(2);
    let clubAmount = (self.props.clubAmount / 12).toFixed(2);

    labelDates.forEach(function(value) {
      const parsedDate = value.toString().substr(0, 4) + '-' + value.toString().substr(4, 2) + "-01";
      const date = dateFormat(dateParse(parsedDate), 'MMM YYYY');
      labels.push(date);
      monzoPayments.push(self.travelTotalPositiveInteger(self.props.yearMonths[value]));
      tflPrices.push(yealyAmount);
      clubPrices.push(clubAmount);
      monzoPrices.push(self.props.monzoMonthlyAverage);
    });

    const barChartData = {
        labels: labels,
        datasets: [{
          label: 'TFL per month',
          data: tflPrices,
          type: 'line',
          //showLine: false
          fill: false,
          backgroundColor: '#d0ebfb',
          borderColor: '#1189cc',
          borderWidth: 1
        },{
          label: 'Commuter Club per month',
          data: clubPrices,
          type: 'line',
          //showLine: false
          fill: false,
          backgroundColor: '#e6fffd',
          borderColor: '#00a9a1',
          borderWidth: 1
        },{
          label: 'Average Monzo per month',
          data: monzoPrices,
          type: 'line',
          //showLine: false
          fill: false,
          backgroundColor: '#eee',
          borderColor: '#aaa',
          borderWidth: 1
        },{
          label: 'Monzo payments',
          data: monzoPayments,
          backgroundColor: '#fee6e8',
          borderColor: '#fd3a4a',
          borderWidth: 1,
        }]
    };

    return barChartData;
  }

  render() {
    const chartData = this.barChartData();
    const chartOptions = {
      scales: {
        yAxes: [{
          display: true,
          ticks: {
            suggestedMin: 0, // minimum will be 0, unless there is a lower value
            // OR //
            //beginAtZero: true, // minimum value will be 0

            userCallback: function(value, index, values) {
                // Convert the number to a string and splite the string every 3 charaters from the end
                value = value.toString();
                value = value.split(/(?=(?:...)*$)/);

                // Convert the array to a string and format the output
                value = value.join('.');
                return '£' + value;
            }
          }
        }]
      },
      tooltips: {
        callbacks: {
            label: function(tooltipItem, chart){
                var datasetLabel = chart.datasets[tooltipItem.datasetIndex].label || '';
                return ' £' + tooltipItem.yLabel.toFixed(2);
            }
        }
      }
    };
    const {height, width, id} = this.props;
    return (
      <div className="price-graph">
        <Bar data={chartData} options={chartOptions}/>
      </div>
    )
  }
}

export default GraphAmounts;
