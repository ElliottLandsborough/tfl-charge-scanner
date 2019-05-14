<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\AuthService;
use Illuminate\Http\Request;

class MainController extends Controller
{
    protected $authorizer;

    /**
     * Constructor
     * @param AuthService $authorizer The AuthService object.
     */
    public function __construct(AuthService $authorizer)
    {
        $this->authorizer = $authorizer;
    }

    /**
     * Home page
     * @return Function view() Render the home view.
     */
    public function home()
    {
        return view('pages.home');
    }

    /**
     * Redirect a user to an auth url
     * @return [Function] Redirect to auth url.
     */
    public function authUrl(Request $request)
    {
    }

    /**
     * Set the current bank name in the session
     * @param  String $currentBank
     * @return App\Http\Controllers\MainController $this
     */
    public function setCurrentBankInSession(Request $request, string $currentBank)
    {
        $request->session()->put('current_bank', $currentBank);

        return $this;
    }

    /**
     * Callback url
     * @param  Request $request
     * @return Function redirect() Redirect to home
     */
    public function callback(Request $request)
    {
        $credentials = $this->authorizer->setCredentialsFromCallback($request->query('state'), $request->query('code'))->getCredentials();

        $request->session()->put('auth_credentials', $credentials);

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

        if ($request->session()->has('auth_credentials')) {
            $credentials = $this->authorizer->checkExpires($request->session()->get('auth_credentials'))->getCredentials();

            if ((array) $credentials != (array) $request->session()->get('auth_credentials')) {
                $request->session()->put('auth_credentials', $credentials);
            }
        }

        if (isset($credentials->access_token)) {
            $array['current_bank'] = ($request->session()->has('current_bank') ? $request->session()->get('current_bank') : false);
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
        $request->session()->forget('current_bank');
        $request->session()->forget('auth_credentials');
        $request->session()->flush();

        return response()->json(['status' => 'success']);
    }
}
