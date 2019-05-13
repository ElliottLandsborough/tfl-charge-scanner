// resources/assets/js/components/GraphAmounts.js

import React, {Component} from 'react'
import {Bar} from 'react-chartjs-2'
// date-fns
import dateFormat from 'date-fns/format'
import dateParse from 'date-fns/parse'

class GraphAmounts extends Component {

  constructor(props) {
    super(props);

    // bind 'this' to a few functions
    this.updateDimensions = this.updateDimensions.bind(this);
    this.componentWillMount = this.componentWillMount.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.componentWillUnmount = this.componentWillUnmount.bind(this);
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
      monzoPrices.push(self.props.monthlyAverage);
    });

    let backgroundColor = '#fee6e8';
    let borderColor = '#fd3a4a';

    if (this.props.currentBank === 'starling') {
        backgroundColor = '#ddcdff';
        borderColor = '#7433ff';
    }

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
          label: 'Average spend per month',
          data: monzoPrices,
          type: 'line',
          //showLine: false
          fill: false,
          backgroundColor: '#eee',
          borderColor: '#aaa',
          borderWidth: 1
        },{
          label: this.props.currentBank.charAt(0).toUpperCase() + this.props.currentBank.slice(1) + ' payments',
          data: monzoPayments,
          backgroundColor: backgroundColor,
          borderColor: borderColor,
          borderWidth: 1,
        }]
    };

    return barChartData;
  }

  updateDimensions() {
    //var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    //var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
    //this.setState({width: w, height: h, redraw: true});
    let self = this;
    clearTimeout(this.state.resizeTimer);
    this.state.resizeTimer = setTimeout(function() {
      self.setState({redraw: true});
    }, 250);
    self.setState({redraw: false});
  }

  componentWillMount() {
    this.setState({redraw: false});
    this.setState({'resizeTimer': false});
    //this.updateDimensions();
  }

  componentDidMount() {
    window.addEventListener("resize", this.updateDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }

  render() {
    const chartData = this.barChartData();
    const chartOptions = {
      maintainAspectRatio: false,    // Don't maintain w/h ratio
      responsive: true,
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
    //const {height, width, id} = this.props;
    return (
      <div className="price-graph">
        <Bar data={chartData} options={chartOptions} />
      </div>
    )
  }
}

export default GraphAmounts;
