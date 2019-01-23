<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\MonzoAuth;
use Illuminate\Http\Request;

class MainController extends Controller
{
    private $monzoAuth;

    /**
     * Constructor
     * @param MonzoAuth $monzoAuth The MonzoAuth object.
     */
    public function __construct(MonzoAuth $monzoAuth)
    {
        $this->monzoAuth = $monzoAuth->setCallBackUrl(route('callback'));
    }

    /**
     * Home page
     * @return Function view() Render the home view.
     */
    public function home()
    {
        return view('pages.home', ['url' => url('/auth')]);
    }

    /**
     * Redirect a user to an auth url
     * @return [Function] Redirect to auth url.
     */
    public function authUrl()
    {
        return redirect($this->monzoAuth->generateAuthUrl());
    }

    /**
     * Callback url
     * @param  Request $request
     * @return Function redirect() Redirect to home
     */
    public function callback(Request $request)
    {
        $credentials = $this->monzoAuth->setCredentialsFromCallback($request->query('state'), $request->query('code'))->getCredentials();

        $request->session()->put('monzo_auth', $credentials);

        return redirect('/');
    }

    /**
     * Returns the credentials in a json array
     * @param  Request $request
     * @return Function response() Returns json reponse object
     */
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

    /**
     * Logs a user out
     * @param  Request $request
     * @return 200 response with json array
     */
    public function logout(Request $request)
    {
        // remove all session vars
        $request->session()->forget('monzo_auth');
        $request->session()->flush();

        return response()->json(['status' => 'success']);
    }
}
