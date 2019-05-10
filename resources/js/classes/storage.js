class Storage {
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

  logout()
  {
    localStorage.clear();
  }
}

export default Storage;
