<?php

namespace App\Services;

use App;

/**
 * The Starling auth class
 */
class StarlingAuth extends AuthService
{
    // sandbox api url
    protected $apiUrl = 'https://api-sandbox.starlingbank.com';
    // path to oauth
    protected $tokenPath = '/oauth/access-token';

    public function __construct()
    {
        parent::__construct();

        // switch to production api endpoint when needed
        if (App::environment('production')) {
            $this->apiUrl = 'https://api.starlingbank.com';
        }
    }
}
