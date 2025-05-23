@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Payment Successful</h2>
    <p>{{ session('message') }}</p>
    <p>You can now login to verify.</p>
</div>
@endsection
