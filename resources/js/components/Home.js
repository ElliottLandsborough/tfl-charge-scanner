// resources/assets/js/components/Home.js

import React, {Component} from 'react'
import { Link } from 'react-router-dom'
import Monzo from '../classes/banks/monzo'
import Starling from '../classes/banks/starling'
import GraphAmounts from './GraphAmounts'
import TflAmount from './TflAmount'
import Loader from './Loader'
// date-fns
import dateParse from 'date-fns/parse'
import dateDiffInDays from 'date-fns/difference_in_days'

class Home extends Component {

  /**
   * Constructor
   * @param  {[type]} props [description]
   * @return {[type]}       [description]
   */
  constructor(props) {
    super(props)

    // set the initial state
    this.state = this.initialState();

    // bind 'this' to a few functions
    this.setFromZone = this.setFromZone.bind(this);
    this.setToZone = this.setToZone.bind(this);
    this.logOut = this.logOut.bind(this);
  }

  /**
   * Returns an object of the default state for this component
   * @return {object}
   */
  initialState() {
    return {
      currentBank: false,
      error: null, // in case an error happens
      isAuthorized: false, // becomes true if an auth token exists
      accessToken: false, // the access token returned from the api
      transactionsForTravel: [], // transactions used for TFL travel
      travelTransactionsLastDate: false, // the date of the most recent transaction
      yearAverages: [], // yearly average monzo spend
      yearTotals: [], // yearly total monzo spend
      yearMonths: [], // monthly total monzo spend
      fromZone: 0, // current 'from' zone from dropdowns
      toZone: 0, // current 'to' zone from dropdowns
      yearlyAmount: 0, // current yearly tfl price based on dropdowns
      clubAmount: 0, // current commuterclub price based on dropdowns
      sinceDate: false, // when to count transactions from
      loadingIsComplete: false, // becomes true when transaction loop finishes
      fullTotal: 0, // all monzo tfl transactions added together
      usedTxKeys: [], // transaction ids that have already been grabbed from the api
    };
  }

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
   * Runs once the component is initialized
   * @return {[type]} [description]
   */
  componentDidMount() {

    // make sure the state contains the default amounts
    this.setAmounts();

    // set the since date in the state
    //this.setSinceDate();

    // initialize auth, get an access token from laravel
    this.startApiProcess();
  }

  startApiProcess() {
    let self = this;

    this.initializeAuthenticationWithCallback(function() {
        let bank;
        if (self.state.currentBank == 'monzo') {
            bank = new Monzo();
        }
        if (self.state.currentBank == 'starling') {
            bank = new Starling();
        }
        // query the api for an account id
        bank.fetchAccountId(self.state.accessToken);
    });
  }

