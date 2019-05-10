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

        var_dump($this->authorizer->apiGetRequest($path, $headers));
    }
}
