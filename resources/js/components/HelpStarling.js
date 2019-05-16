// resources/assets/js/components/HelpStarling.js

import React, {Component} from 'react'
import { Link } from 'react-router-dom'

/**
 * Help page for monzo api keys
 */
class HelpStarling extends Component {
  render() {
    return (
      <div class="help-container">
        <h2>Where is my Starling Personal Access Token?</h2>
        <p>Starling makes it hard for non-businesses to get their app onto the store and working with the normal Oauth flow but is is possible to give a single application certain permissions very easily.</p>
        <ol>
          <li>Go to <a href="https://developer.starlingbank.com/" target="_blank">https://developer.starlingbank.com</a></li>
          <li>Log in using your email address (you will need to register if you have not yet done so).</li>
          <li>Click the 'Personal access' button.</li>
          <li>Click the 'Create token' button.</li>
          <li>Set the 'Token Name' to londoncommute.uk (it can be set to anything you want).</li>
          <li>Fill in the permissions as per the example below (only <b>account:read</b> and <b>transaction:read</b> need to be selected).</li>
          <li>Save the form using the 'Create' button at the bottom of the page.</li>
          <li>Make a note of the access token in the box.</li>
        </ol>
        <p><b>The 'Personal access' button:</b></p>
        <p><img src="/img/help-starling-menu.png" alt="The 'Personal access' button" /></p>
        <p><b>The 'Create token' button:</b></p>
        <p><img src="/img/help-starling-create-token.png" alt="The 'Create token' button" /></p>
        <p><b>Permissions selection: account:read, transaction:read:</b></p>
        <p><img src="/img/help-starling-permissions.png" alt="Permissions selection: account:read, transaction:read" /></p>
        <p><b>The 'Create' button at the bottom of the page:</b></p>
        <p><img src="/img/help-starling-create-button.png" alt="The 'Create' button at the bottom of the page" /></p>
        <p><b>Example of working configuration:</b></p>
        <p><img src="/img/help-starling-working-example.png" alt="Example of working configuration" /></p>
      </div>
    )
  }
}

export default HelpStarling;
