@extends('layouts.app')

@section('content')
<div class="container">
    <h2>Payment Successful</h2>
    <p>{{ session('message') }}</p>
    <p>You can now login to verify.</p>
    <a href="{{ route('login') }}" class="btn btn-primary mt-3" target="_blank">Login in New Tab</a>

    <script>
        // Redirect the parent window to login page (closes iframe view by navigating parent)
        window.top.location.href = "{{ route('login') }}";
    </script>
</div>
@endsection
