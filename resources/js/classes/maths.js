import isAfter from 'date-fns/is_after'
import dateParse from 'date-fns/parse'
import dateDiffInDays from 'date-fns/difference_in_days'

class Maths {
  /**
   * returns the official TFL prices
   * @return {array} zones, weekly, monthly, yearly
   */
  getTflAmounts() {
    // http://content.tfl.gov.uk/adult-fares-2019.pdf
    const amounts = [
      ['1-1', 35.10, 134.80, 1404],
      ['1-2', 35.10, 134.80, 1404],
      ['1-3', 41.20, 158.30, 1648],
      ['1-4', 50.50, 194.00, 2020],
      ['1-5', 60.00, 230.40, 2400],
      ['1-6', 64.20, 246.60, 2568],
      ['1-7', 69.80, 268.10, 2792],
      ['1-8', 82.50, 316.80, 3300],
      ['1-9', 91.50, 351.40, 3660],
      ['2-2', 26.30, 101.00, 1052],
      ['2-3', 26.30, 101.00, 1052],
      ['2-4', 29.10, 111.80, 1164],
      ['2-5', 34.90, 134.10, 1396],
      ['2-6', 43.90, 168.60, 1756],
      ['2-7', 45.60, 175.20, 1824],
      ['2-8', 62.00, 238.10, 2480],
      ['2-9', 62.00, 238.10, 2480],
      ['3-3', 26.30, 101.00, 1052],
      ['3-4', 26.30, 101.00, 1052],
      ['3-5', 29.10, 111.80, 1164],
      ['3-6', 34.90, 134.10, 1396],
      ['3-7', 45.60, 175.20, 1824],
      ['3-8', 62.00, 238.10, 2480],
      ['3-9', 62.00, 238.10, 2480],
      ['4-4', 26.30, 101.00, 1052],
      ['4-5', 26.30, 101.00, 1052],
      ['4-6', 29.10, 111.80, 1164],
      ['4-7', 33.00, 126.80, 1320],
      ['4-8', 55.50, 213.20, 2220],
      ['4-9', 55.50, 213.20, 2220],
      ['5-5', 26.30, 101.00, 1052],
      ['5-6', 26.30, 101.00, 1052],
      ['5-7', 33.00, 126.80, 1320],
      ['5-8', 55.50, 213.20, 2220],
      ['5-9', 55.50, 213.20, 2220],
      ['6-6', 26.30, 101.00, 1052],
      ['6-7', 33.00, 126.80, 1320],
      ['6-8', 55.50, 213.20, 2220],
      ['6-9', 55.50, 213.20, 2220],
      ['7-7', 33.00, 126.80, 1320],
      ['7-8', 55.50, 213.20, 2220],
      ['7-9', 55.50, 213.20, 2220],
      ['8-8', 55.50, 213.20, 2220],
      ['8-9', 55.50, 213.20, 2220],
      ['9-9', 82.80, 318.00, 3312]
    ];

    return amounts;
  }

  /**
   * Returns the price per year based on a start/finish zone
   * @type {Number}
   */
  getYearlyAmount(start = 1, finish = 3)
  {
    // init vars
    let amount = 0, array, amounts = this.getTflAmounts();

    // if start is higher than finish, switch the vars around
    if (start > finish) {
      [start, finish] = [finish, start];
    }

    // search for match
    for (array of amounts) {
      if (array[0] == (start + '-' + finish)) {
        amount = array[3];
      }
    }

    return amount;
  }

  /**
   * Calculate how much commuter club should cost based on a yearly price
   * @type {Number}
   */
  calculateCommuterClub(yearlyAmount)
  {
    // REPRESENTATIVE EXAMPLE: Credit Limit: £1200. Interest: £67 Total payable: £1267 in 11 monthly instalments of £115. Representative 11.61% APR. Interest rate: 5.6% pa
    return ((yearlyAmount / 100 * 5.6) + yearlyAmount);
  }

  /**
   * Calculate how many days between when we started counting from
   * and what date the api has returned (for the progress bar).
   * @return {Number} Between 0 and 100 usually.
   */
  getDaysPercentage(transactionsForTravel = [], sinceDate = false)
  {
    // this can only happen if we have both a start date and the api has returned some transactions
    if (sinceDate !== false && transactionsForTravel.length) {
        // last date from list of transactions (string)
        const lastDateString = transactionsForTravel[transactionsForTravel.length-1].created;

        // day count between now and when we started querying the api
        const fromStartUntilNow = dateDiffInDays(
            new Date(), // now
            dateParse(sinceDate) // date we start querying api from
        );

        // day count between when we started querying the api and the last thing the api returned
        const fromstartUntilLast = dateDiffInDays(
            dateParse(lastDateString),  // last date from list of transactions (string)
            dateParse(sinceDate) // date we start querying api from
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
  travelTotals(transactionsForTravel = [], sinceDate = false) {
    // some defaults
    let yearAverages = {};
    let yearTotals = {};
    let yearMonths = {};
    let fullTotal = 0;

    // loop through all transactions
    transactionsForTravel.forEach(function(transaction) {
      // did this transaction happen after the 'since' date?
      const transactionIsAfterSinceDate = isAfter(
        dateParse(transaction.created),
        dateParse(sinceDate)
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
      percentage: this.getDaysPercentage(transactionsForTravel. sinceDate),
    };
  }
}

export default Maths;
