<?php

namespace App\Http\Controllers;

use App;
use App\Services\AuthService;
use App\Services\StarlingAuth;
use Illuminate\Http\Request;

class StarlingController extends MainController
{
    protected $authorizer;

    /**
     * Constructor.
     *
     * @param AuthService  $authService The AuthService object.
     * @param StarlingAuth $authorizer  The authorizer object.
     */
    public function __construct(AuthService $authService, StarlingAuth $authorizer)
    {
        parent::__construct($authService);
        // get vars from config
        $apiClientId = config('starling.apiClientId');
        $apiSecret = config('starling.apiSecret');
        $this->authorizer = $authorizer->setCallBackUrl(route('callback.starling'))->setApiClientId($apiClientId)->setApiSecret($apiSecret);
    }

    /**
     * Redirect a user to an auth url.
     *
     * @return [Function] Redirect to auth url.
     */
    public function authUrl(Request $request)
    {
        $url = 'https://oauth.starlingbank.com/';
        if (!App::environment('production')) {
            $url = 'https://oauth-sandbox.starlingbank.com/';
        }

        return redirect($this->setCurrentBankInSession($request, 'starling')->authorizer->generateAuthUrl($url));
    }

    /**
     * So, starlings API auth is not compatible with CORS so I am proxying my calls through php :*(.
     *
     * @param [String] $endpoint The endpoint name e.g 'accounts'
     *
     * @return [Function] Json Response
     */
    public function proxy($endpoint = '')
    {
        // get the auth headers
        $headers = [
            'Authorization' => app('request')->header('Authorization', false),
        ];

        // super primitive protection, die if there's no endpoint picked
        if (!strlen(trim($endpoint))) {
            die('Error: No endpoint defined.');
        }

        // the accounts path
        if ($endpoint === 'accounts') {
            $path = '/api/v2/accounts';
        }

        // the transactions path
        if ($endpoint === 'transactions') {
            // some extra headers posted
            $accountUid = app('request')->header('accountUid', false);
            $categoryUid = app('request')->header('categoryUid', false);

            // 'since' from get params
            $params = [
                'changesSince' => (isset($_GET['since']) ? ($_GET['since']) : null),
            ];

            // generate the URL
            $path = "/api/v2/feed/account/$accountUid/category/$categoryUid?".http_build_query($params);
        }

        // run the get request with the headers and the url
        $response = $this->authorizer->apiGetRequest($path, $headers);

        // empty default content
        $content = [];

        // were accounts returned?
        if (isset($response->accounts) && isset($response->accounts[0])) {
            // grab the first account for now
            // TODO: is this right? do we want multiple accounts? or maybe account detection?
            $content = [
                'accountUid'      => $response->accounts[0]->accountUid,
                'defaultCategory' => $response->accounts[0]->defaultCategory,
            ];
        } elseif (isset($response->feedItems)) {
            // transactions were returned
            $content = $response->feedItems;
        } else {
            // default to whatever was returned
            $content = $response;
        }

        // return json
        return response()->json(['status' => 'success', 'content' => $content]);
    }
}
