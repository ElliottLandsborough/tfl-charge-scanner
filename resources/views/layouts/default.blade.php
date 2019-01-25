<!doctype html>
<html>
<head>
    @include('includes.head')
</head>
<body>
    <div id="app"></div>
    <script src="{{ asset('js/app.js') }}?timehash={{ hash('crc32', filemtime(public_path('js/app.js')), false) }}"></script>
    @include('includes.footer')
</body>
</html>
