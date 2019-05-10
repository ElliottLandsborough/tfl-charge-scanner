import Bank from '../bank'

class Starling extends Bank {
  apiUrl = 'https://api-sandbox.starlingbank.com';
  // apiUrl = 'https://api.starlingbank.com';

  /**
   * Get the account id from the monzo api
   * @return {[type]} [description]
   */
  fetchAccountId(accessToken) {
    // todo - php piper
  }

  logout(accessToken = false) {
  }
}

export default Starling1;
