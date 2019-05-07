// date-fns
import dateFormat from 'date-fns/format'
import dateSubMonths from 'date-fns/sub_months'

class Bank {
  usedTxKeys = [];
  transactionsForTravel = [];

  /**
   * Returns the auth params
   * @param  {String} method Http verb e.g GET/POST
   * @return {Object}        The auth params
   */
  authParams(accessToken = '', method = 'GET') {
    return {
      method: method,
      headers: {
        'Authorization': 'Bearer ' + accessToken
      }
    }
  }

  /**
   * Get the date to start counting transactions from
   */
  getSinceDate() {
    // subtract 12 months
    const sinceObject = dateSubMonths(new Date(), 12);
    // format it
    const since = dateFormat(sinceObject, 'YYYY-MM') + '-01T00:00:00Z'

    return since;
  }

  /**
   * Returns a url string generated from an object with keys
   * @param  {object} params {var1: string, var2: lol}
   * @return {string}        'var1=string&var2=lol'
   */
  urlEncode(params) {
    var out = [];

    for (var key in params) {
      if (params.hasOwnProperty(key)) {
        out.push(key + '=' + encodeURIComponent(params[key]));
      }
    }

    return out.join('&');
  }

  // check if transaction has already been processed
  transactionHasBeenProcessed(transaction) {
    return (self.usedTxKeys.includes(transaction.id))
  }

  // check if transaction matches account it
  transactionMatchesAccount(transaction, accountId) {
    return (transaction.account_id == accountId);
  }

  // detect a tfl transaction
  isTflTransaction(transaction) {
    return (transaction.category == 'transport' && transaction.description.toLowerCase().includes('tfl.gov.uk'));
  }

}

export default Bank;
