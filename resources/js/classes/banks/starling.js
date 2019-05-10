import Bank from '../bank'

class Starling extends Bank {
  //apiUrl = 'https://api-sandbox.starlingbank.com';
  // apiUrl = 'https://api.starlingbank.com';
  apiUrl = '/apiproxy/starling';

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

  logout(accessToken = false) {
  }
}

export default Starling;
