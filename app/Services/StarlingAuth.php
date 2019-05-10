<?php

namespace App\Services;

use App;

class StarlingAuth extends AuthService
{
    protected $apiUrl = 'https://api-sandbox.starlingbank.com';
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
