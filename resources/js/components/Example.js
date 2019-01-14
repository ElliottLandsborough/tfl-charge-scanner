// resources/assets/js/components/Example.js

import React, {Component} from 'react';
import { Link } from 'react-router-dom'
import moment from 'moment'
import MonthAmount from './MonthAmount'
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
      yearAverages: [],
      yearTotals: [],
      yearMonths: [],
      fromZone: 1,
      toZone: 3
    };
  }

  componentDidMount() {
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
    let self = this;
    // TODO: handle the 401 here, probably clear the credentials
    // and set the state back to isAuthorized: false, clear the old creds
    let transactionsLoop = async function () {
      let continueLoop = true;
      let lastDate = false;
      while (continueLoop) {
        const response = await fetch(self.generateTransactionUrl(lastDate), self.authParams());
        const json = await response.json();
        const transactions = json.transactions

        // no need to store all transactions at the moment
        //self.setState({ transactions: [...self.state.transactions, ...transactions ] });

        // so just get transport ones
        transactions.forEach(function(transaction) {
            if (transaction.category == 'transport' && transaction.description.toLowerCase().includes('tfl.gov.uk')) {
                self.setState({ transactionsForTravel: [...self.state.transactionsForTravel, ...[transaction] ] });
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

  travelTotals() {
    let yearAverages = [];
    let yearTotals = [];
    let yearMonths = [];

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

  travelTotalPositiveInteger(integer) {
    return integer * -1 / 100;
  }

  setFromZone(event) {
    this.setState({fromZone: event.target.value});
  }

  setToZone(event) {
    this.setState({toZone: event.target.value});
  }

  render() {
    const { error, isAuthorized, items, travelTotals } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isAuthorized) {
      return <a className='navbar-brand' href='/auth'>Authorize with monzo</a>;
    } else {
      const monthAmounts = this.state.yearMonths.map((amount, key) =>
        <MonthAmount key={key} yearMonth={key} amount={this.travelTotalPositiveInteger(amount)} />
      );
      const tflZones = [1,2,3,4,5,6,7,8,9].map((num) =>
        <option key={num} value={num}>{num}</option>
      );

      return (
        <div>
          <div className='month-amounts'>
            {monthAmounts}
          </div>
          <div className="zone-selector">
            From Zone
            <select id="zoneFromSelector" onChange={this.setFromZone.bind(this)} value={this.state.fromZone}>
              {tflZones}
            </select>
            to zone
            <select id="zoneToSelector" onChange={this.setToZone.bind(this)} value={this.state.toZone}>
              {tflZones}
            </select>
          </div>
          <div className='tfl-amount'>
            <TflAmount from={this.state.fromZone} to={this.state.toZone} />
          </div>
        </div>
      )
    }
  }
}

export default Example
