import Bank from '../bank'

class Starling extends Bank {
  travelTransactionsLastDate = false;
  continueLoop = true;

  /**
   * Gets run by the home component if auth was successful
   */
  beginTransactionsProcess(accessToken) {
    this.fetchAccountId(accessToken);
  }

  /**
   * Get the account id from the monzo api
   * @return {[type]} [description]
   */
  fetchAccountId(accessToken) {
    let self = this;

    fetch('/apiproxy/starling/accounts', this.authParams(accessToken))
      .then(
        (response) => {
            if(response.status !== 200) {
              // did not get a 200, log the user out
              // TODO: some kind of error message?
              self.logOut();
            }

            return response;
        }
      )
      .then(res => res.json())
      .then(
        (response) => {
          self.populateTransactions(accessToken, response.content.accountUid, response.content.defaultCategory);
        },
        (error) => {
          console.log(error);
        }
      )
  }

  populateTransactions(accessToken, accountUid, categoryUid) {
    let self = this;

    let authParams = this.authParams(accessToken);
    let apiUrl = '/apiproxy/starling/transactions';

    authParams.headers.accountUid = accountUid;
    authParams.headers.categoryUid = categoryUid;

    apiUrl = this.generateTransactionParams(apiUrl, accountUid);

    fetch(apiUrl, authParams)
      .then(
        (response) => {
            if(response.status !== 200) {
              // did not get a 200, log the user out
              // TODO: some kind of error message?
              self.logOut();
            }

            return response;
        }
      )
      .then(res => res.json())
      .then(
        (response) => {
          self.processApiTransactions(response.content, accountUid);
        },
        (error) => {
          console.log(error);
        }
      )

    return;
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
      if (!self.transactionHasBeenProcessed(transaction) && self.isTflTransaction(transaction)) {
        self.transactionsForTravel.push({
            // only take what is needed out of the transaction
            account_id: accountId,
            amount: transaction.amount.minorUnits * -1,
            created: transaction.transactionTime,
            id: transaction.feedItemUid
        });
      }
      // make sure we record the date of the last processed transaction
      self.travelTransactionsLastDate = transaction.created;

      self.usedTxKeys.push(transaction.feedItemUid);
    });
  }

  // detect a tfl transaction
  isTflTransaction(transaction) {
    return transaction.counterPartyName.toLowerCase().includes('mickey mouse');
  }

  logOut(accessToken = false) {
    // stop the loop if it hasn't finished yet
    this.continueLoop = false;
  }
}

export default Starling;
