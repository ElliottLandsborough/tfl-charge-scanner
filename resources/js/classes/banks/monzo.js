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
            */
            // try to get transactions from api
            self.populateTransactions(accessToken);
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

  // this is a bit weird because we have to call the api once at a time...
  // maybe do it by month instead?
  // TODO: clean this up!!!
  populateTransactions(accessToken) {
    let self = this;
    // TODO: handle the 401 here, probably clear the credentials
    // and set the state back to isAuthorized: false, clear the old creds
    let transactionsLoop = async function () {
      let continueLoop = true;
      while (continueLoop && self.state.accessToken !== false) {
        const response = await fetch(self.generateTransactionUrl(self.state.travelTransactionsLastDate), self.authParams())
          .then(function(response) {
            if(response.status !== 200) {
              // did not get a 200, log the user out
              // TODO: some kind of error message?
              self.logOut();
            }

            return response;
          });

        try {
          const json = await response.json();
          const transactions = json.transactions;

          self.processApiTransactions(transactions);

          // if the there were less than 100 transactions in the response
          if (transactions.length < 100) {
            // stop the loop
            continueLoop = false;
            // loading is complete
            self.setState({loadingIsComplete: true});
          }
        } catch {
          // most likely the user was already logged out...
          console.log('error processing api response');
          // stop the loop
          continueLoop = false;
        }
      }
    }

    transactionsLoop();
  }
}

export default Monzo;
