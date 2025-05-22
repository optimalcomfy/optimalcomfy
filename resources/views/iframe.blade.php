@extends('layouts.app')

@section('content')
    <div class="container">
        <h2>Complete Your Payment</h2>
        <iframe
            src="{{ $iframeUrl }}"
            width="100%"
            height="700"
            frameborder="0"
            allowpaymentrequest
        >
        </iframe>
    </div>
@endsection
