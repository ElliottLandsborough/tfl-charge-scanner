// resources/assets/js/components/Example.js

import React from 'react'
import { Link } from 'react-router-dom'
import moment from 'moment'

class Example extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      monzoApi: 'https://api.monzo.com',
      error: null,
      isAuthorized: false,
      items: [],
      accounts: [],
      accountId: false,
      transactions: [],
      transactionsForTravel: [],
      travelTotals: []
    };
  }

  componentDidMount() {
    fetch("/credentials")
      .then(res => res.json())
      .then(
        (result) => {
          const howManyItems = Object.keys(result.items).length;
          if (howManyItems) {
            this.setState({
                isAuthorized: true,
                items: result.items
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
    const { items, monzoApi } = this.state;

    fetch(monzoApi + '/accounts', this.authParams())
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
    const { items } = this.state;
    return {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + items.access_token
      }
    }
  }

  generateTransactionUrl(since = false) {
    const { monzoApi, accountId } = this.state;

    if (!since) {
      since = moment().subtract(13, 'months').format('Y-MM') + '-01T00:00:00Z';
    }

    let params = {
      'expand[]': 'merchant',
      'limit': 100,
      'account_id': accountId,
      'since': since,
    };

    return monzoApi + '/transactions?' + this.urlEncode(params);
  }

  // this is a bit weird because we have to call the api once at a time...
  populateTransactions() {
    let self = this;

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
    let travelTotals = {};
    let self = this;

    this.state.transactionsForTravel.forEach(function(transaction) {
      const amount = transaction.amount; // invert the amount
      const month = transaction.created.substr(5,2);
      const year = transaction.created.substr(0,4);

      if (typeof travelTotals[year + 'Avg'] == "undefined") travelTotals[year + 'Avg'] = 0;
      if (typeof travelTotals[year + 'Total'] == "undefined") travelTotals[year + 'Total'] = 0;
      if (typeof travelTotals[year] == "undefined") travelTotals[year] = {};
      if (typeof travelTotals[year][month] == "undefined") travelTotals[year][month] = 0;

      travelTotals[year][month] += amount;
      travelTotals[year + 'Total'] += amount;
      travelTotals[year + 'Avg'] += Math.round(amount / 12);
    });

    for (var key in travelTotals) {
        if (travelTotals.hasOwnProperty(key)) {
            if (key.includes('Avg') || key.includes('Total')) {
                travelTotals[key] = travelTotals[key] * -1 / 100;
            } else {
                for (var month in travelTotals[key]) {
                    travelTotals[key][month] = travelTotals[key][month] * -1 / 100;
                }
            }
        }
    }

    this.setState({ travelTotals: travelTotals });
  }

  renderTotals() {
    const { travelTotals } = this.state;

    let string = '';
    let months = '';

    for (var key in travelTotals) {
        if (travelTotals.hasOwnProperty(key)) {
            if (key.includes('Avg') || key.includes('Total')) {
                string += '<p><b>' + key + ': ' + travelTotals[key] + '</b></p>';
            } else {
                for (var month in travelTotals[key]) {
                    string += '<p>' + key + '-' + month + ': ' + travelTotals[key][month] + '</p>';
                }
            }
        }
    }

    return string;
  }

  render() {
    const { error, isAuthorized, items, travelTotals } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isAuthorized) {
      return <a className='navbar-brand' href='/auth'>Authorize with monzo</a>;
    } else {
      return (
        <div className='totals' dangerouslySetInnerHTML={{__html: this.renderTotals()}}></div>
      );
    }
  }
}

export default Example
