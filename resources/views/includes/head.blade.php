<meta charset="utf-8">
<meta name="description" content="">

<meta name="author" content="Elliott Landsborough">
<link rel="author" href="humans.txt" />

<title>Monzo TFL charge scanner</title>

<meta http-equiv="x-ua-compatible" content="ie=edge">
<meta name="description" content="Check your monzo account for london transport charges.">
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

<link rel="apple-touch-icon" href="icon.png">

<link href="{{ asset('css/app.css') }}?timehash={{ hash('crc32', filemtime(public_path('css/app.css')), false) }}" rel="stylesheet">
<meta name="csrf-token" content="{{ csrf_token() }}">
