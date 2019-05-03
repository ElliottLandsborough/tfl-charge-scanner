import Bank from '../bank'

class Monzo extends Bank {
  apiUrl() {
    return 'https://api.monzo.com';
  }

  /**
   * Get the account id from the monzo api
   * @return {[type]} [description]
   */
  fetchAccountId(accessToken) {
    let self = this;
    fetch(this.apiUrl() + '/accounts', this.authParams(accessToken))
      .then(
        (response) => {
            if(response.status !== 200) {
              // did not get a 200, log the user out
              // TODO: some kind of error message?
              this.logOut();
            }
            return response;
        }
      )
      .then(res => res.json())
      .then(
        (response) => {
          // success, try to extract retail account id
          return self.getRetailAccountId(response.accounts, function(accountId) {
            // todo: continue work from here
            console.log(accountId);
            /*
            // success, first try to fill transactions from localstorage
            this.fillTransactionsFromLocalStorage();
            // then try to get transactions from api
            this.populateTransactions();
            */
          });
        },
        (error) => {
          // todo: sort out this setstate
          this.setState({
            error
          });
        }
      )
  }

  /**
   * Check api response for account that matches 'uk_retail'.
   * Add to state if match exists.
   */
  getRetailAccountId(accounts, callback) {
    const promises = []  // collect all promises here

    accounts.forEach(function(account) {
      if (account.type === 'uk_retail') {
        promises.push(account.id);
      }
    });

    Promise.all(promises).then(results => {
        if (promises.length) {
            callback(promises[0]);
        }
    });
  }
}

export default Monzo;
