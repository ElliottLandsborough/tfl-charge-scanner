<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use GuzzleHttp\Client;

class MainController extends Controller
{
    public function home(Request $request)
    {
        if (!$request->session()->has('monzo_state')) {
            $request->session()->put('monzo_state', Str::random(64));
        }
        $urlString = 'https://auth.monzo.com/';
        $urlParams = [
            'client_id' => env('MONZO_CLIENT_ID'),
            'redirect_uri' => env('MONZO_REDIRECT_URI'),
            'response_type' => 'code',
            'state' => $request->session()->get('monzo_state')
        ];

        $url = $urlString . '?' . http_build_query($urlParams);

        if (isset($_GET['code']) && isset($_GET['state'])) {
            $code = $_GET['code'];
            $state = $_GET['state'];

            if ($state != $request->session()->get('monzo_state')) {
                die('Incorrect State');
            }

            $form_params = [
                'grant_type' => 'authorization_code',
                'client_id' => env('MONZO_CLIENT_ID'),
                'client_secret' => env('MONZO_CLIENT_SECRET'),
                'redirect_uri' => env('MONZO_REDIRECT_URI'),
                'code' => $code
            ];

            $response = (new client())->request('POST', 'https://api.monzo.com/oauth2/token', [
                'form_params' => $form_params
            ]);

            $body = $response->getBody();

            $stringBody = (string) $body;

            $auth = json_decode($stringBody);

            $auth->time = time();

            $request->session()->put('monzo_auth', $auth);
        }

        // auth exists, try to do an api request
        if ($request->session()->has('monzo_auth')) {
            $monzo_auth = $request->session()->get('monzo_auth');

            $response = (new client())->request('GET', 'https://api.monzo.com/accounts', [
                'headers' => [
                    'Authorization' => 'Bearer ' . $monzo_auth->access_token
                ]
            ]);

            $body = $response->getBody();

            $stringBody = (string) $body;

            $response = json_decode($stringBody);

            foreach ($response->accounts as $account) {
                if ($account->type == 'uk_retail') {
                    $account_id = $account->id;
                }
            }

            $response = (new client())->request('GET', "https://api.monzo.com/transactions?account_id=$account_id", [
                'headers' => [
                    'Authorization' => 'Bearer ' . $monzo_auth->access_token
                ]
            ]);

            $body = $response->getBody();

            $stringBody = (string) $body;

            $response = json_decode($stringBody);

            $transactions = [];

            foreach ($response->transactions as $transaction) {
                // detect tfl
                if (isset($transaction->metadata->notes) && strpos(strtolower($transaction->metadata->notes), 'travel charge for') !== false) {

                    $year = substr($transaction->created, 0, 4);
                    $month = substr($transaction->created, 5, 2);

                    if (!isset($transactions[$year])) $transactions[$year] = [];
                    if (!isset($transactions[$year . ' average'])) $transactions[$year . ' average'] = 0;
                    if (!isset($transactions[$year . ' total'])) $transactions[$year . ' total'] = 0;
                    if (!isset($transactions[$year][$month])) $transactions[$year][$month] = 0;

                    $transactions[$year . ' average'] += ($transaction->amount / 100 / 12 * -1);
                    $transactions[$year . ' total'] += ($transaction->amount / 100 * -1);
                    $transactions[$year][$month] += ($transaction->amount / 100 * -1);
                }
            }

            print_r($transactions);

            die;
        }

        return view('pages.home', ['url' => $url]);
    }
}
