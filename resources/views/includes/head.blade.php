@php
$title = 'Monzo TFL charge checker';
$description = 'Check your monzo account for London transport charges';
@endphp

<meta charset="utf-8">

<title>{!! $title !!}</title>
<meta name="description" content="{!! $description !!}">

<meta name="author" content="Elliott Landsborough">
<link rel="author" href="humans.txt" />

<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<link rel="apple-touch-icon" href="icon.png">

<link href="{{ asset('css/app.css') }}?timehash={{ hash('crc32', filemtime(public_path('css/app.css')), false) }}" rel="stylesheet">
<meta name="csrf-token" content="{{ csrf_token() }}">

{{-- Twitter Card data --}}
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@elliottlan">
<meta name="twitter:title" content="{!! $title !!}">
<meta name="twitter:description" content="{!! $description !!}">
<meta name="twitter:creator" content="@elliottlan">
{{-- Twitter summary card with large image must be at least 280x150px --}}
<meta name="twitter:image:src" content="{!! url('/img/preview.1200x675.png?bust=201904301033') !!}">

{{-- Open Graph data --}}
<meta property="og:title" content="{!! $title !!}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="{!! url('/') !!}" />
<meta property="og:image" content="{!! url('/img/preview.1200x630.png?bust=201904301033') !!}" />
<meta property="og:description" content="{!! $description !!}" />
<meta property="og:site_name" content="LondonCommute.uk" />
{{--<meta property="fb:admins" content="Facebook numberic ID" />--}}
