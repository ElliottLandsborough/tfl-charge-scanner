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
   * Get the account UID and category UID from the monzo api
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

  /**
   * Generate a full api url with some params on the end
   * @param  {String} apiUrl        The url of the api
   * @param  {String} changesSince  Optional, set the since date to get the transactions from
   * @return {String}               The full URL with the get params on the end
   */
  generateTransactionParams(apiUrl = '', changesSince = false) {
    const monzoApi = this.apiUrl;

    if (!changesSince) {
        changesSince = this.getSinceDate();
    }

    let params = {
      'changesSince': changesSince,
    };

    return apiUrl + '?' + this.urlEncode(params);
  }

  /**
   * Populate transactions 100 at a time
   * @param  {String} accessToken Api access token
   * @param  {String} accountUid  Account UID
   * @param  {String} categoryUid Category UID
   */
  populateTransactions(accessToken, accountUid, categoryUid) {
    let self = this;

    let authParams = this.authParams(accessToken);
    let apiUrl = '/apiproxy/starling/transactions';

    authParams.headers.accountUid = accountUid;
    authParams.headers.categoryUid = categoryUid;

    apiUrl = this.generateTransactionParams(apiUrl);

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
  }

  /**
   * Process transactions from the api
   * @param  {Object} transactions All the transactions from the API
   * @param  {String} accountId    Account UID
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

  /**
   * detect a tfl transaction by scanning the string
   * @param  {Object}  transaction  The transaction object
   * @return {Boolean}              True if it matches
   */
  isTflTransaction(transaction) {
    return transaction.counterPartyName.toLowerCase().includes('mickey mouse');
  }

  /**
   * LogOut stuff for this class only
   */
  logOut() {
    // stop the loop if it hasn't finished yet
    this.continueLoop = false;
  }
}

export default Starling;
