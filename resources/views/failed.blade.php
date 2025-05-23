@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Payment Failed</h2>
    <p>{{ session('error') }}</p>
</div>
@endsection
