<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\MonzoAuth;
use Illuminate\Http\Request;

class MainController extends Controller
{
    private $monzoAuth;

    public function __construct()
    {
        $this->monzoAuth = new MonzoAuth(route('callback'));
    }

    public function home()
    {
        return view('pages.home', ['url' => url('/auth')]);
    }

    public function authUrl()
    {
        return redirect($this->monzoAuth->generateAuthUrl());
    }

    public function callback(Request $request)
    {
        $credentials = $this->monzoAuth->setCredentialsFromCallback($request->query('state'), $request->query('code'))->getCredentials();

        $request->session()->put('monzo_auth', $credentials);

        return redirect('/');
    }

    public function credentials(Request $request)
    {
        $array = [];

        if ($request->session()->has('monzo_auth')) {
            $credentials = $this->monzoAuth->checkExpires($request->session()->get('monzo_auth'))->getCredentials();

            if ((array) $credentials != (array) $request->session()->get('monzo_auth')) {
                $request->session()->put('monzo_auth', $credentials);
            }
        }

        if (isset($credentials->access_token)) {
            $array['access_token'] = $credentials->access_token;
        }

        return response()->json($array);
    }

    public function logout(Request $request)
    {
        $request->session()->forget('monzo_auth');

        return response()->json([]);
    }
}
