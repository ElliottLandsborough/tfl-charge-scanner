// resources/assets/js/components/Example.js

import React from 'react'
import { Link } from 'react-router-dom'

class Example extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      monzoApi: 'https://api.monzo.com',
      error: null,
      isLoaded: false,
      items: false,
      accounts: [],
      accountId: false,
    };
  }

  componentDidMount() {
    fetch("/credentials")
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            isLoaded: true,
            items: result.items
          });
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            isLoaded: true,
            error
          });
        }
      )
      .then(
        () => {
          this.fetchAccountId();
        }
      )
  }

  fetchAccountId() {
    const { items, monzoApi } = this.state;

    fetch(monzoApi + '/accounts', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + items.access_token
      }
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

  populateTransactions() {
    const { accountId } = this.state;

    console.log(accountId)
  }

  render() {
    const { error, isLoaded, items } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isLoaded || !items) {
      return <a className='navbar-brand' href='/auth'>Authorize with monzo</a>;
    } else {
      return (
        <div className='lol'>lol2</div>
      );
    }
  }
}

export default Example
