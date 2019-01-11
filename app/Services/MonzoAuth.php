<?php

namespace App\Services;

use stdClass;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException; // 400 level errors

class MonzoAuth
{
    private $callBackUrl;
    private $credentials;

    public function __construct(string $url)
    {
        $this->callBackUrl = $url;
    }

    public function getCredentials()
    {
        return $this->credentials;
    }

    public function setCredentialsFromObject($credentials)
    {
        $this->credentials = $credentials;
    }

    public function generateAuthUrl()
    {
        $state = Str::random(64);

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

    // todo - throw exceptions?
    private function oauthRequest($formParams)
    {
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

    public function setCredentialsFromCallback(string $state, string $code)
    {
        if (!Cache::has($state)) {
            die('Session Expired'); // send message to flash?
        }

        $formParams = [
            'grant_type' => 'authorization_code',
            'client_id' => env('MONZO_CLIENT_ID'),
            'client_secret' => env('MONZO_CLIENT_SECRET'),
            'redirect_uri' => $this->callBackUrl,
            'code' => $code
        ];

        $auth = $this->oauthRequest($formParams);

        Cache::forget($state); // token has been used, force expiration of local state

        $auth->created_at = time();
        $auth->refreshed = false;

        $this->credentials = $auth;

        return $this;
    }

    public function checkExpires($credentials)
    {
        $this->setCredentialsFromObject($credentials);

        if (isset($this->credentials->refreshed)) {
            $dateOfExpiration = $this->credentials->created_at + $this->credentials->expires_in;
            $secondsUntilExpiration = $dateOfExpiration - time();
            $tenMinutesInSeconds = 10 * 60;

            // key has expired and has already been refreshed
            if ($this->credentials->refreshed && $secondsUntilExpiration <= 0) {
                $this->credentials = new stdClass();
            }

            // key will expire in less than 10 minutes and has never been refreshed
            if (!$this->credentials->refreshed && $secondsUntilExpiration <= $tenMinutesInSeconds) {
                $this->renewAccessToken();
            }
        }

        return $this;
    }

    private function renewAccessToken()
    {
        $formParams = [
            'grant_type' => 'refresh_token',
            'client_id' => env('MONZO_CLIENT_ID'),
            'client_secret' => env('MONZO_CLIENT_SECRET'),
            'refresh_token' => $this->credentials->refresh_token
        ];

        $auth = $this->oauthRequest($formParams);

        $auth->created_at = time();
        $auth->refreshed = true;

        $this->credentials = $auth;

        return $this;
    }
}
