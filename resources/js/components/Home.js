// resources/assets/js/components/Home.js

import React, {Component} from 'react'
import { Link } from 'react-router-dom'

import dateParse from 'date-fns/parse'
import dateDiffInDays from 'date-fns/difference_in_days'

import Monzo from '../classes/banks/monzo'
import Starling from '../classes/banks/starling'
import Maths from '../classes/maths'
import Storage from '../classes/storage'

import GraphAmounts from './GraphAmounts'
import TflAmount from './TflAmount'
import Loader from './Loader'

class Home extends Component {

  bank = false;
  maths = new Maths;
  storage = new Storage;
  currentBank = false;
  accessToken = false; // the access token returned from the api

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
      error: null, // in case an error happens
      isAuthorized: false, // becomes true if an auth token exists
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
   * Runs once the component is initialized
   * @return {[type]} [description]
   */
  componentDidMount() {

    // make sure the state contains the default amounts
    this.setAmounts();

    // initialize auth, get an access token from laravel
    this.startApiProcess();

    let self = this;

    setInterval(function() {
        // of bank was selected and loading has not completed yet
        if (self.bank !== false && self.bank.getLoadingIsComplete() !== true) {
            let transactionsForTravel = self.bank.getTransactionsForTravel();
            //self.setState({transactionsForTravel: transactionsForTravel});
            let sinceDate = self.bank.sinceDate;
            let travelTotals = self.maths.travelTotals(transactionsForTravel, sinceDate);
            self.setState({
                fullTotal:    travelTotals.fullTotal,
                percentage:   travelTotals.percentage,
                yearAverages: travelTotals.yearAverages,
                yearMonths:   travelTotals.yearMonths,
                yearTotals:   travelTotals.yearTotals,
            });
        }
    }, 1 * 1000); // first int is seconds
  }

  startApiProcess() {
    let self = this;

    this.initializeAuthenticationWithCallback(function() {
        if (self.currentBank === 'monzo') {
            self.bank = new Monzo();
        }
        if (self.currentBank === 'starling') {
            self.bank = new Starling();
        }
        // query the api for an account id
        self.bank.fetchAccountId(self.accessToken);
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
            this.setState({ isAuthorized: true });
            this.accessToken = result.access_token;
            this.currentBank = result.current_bank;
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
  getMonthlyAverage()
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
    const yearlyAmount = this.maths.getYearlyAmount(fromZone, toZone);
    const clubAmount = this.maths.calculateCommuterClub(yearlyAmount);
    this.setState({fromZone: fromZone, toZone: toZone, yearlyAmount: yearlyAmount, clubAmount: clubAmount});
  }

  // log out of laravels everything
  logoutOfLaravel() {
    fetch('/logout');
  }

  /**
   * Logs a user out
   * @return {[type]} [description]
   */
  logOut() {
    // log out of bank
    this.bank.logout(this.accessToken);
    // log out of laravel
    this.logoutOfLaravel();
    // clear localstorage
    this.storage.logout();
    // reset state to initial values
    this.setState(this.initialState());
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
          <Loader daysPercentage={this.state.percentage} loadingIsComplete={this.state.loadingIsComplete} />
          <GraphAmounts yearlyAmount={this.state.yearlyAmount} clubAmount={this.state.clubAmount} yearMonths={this.state.yearMonths} monzoMonthlyAverage={this.getMonthlyAverage()} />
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
            <TflAmount yearlyAmount={this.state.yearlyAmount} clubAmount={this.state.clubAmount} monzoMonthlyAverage={this.getMonthlyAverage()} />
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
