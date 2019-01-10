<?php

namespace App\Services;

use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException; // 400 level errors

class MonzoAuth
{
    public function generateAuthUrl(string $url)
    {
        $state = Str::random(64);

        $expiresAt = now()->addHours(1);
        Cache::put($state, 'true', $expiresAt);

        $urlString = 'https://auth.monzo.com/';
        $urlParams = [
            'client_id' => env('MONZO_CLIENT_ID'),
            'redirect_uri' => $url,
            'response_type' => 'code',
            'state' => $state
        ];

        return $urlString . '?' . http_build_query($urlParams);
    }

    // todo - throw exceptions? - much more error handling
    public function getCredentialsFromCallback(string $state, string $code, string $url)
    {
        if (!Cache::has($state)) {
            die('Session Expired'); // send message to flash
        }

        $form_params = [
            'grant_type' => 'authorization_code',
            'client_id' => env('MONZO_CLIENT_ID'),
            'client_secret' => env('MONZO_CLIENT_SECRET'),
            'redirect_uri' => $url,
            'code' => $code
        ];

        $client = new Client();

        try {
            $response = $client->request('POST', 'https://api.monzo.com/oauth2/token', [
                'form_params' => $form_params
            ]);

            Cache::forget($state); // token has been used, force expiration of local state
        } catch (ClientException $e) {
            die($e->getMessage()); // send message to flash - 400
        }

        $body = $response->getBody();

        $stringBody = (string) $body;

        $auth = json_decode($stringBody);

        $auth->created_at = time();

        return $auth;
    }
}
