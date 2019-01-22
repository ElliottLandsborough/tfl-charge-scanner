// resources/assets/js/components/Example.js

import React, {Component} from 'react';
import { Link } from 'react-router-dom'
import moment from 'moment'
//import MonthAmount from './MonthAmount'
import GraphAmounts from './GraphAmounts'
import TflAmount from './TflAmount'

class Example extends Component {
  constructor(props) {
    super(props)
    this.state = {
      monzoApi: 'https://api.monzo.com',
      error: null,
      isAuthorized: false,
      accessToken: false,
      accounts: [],
      accountId: false,
      transactions: [],
      transactionsForTravel: [],
      travelTransactionsLastDate: false,
      yearAverages: [],
      yearTotals: [],
      yearMonths: [],
      fromZone: 0,
      toZone: 0,
      yearlyAmount: 0,
      clubAmount: 0
    };
    this.setFromZone = this.setFromZone.bind(this);
    this.setToZone = this.setToZone.bind(this);
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

  componentDidMount() {
    this.setAmounts();
    fetch("/credentials")
      .then(res => res.json())
      .then(
        (result) => {
          const howManyItems = Object.keys(result).length;
          if (howManyItems) {
            this.setState({
                isAuthorized: true,
                accessToken: result.access_token
            });
          }
          return howManyItems;
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            error
          });
        }
      )
      .then(
        (howManyItems) => {
          if (howManyItems) {
            this.fetchAccountId();
          }
        }
      )
  }

  fetchAccountId() {
    const { monzoApi } = this.state;
    let self = this;
    fetch(monzoApi + '/accounts', this.authParams())
      .then(function(response) {
        if(response.status !== 200) {
          self.setState({
            isAuthorized: false,
            accessToken: false
          });
        }
        return response;
      })
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            accounts: result.accounts
          });
        },
        (error) => {
          this.setState({
            error
          });
        }
      )
      .then(
          () => {
            this.setRetailAccountId();
          }
      )
      .then(
          () => {
            this.populateTransactions();
          }
      )
  }

  setRetailAccountId() {
    const { accounts } = this.state;

    accounts.forEach(function(account) {
        if (account.type === 'uk_retail') {
          this.setState({
            accountId: account.id
          });
        }
    }.bind(this));
  }

  urlEncode(params) {
    var out = [];

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        out.push(key + '=' + encodeURIComponent(params[key]));
      }
    }

    return out.join('&');
  }

  authParams() {
    const { accessToken } = this.state;
    return {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    }
  }

  generateTransactionUrl(since = false) {
    const { monzoApi, accountId } = this.state;

    if (!since) {
      since = moment().subtract(12, 'months').format('Y-MM') + '-01T00:00:00Z';
    }

    let params = {
      // 'expand[]': 'merchant', // this may slow it down?
      'limit': 100,
      'account_id': accountId,
      'since': since,
    };

    return monzoApi + '/transactions?' + this.urlEncode(params);
  }

  // this is a bit weird because we have to call the api once at a time...
  // maybe do it by month instead?
  populateTransactions() {
    // get the transactions from localstorage and update state with them
    this.setState({
        transactionsForTravel: JSON.parse(localStorage.getItem('travelTransactions')),
        travelTransactionsLastDate: JSON.parse(localStorage.getItem('travelTransactionsLastDate'))
    });

    let self = this;
    // TODO: handle the 401 here, probably clear the credentials
    // and set the state back to isAuthorized: false, clear the old creds
    let transactionsLoop = async function () {
      let continueLoop = true;
      let lastDate = self.state.travelTransactionsLastDate;
      while (continueLoop) {
        const response = await fetch(self.generateTransactionUrl(lastDate), self.authParams());
        const json = await response.json();
        const transactions = json.transactions

        // no need to store all transactions at the moment
        //self.setState({ transactions: [...self.state.transactions, ...transactions ] });

        // so just get transport ones
        transactions.forEach(function(transaction) {
            if (transaction.category == 'transport' && transaction.description.toLowerCase().includes('tfl.gov.uk') && transaction.account_id == self.state.accountId) {
                self.setState({
                    transactionsForTravel: [...self.state.transactionsForTravel, ...[{
                        // only take what is needed out of the transaction
                        account_id: transaction.account_id,
                        amount: transaction.amount,
                        created: transaction.created,
                        id: transaction.id
                    }] ]
                });

                // store the transactions in the browsers localstorage
                self.storeTravelTransactions();
            }
        });

        self.travelTotals();

        lastDate = transactions[transactions.length-1].created;

        if (transactions.length < 100) {
          continueLoop = false;
        }
      }
    }

    transactionsLoop();
  }

  storeTravelTransactions()
  {
    localStorage.setItem('travelTransactions', JSON.stringify(this.state.transactionsForTravel));
    localStorage.setItem('travelTransactionsLastDate', JSON.stringify(this.state.transactionsForTravel[this.state.transactionsForTravel.length-1].created));
  }

  travelTotals() {
    let yearAverages = {};
    let yearTotals = {};
    let yearMonths = {};

    this.state.transactionsForTravel.forEach(function(transaction) {
      const amount = transaction.amount;
      const month = transaction.created.substr(5,2);
      const year = transaction.created.substr(0,4);

      if (typeof yearTotals[year] == "undefined") yearTotals[year] = 0;
      yearTotals[year] += amount;

      if (typeof yearAverages[year] == "undefined") yearAverages[year] = 0;
      yearAverages[year] += Math.round(amount / 12);

      if (typeof yearMonths['' + year + month] == "undefined") yearMonths['' + year + month] = 0;
      yearMonths['' + year + month] += amount;
    });

    this.setState({
        yearAverages: yearAverages,
        yearTotals: yearTotals,
        yearMonths: yearMonths
    });
  }

  setFromZone(event) {
    this.setAmounts(event.target.value, this.state.toZone);
  }

  setToZone(event) {
    this.setAmounts(this.state.fromZone, event.target.value);
  }

  setAmounts(fromZone = 1, toZone = 3) {
    const yearlyAmount = this.getYearlyAmount(fromZone, toZone);
    const clubAmount = this.calculateCommuterClub(yearlyAmount);
    this.setState({fromZone: fromZone, toZone: toZone, yearlyAmount: yearlyAmount, clubAmount: clubAmount});
  }

  render() {
    const { error, isAuthorized, items, travelTotals } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isAuthorized) {
      return <a className='auth-button' href='/auth'>Authorize with Monzo</a>;
    } else {
      const tflZones = [1,2,3,4,5,6,7,8,9].map((num) =>
        <option key={num} value={num}>{num}</option>
      );
      return (
        <div>
          <GraphAmounts yearlyAmount={this.state.yearlyAmount} clubAmount={this.state.clubAmount} yearMonths={this.state.yearMonths} />
          <div className="zone-selector">
            From Zone
            <select id="zoneFromSelector" onChange={this.setFromZone} value={this.state.fromZone}>
              {tflZones}
            </select>
            to zone
            <select id="zoneToSelector" onChange={this.setToZone} value={this.state.toZone}>
              {tflZones}
            </select>
          </div>
          <div className="tfl-amount">
            <TflAmount yearlyAmount={this.state.yearlyAmount} clubAmount={this.state.clubAmount} />
          </div>
        </div>
      )
    }
  }
}

export default Example;
