import Bank from '../bank'

class Monzo extends Bank {
  travelTransactionsLastDate = false;

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
            /*
            // success, first try to fill transactions from localstorage
            // todo: make this work
            this.fillTransactionsFromLocalStorage();
            */
            // try to get transactions from api
            self.populateTransactions(accountId, accessToken);
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
  populateTransactions(accountId, accessToken) {
    let self = this;
    // TODO: handle the 401 here, probably clear the credentials
    // and set the state back to isAuthorized: false, clear the old creds
    let transactionsLoop = async function () {
      let continueLoop = true;
      while (continueLoop && accessToken !== false) {
        const response = await fetch(self.generateTransactionUrl(accountId, self.travelTransactionsLastDate), self.authParams(accessToken))
          .then(function(response) {
            if(response.status !== 200) {
              // did not get a 200, log the user out
              // TODO: some kind of error message?
              self.logOut();
            }

            return response;
          });

        //try {
          const json = await response.json();
          const transactions = json.transactions;

          self.processApiTransactions(transactions, accountId);

          // if the there were less than 100 transactions in the response
          if (transactions.length < 100) {
            // stop the loop
            continueLoop = false;
            // loading is complete
            self.loadingIsComplete = true;
          }
        /*} catch {
          // most likely the user was already logged out...
          console.log('error processing api response');
          // stop the loop
          continueLoop = false;
        }*/
      }
    }

    transactionsLoop();
  }

  generateTransactionUrl(accountId, since = false) {
    const monzoApi = this.apiUrl();

    if (!since) {
        since = this.getSinceDate();
    }

    let params = {
      // 'expand[]': 'merchant', // this may slow it down?
      'limit': 100,
      'account_id': accountId,
      'since': since,
    };

    return monzoApi + '/transactions?' + this.urlEncode(params);
  }

  /**
   * Process transactions from the api
   * @param  {} transactions Straight from the api
   * @return {} filtered travel transactions
   */
  processApiTransactions(transactions, accountId) {
    self = this;
    transactions.forEach(function(transaction) {
      // detect tfl transactions
      if (!self.transactionHasBeenProcessed(transaction) && self.transactionMatchesAccount(transaction, accountId) && self.isTflTransaction(transaction)) {
        self.transactionsForTravel.push({
            // only take what is needed out of the transaction
            account_id: transaction.account_id,
            amount: transaction.amount,
            created: transaction.created,
            id: transaction.id
        });

        // store the transactions in the browsers localstorage
        //self.storeTravelTransactions();
      }
      // make sure we record the date of the last processed transaction
      self.travelTransactionsLastDate = transaction.created;
    });

    // recalculate the totals
    return self.travelTotals();
  }
}

export default Monzo;