  /**
   * Check if we already have an access token stored in the session.
   * If yes, store in state for later use.
   * @return {[type]} [description]
   */
  initializeAuthenticationWithCallback(callback) {
    fetch("/credentials")
      .then(res => res.json())
      .then(
        (result) => {
          const howManyItems = Object.keys(result).length;
          if (howManyItems) {
            this.setState({
                isAuthorized: true,
                accessToken: result.access_token,
                currentBank: result.current_bank
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
            callback();
          }
        }
      )
  }

  /**
   * Find out how much someone spends per month
   * @return {Number} (e.g 92.47)
   */
  getMonzoMonthlyAverage()
  {
    // convert the full total to a positive number of pounds/pence
    const fullTotal = this.state.fullTotal * -1 / 100;
    // only bother if a start date was set and the total is bigger than 0
    if (this.state.sinceDate !== false && fullTotal > 0) {
        // average number of days in a month including leaps
        const daysInMonth = 30.44;
        // how many days exist between start and now?
        const fromStartUntilNow1 = dateDiffInDays(
            new Date(),
            dateParse(this.state.sinceDate)
        )
        // and this equates to how many months (e.g 12.76)
        const exactMonths = fromStartUntilNow1 / daysInMonth;
        // the total equates to this much per month
        return (fullTotal / exactMonths).toFixed(2);
    }

    return 0;
  }

  /**
   * Get any transactions already stored in localstorage and populate the state with them
   * @return {[type]} [description]
   */
  fillTransactionsFromLocalStorage() {
    // init empty array for used tx keys
    const usedTxKeys = [];

    // get the transactions from localstorage and update state with them
    if (localStorage.getItem('travelTransactions')) {
        const travelTransactionsFromStorage = JSON.parse(localStorage.getItem('travelTransactions'));

        // populate the used tx keys array
        travelTransactionsFromStorage.forEach(function(item) {
            usedTxKeys.push(item.id);
        });

        // populate the state with the info we need
        this.setState({
            transactionsForTravel: travelTransactionsFromStorage,
            travelTransactionsLastDate: JSON.parse(localStorage.getItem('travelTransactionsLastDate')),
            usedTxKeys: usedTxKeys,
        });

        // recalculate the totals if we did detect some transactions in the state
        this.travelTotals();
    }
  }

  /**
   * Store some parts the state in localstorage
   */
  storeTravelTransactions()
  {
    localStorage.setItem('travelTransactions', JSON.stringify(this.state.transactionsForTravel));
    localStorage.setItem('travelTransactionsLastDate', JSON.stringify(this.state.travelTransactionsLastDate));
  }

  // runs whenever 'from' checkbox is changed
  setFromZone(event) {
    this.setAmounts(event.target.value, this.state.toZone);
  }

  // runs whenever 'to' checkbox is changed
  setToZone(event) {
    this.setAmounts(this.state.fromZone, event.target.value);
  }

  /**
   * Set the to/from zones and the yearly tfl/commuterclub prices in the state
   * @param {Number} fromZone [description]
   * @param {Number} toZone   [description]
   */
  setAmounts(fromZone = 1, toZone = 3) {
    const yearlyAmount = this.getYearlyAmount(fromZone, toZone);
    const clubAmount = this.calculateCommuterClub(yearlyAmount);
    this.setState({fromZone: fromZone, toZone: toZone, yearlyAmount: yearlyAmount, clubAmount: clubAmount});
  }

  /**
   * Logs a user out
   * @return {[type]} [description]
   */
  logOut() {
    const { accessToken } = this.state;
    // can only log out if we have an access token
    if (accessToken !== false) {
        // async get all logout urls, no need to process response
        fetch(this.state.monzoApi + '/oauth2/logout', this.authParams('POST')); // log out of monzo api
    }
    fetch('/logout'); // log out of laravels everything

    // reset state to initial values
    this.setState(this.initialState());

    // clear localstorage
    localStorage.clear();
  }

  render() {
    const { error, isAuthorized, items, travelTotals } = this.state;

    if (error) {
      return <div>Error: {error.message}</div>;
    } else if (!isAuthorized) {
      return (
        <div class="guest-container">
          <p><a className='auth-button monzo' href='/auth/monzo'>Authorize with Monzo</a></p>
          <p><a className='auth-button starling' href='/auth/starling'>Authorize with Starling</a></p>
          <p>This app makes a graph of your monthly spend on the London transport system. Please authorize to continue.</p>
        </div>
      );
    } else {
      const tflZones = [1,2,3,4,5,6,7,8,9].map((num) =>
        <option key={num} value={num}>{num}</option>
      );
      return (
        <div>
          <Loader daysPercentage={this.state.daysPercentage} loadingIsComplete={this.state.loadingIsComplete} />
          <GraphAmounts yearlyAmount={this.state.yearlyAmount} clubAmount={this.state.clubAmount} yearMonths={this.state.yearMonths} monzoMonthlyAverage={this.getMonzoMonthlyAverage()} />
          <div className="zone-selector">
            From zone
            <select id="zoneFromSelector" className="form-control" onChange={this.setFromZone} value={this.state.fromZone}>
              {tflZones}
            </select>
            to zone
            <select id="zoneToSelector" className="form-control" onChange={this.setToZone} value={this.state.toZone}>
              {tflZones}
            </select>
          </div>
          <div className="tfl-amount">
            <TflAmount yearlyAmount={this.state.yearlyAmount} clubAmount={this.state.clubAmount} monzoMonthlyAverage={this.getMonzoMonthlyAverage()} />
          </div>
          <div className="log-out">
            <button className="logout" onClick={this.logOut}>Logout</button>
          </div>
        </div>
      )
    }
  }
}

export default Home;
