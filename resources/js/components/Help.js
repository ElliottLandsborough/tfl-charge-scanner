// resources/assets/js/components/Home.js

import React, {Component} from 'react'
import { Link } from 'react-router-dom'

/**
 * Help page for monzo api keys
 */
class Help extends Component {

  render() {
    return (
      <div class="help-container">
        <h2>Where is my monzo client id/secret?</h2>
        <p>Monzo doesn't allow public facing applications that use the API (yet). Anyone who wants to use this application can manually add it to their developer area to bypass the restriction.</p>
        <p>Below are the steps to create your api keys.</p>
        <ol>
          <li><a href="https://developers.monzo.com/">Go to https://developers.monzo.com/</a></li>
          <li>Log in using your email address.</li>
          <li>Click the 'New Oauth Client' button</li>
          <li>Fill in the details as per the example below</li>
          <li>Save the form</li>
          <li>Make a note of 'Client ID' and 'Client secret'</li>
        </ol>
        <h3>Oauth Client Details</h3>
        <p>Redirect URLs: <b>https://londoncommute.uk/callback/monzo</b></p>
        <p>Confidentiality: <b>Not Confidential</b></p>
        <p>Logo URL and description are not required.</p>
        <p><b>The below image is correct:</b></p>
        <p><img src="/img/help-monzo.png" alt="" /></p>
      </div>
    )
  }

}

export default Help;
