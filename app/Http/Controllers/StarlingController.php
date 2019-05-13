<?php

namespace App\Http\Controllers;

use App;
use App\Http\Controllers\MainController;
use App\Services\AuthService;
use App\Services\StarlingAuth;
use Illuminate\Http\Request;

class StarlingController extends MainController
{
    protected $authorizer;

    /**
     * Constructor
     * @param MonzoAuth $monzoAuth The MonzoAuth object.
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
     * Redirect a user to an auth url
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

    public function proxy($endpoint)
    {
        $headers = [
            'Authorization' => app('request')->header('Authorization', false)
        ];

        // super primitive protection
        if (!strlen(trim($endpoint))) {
            die();
        }

        if ($endpoint === 'accounts') {
            $path = '/api/v2/accounts';
        }

        if ($endpoint === 'transactions') {
            //$path = '/api/v1/transactions';
            $accountUid = app('request')->header('accountUid', false);
            $categoryUid = app('request')->header('categoryUid', false);
            $params = [
                'changesSince' => (isset($_GET['since']) ? ($_GET['since']) : null),
            ];
            $params['account_id'] = '1';
            $path = "/api/v2/feed/account/$accountUid/category/$categoryUid?" . http_build_query($params);
        }

        $response = $this->authorizer->apiGetRequest($path, $headers);

        $content = [];

        if (isset($response->accounts) && isset($response->accounts[0])) {
            $content = [
                'accountUid' => $response->accounts[0]->accountUid,
                'defaultCategory' => $response->accounts[0]->defaultCategory,
            ];
        } else if (isset($response->feedItems)) {
            $content = $response->feedItems;
        } else {
            $content = $response;
        }

        return response()->json(['status' => 'success', 'content' => $content]);
    }
}
