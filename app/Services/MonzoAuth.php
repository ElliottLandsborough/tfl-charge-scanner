<?php

namespace App\Services;

/**
 * The monzo auth class.
 */
class MonzoAuth extends AuthService
{
    // set the monzo api url
    protected $apiUrl = 'https://api.monzo.com';
    // set the path to monzo oauth
    protected $tokenPath = '/oauth2/token';
}
