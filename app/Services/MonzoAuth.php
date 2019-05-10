<?php

namespace App\Services;

class MonzoAuth extends AuthService
{
    protected $apiUrl = 'https://api.monzo.com';
    protected $tokenPath = '/oauth2/token';
}
