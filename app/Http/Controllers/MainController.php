<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MainController extends Controller
{
    public function home(Request $request)
    {
        if (!$request->session()->has('monzo_state')) {
            $request->session()->put('monzo_state', Str::random(64));
        }
        $urlString = 'https://auth.monzo.com/';
        $urlParams = [
            'client_id' => env('MONZO_CLIENT_ID'),
            'redirect_uri' => env('MONZO_REDIRECT_URI'),
            'response_type' => 'code',
            'state' => $request->session()->get('monzo_state')
        ];

        $url = $urlString . '?' . http_build_query($urlParams);

        if (isset($_GET['code']) && isset($_GET['state'])) {
            $code = $_GET['code'];
            $state = $_GET['state'];

            if ($state != $request->session()->get('monzo_state')) {
                die('Incorrect State');
            }

            echo $code;

            die;
        }

        return view('pages.home', ['url' => $url]);
    }
}
