<?php

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', 'MainController@home')->name('home');
Route::get('/help/monzo', 'MainController@home')->name('help.monzo');
Route::get('/help/starling', 'MainController@home')->name('help.starling');
Route::get('/logout', 'MainController@logout')->name('logout');
Route::get('/credentials', 'MainController@credentials')->name('credentials');

// monzo
Route::get('/auth/monzo', 'MonzoController@authUrl')->name('auth.monzo');
Route::post('/auth/monzo', 'MonzoController@authUrlJson')->name('auth.monzo.post');
Route::get('/callback/monzo', 'MonzoController@callback')->name('callback.monzo');
Route::get('/credentials/monzo', 'MonzoController@credentials')->name('credentials.monzo');

// starling
Route::get('/auth/starling', 'StarlingController@authUrl')->name('auth.starling');
Route::get('/callback/starling', 'StarlingController@callback')->name('callback.starling');
Route::get('/credentials/starling', 'StarlingController@credentials')->name('credentials.starling');
Route::get('/apiproxy/starling/{endpoint}', 'StarlingController@proxy')->name('apiproxy.starling');
