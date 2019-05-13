<?php

namespace App\Http\Controllers;

use App\Http\Controllers\MainController;
use App\Services\AuthService;
use App\Services\MonzoAuth;
use Illuminate\Http\Request;

class MonzoController extends MainController
{
    protected $authorizer;

    /**
     * Constructor
     * @param MonzoAuth $monzoAuth The MonzoAuth object.
     */
    public function __construct(AuthService $authService, MonzoAuth $authorizer, Request $request)
    {
        parent::__construct($authService);
        // get vars from config
        $apiClientId = config('monzo.apiClientId');
        $apiSecret = config('monzo.apiSecret');

        $postVars = $request->all();

        // if they were posted, add them to the session
        if (isset($postVars['client_id']) && isset($postVars['client_secret']) && strlen(trim($postVars['client_id'])) && strlen(trim($postVars['client_secret']))) {
            $apiClientId = trim($postVars['client_id']);
            $apiSecret = trim($postVars['client_secret']);
            $request->session()->put('client_id', $apiClientId);
            $request->session()->put('client_secret', $apiSecret);
        }

        // if they exist in the session use them instead of values from env
        if ($request->session()->has('client_id') && $request->session()->has('client_secret')) {
            $apiClientId = $request->session()->get('client_id');
            $apiSecret = $request->session()->get('client_secret');
        }

        $this->authorizer = $authorizer->setCallBackUrl(route('callback.monzo'))->setApiClientId($apiClientId)->setApiSecret($apiSecret);
    }

    /**
     * Redirect a user to an auth url
     * @return [Function] Redirect to auth url.
     */
    public function authUrl(Request $request)
    {
        return redirect($this->generateAuthUrl($request));
    }

    /**
     * Generate the auth URL
     */
    public function generateAuthUrl(Request $request)
    {
        return $this->setCurrentBankInSession($request, 'monzo')->authorizer->generateAuthUrl('https://auth.monzo.com/');
    }

    public function authUrlJson(Request $request)
    {
        return response()->json(['status' => 'success', 'url' => $this->generateAuthUrl($request)]);
    }
}
