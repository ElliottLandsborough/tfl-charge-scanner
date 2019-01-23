<?php

namespace App\Services;

use stdClass;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException; // 400 level errors

/**
 * Some general monzo api stuff
 * separated into its own class.
 */
class MonzoAuth
{
    private $callBackUrl;
    private $credentials;

    /**
     * Make callbackurl settable by public
     * @param string $url the callback url
     * @return MonzoAuth $this
     */
    public function setCallBackUrl(string $url)
    {
        $this->callBackUrl = $url;

        return $this;
    }

    /**
     * Make $credentials gettable by public
     * @return [object] Usually this is an object that the monzo api returned
     */
    public function getCredentials()
    {
        return $this->credentials;
    }

    /**
     * Setter for credentials
     * @param [type] $credentials [description]
     * @return MonzoAuth $this
     */
    private function setCredentialsFromObject($credentials)
    {
        $this->credentials = $credentials;

        return $this;
    }

    /**
     * Returns the oAuth url to start the auth process
     * @return [string] The url to forward the user to
     */
    public function generateAuthUrl()
    {
        // generate a random string for user verification
        $state = Str::random(64);

        // cache the string for a bit...
        $expiresAt = now()->addHours(1);
        Cache::put($state, 'true', $expiresAt);

        $urlString = 'https://auth.monzo.com/';
        $urlParams = [
            'client_id' => env('MONZO_CLIENT_ID'),
            'redirect_uri' => $this->callBackUrl,
            'response_type' => 'code',
            'state' => $state
        ];

        return $urlString . '?' . http_build_query($urlParams);
    }

    /**
     * Does an oauth request
     * @param [array] $formParams e.g grant_type/client_id/client_secret/
     * @return [object] the response
     */
    private function oauthRequest($formParams)
    {
        // todo - throw exceptions?
        $client = new Client();

        try {
            $response = $client->request('POST', 'https://api.monzo.com/oauth2/token', [
                'form_params' => $formParams
            ]);
        } catch (ClientException $e) {
            die($e->getMessage()); // send message to flash - 400
        }

        $body = $response->getBody();

        $stringBody = (string) $body;

        $object = json_decode($stringBody);

        return $object;
    }

    /**
     * Callback function
     * @param string $state State var to be checked with the cache
     * @param string $code  Code generated at monzo's end
     * @return MonzoAuth $this
     */
    public function setCredentialsFromCallback(string $state, string $code)
    {
        // check if the state is valid (will only be for 1 hour)
        if (!Cache::has($state)) {
            die('Session Expired'); // send message to flash?
        }

        Cache::forget($state); // token has been used, force expiration of local state

        // what we need to send to the monzo api
        $formParams = [
            'grant_type' => 'authorization_code',
            'client_id' => env('MONZO_CLIENT_ID'),
            'client_secret' => env('MONZO_CLIENT_SECRET'),
            'redirect_uri' => $this->callBackUrl,
            'code' => $code
        ];

        // do the request
        $auth = $this->oauthRequest($formParams);

        // add some extra bits to the response
        $auth->created_at = time();
        $auth->refreshed = false;

        // set the creds based on the response
        $this->credentials = $auth;

        return $this;
    }

    /**
     * Check if the creds are going to expire soon
     * Runs whenever js requests a key from the php api
     * @param  [Object] $credentials e.g the creds stored in the session in this example
     * @return MonzoAuth $this
     */
    public function checkExpires($credentials)
    {
        // set the creds in the object
        $this->setCredentialsFromObject($credentials);

        // do we even have a refreshed status set in the creds (true/false)
        if (isset($this->credentials->refreshed)) {
            // date that the creds will expire on
            $dateOfExpiration = $this->credentials->created_at + $this->credentials->expires_in;

            // how long until the creds expire
            $secondsUntilExpiration = $dateOfExpiration - time();

            // how long is 10 mins in seconds?
            $tenMinutesInSeconds = 10 * 60;

            // key has expired and has already been refreshed
            if ($this->credentials->refreshed && $secondsUntilExpiration <= 0) {
                // return blank creds, user needs to re-auth
                // TODO: error or something?
                $this->credentials = new stdClass();
            }

            // key will expire in less than 10 minutes and has never been refreshed
            if (!$this->credentials->refreshed && $secondsUntilExpiration <= $tenMinutesInSeconds) {
                // renew the token
                $this->renewAccessToken();
            }
        }

        return $this;
    }

    /**
     * Renews an access token through the monzo api (can only be done once)
     * @return MonzoAuth $this
     */
    private function renewAccessToken()
    {
        // set some params
        $formParams = [
            'grant_type' => 'refresh_token',
            'client_id' => env('MONZO_CLIENT_ID'),
            'client_secret' => env('MONZO_CLIENT_SECRET'),
            'refresh_token' => $this->credentials->refresh_token
        ];

        // run the query
        $auth = $this->oauthRequest($formParams);

        // set refreshed flag to true, we can't refresh again...
        $auth->created_at = time();
        $auth->refreshed = true;

        // use the response vars as the new creds
        $this->credentials = $auth;

        return $this;
    }
}
