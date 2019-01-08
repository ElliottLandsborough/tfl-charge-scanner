<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Services\MonzoAuth;
use Illuminate\Http\Request;

class MainController extends Controller
{
    private $monzoAuth;

    public function __construct( $monzoAuth)
    {
        $this->monzoAuth = new MonzoAuth(route('callback'));
    }

    public function home()
    {
        return view('pages.home', ['url' => url('/auth')]);
    }

    public function beginAuth()
    {
        return redirect($this->monzoAuth->generateAuthUrl(route('callback')));
    }

    public function callback(Request $request)
    {
        $credentials = $this->monzoAuth->getCredentialsFromCallback($request->query('state'), $request->query('code'), route('callback'));

        $request->session()->put('monzo_auth', $credentials);

        return redirect('/');
    }

    public function credentials(Request $request)
    {
        $array = [];

        if ($request->session()->has('monzo_auth')) {
            $array = $request->session()->get('monzo_auth');
        }

        return response()->json($array);
    }
}
