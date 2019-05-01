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
    public function __construct(AuthService $authService, MonzoAuth $authorizer)
    {
        parent::__construct($authService);
        // get vars from config
        $apiClientId = config('monzo.apiClientId');
        $apiSecret = config('monzo.apiSecret');
        $this->authorizer = $authorizer->setCallBackUrl(route('callback.monzo'))->setApiClientId($apiClientId)->setApiSecret($apiSecret);
    }

    /**
     * Redirect a user to an auth url
     * @return [Function] Redirect to auth url.
     */
    public function authUrl(Request $request)
    {
        return redirect($this->setCurrentBankInSession($request, 'monzo')->authorizer->generateAuthUrl('https://auth.monzo.com/'));
    }
}
