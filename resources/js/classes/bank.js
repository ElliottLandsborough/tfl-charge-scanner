// date-fns
import dateFormat from 'date-fns/format'
import dateSubMonths from 'date-fns/sub_months'
import isAfter from 'date-fns/is_after'
import dateParse from 'date-fns/parse'
import dateDiffInDays from 'date-fns/difference_in_days'

class Bank {
  usedTxKeys = [];
  transactionsForTravel = [];
  sinceDate = this.getSinceDate();

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

  /**
   * Calculate how many days between when we started counting from
   * and what date the api has returned (for the progress bar).
   * @return {Number} Between 0 and 100 usually.
   */
  getDaysPercentage()
  {
    // this can only happen if we have both a start date and the api has returned some transactions
    if (this.sinceDate !== false && this.transactionsForTravel.length) {
        // last date from list of transactions (string)
        const lastDateString = this.transactionsForTravel[this.transactionsForTravel.length-1].created;

        // day count between now and when we started querying the api
        const fromStartUntilNow = dateDiffInDays(
            new Date(), // now
            dateParse(this.sinceDate) // date we start querying api from
        );

        // day count between when we started querying the api and the last thing the api returned
        const fromstartUntilLast = dateDiffInDays(
            dateParse(lastDateString),  // last date from list of transactions (string)
            dateParse(this.sinceDate) // date we start querying api from
        );

        // calc percentage
        const percentage = Math.round(fromstartUntilLast / fromStartUntilNow * 100);

        return percentage;
    }

    return 0;
  }

  /**
   * Calculate the totals and averages from the transactions in the state
   * @return {[type]} [description]
   */
  travelTotals() {
    // some defaults
    let self = this;
    let yearAverages = {};
    let yearTotals = {};
    let yearMonths = {};
    let fullTotal = 0;

    // loop through all transactions
    this.transactionsForTravel.forEach(function(transaction) {
      // did this transaction happen after the 'since' date?
      const transactionIsAfterSinceDate = isAfter(
        dateParse(transaction.created),
        dateParse(self.sinceDate)
      );

      // this check stops transactions in localstorage from before the since date being processed
      if (transactionIsAfterSinceDate) {
          const amount = transaction.amount;
          const month = transaction.created.substr(5,2);
          const year = transaction.created.substr(0,4);

          // total per year, initialize as 0 if it doesnt exist yet
          if (typeof yearTotals[year] == "undefined") yearTotals[year] = 0;
          yearTotals[year] += amount;

          // average per year, initialize as 0 if it doesnt exist yet
          if (typeof yearAverages[year] == "undefined") yearAverages[year] = 0;
          yearAverages[year] += Math.round(amount / 12);

          // total per yearMonth initialize as 0 if it doesnt exist yet
          if (typeof yearMonths['' + year + month] == "undefined") yearMonths['' + year + month] = 0;
          yearMonths['' + year + month] += amount;

          // total of everything
          fullTotal += amount;
      }
    });

    // add all calculations to the state
    return {
      yearAverages: yearAverages,
      yearTotals: yearTotals,
      yearMonths: yearMonths,
      fullTotal: fullTotal,
      percentage: self.getDaysPercentage(),
    };
  }

}

export default Bank;
