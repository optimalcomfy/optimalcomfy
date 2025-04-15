<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLoanProviderRequest;
use App\Http\Requests\UpdateLoanProviderRequest;
use App\Models\LoanProvider;
use Inertia\Inertia;
use Illuminate\Http\Request;

class LoanProviderController extends Controller
{

    public function index()
    {

        $loanProviders = LoanProvider::paginate(10);

        return Inertia::render('LoanProviders/Index', [
            'loanProviders' => $loanProviders->items(),
            'pagination' => $loanProviders,
            'flash' => session('flash'),
        ]);
    }

    public function create()
    {
        $loanProviders = LoanProvider::all();

        return Inertia::render('LoanProviders/Create', [
            'loanProviders' => $loanProviders,
        ]);
    }

    public function store(StoreLoanProviderRequest $request)
    {
        LoanProvider::create($request->validated());

        return redirect()->route('loanProviders.index')->with('success', 'loan provider created successfully.');
    }


    public function show(LoanProvider $loanProvider)
    {
        return Inertia::render('LoanProviders/Show', [
            'loanProvider' => $loanProvider,
        ]);
    }

    public function edit(LoanProvider $loanProvider)
    {
        $loanProviders = LoanProvider::all();

        return Inertia::render('LoanProviders/Edit', [
            'loanProvider' => $loanProvider,
            'loanProviders' => $loanProviders,
        ]);
    }

    public function update(UpdateLoanProviderRequest $request, LoanProvider $loanProvider)
    {
        $loanProvider->update($request->validated());

        return redirect()->route('loanProviders.index')->with('success', 'loan provider updated successfully.');
    }


    public function destroy(LoanProvider $loanProvider)
    {
        $loanProvider->delete();

        return redirect()->route('loanProviders.index')->with('success', 'loan provider deleted successfully.');
    }
}
