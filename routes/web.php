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
Route::get('/auth', 'MainController@authUrl');
Route::get('/callback', 'MainController@callback')->name('callback');
Route::get('/credentials', 'MainController@credentials')->name('credentials');
// Route::get('/refresh', 'MainController@refresh'); ?
