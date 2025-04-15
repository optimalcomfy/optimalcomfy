<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreNotificationRequest;
use App\Http\Requests\UpdateNotificationRequest;
use App\Models\Notification;
use App\Models\User;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{

    public function index(Request $request)
    {
        $user = Auth::user();
    
        $query = Notification::with('user');
    
        if ($user->role_id == 2) {
            $query->whereHas('user', function ($q) use ($user) {
                $q->where('company_id', '=', $user->company_id);
            });
        } elseif ($user->role_id == 3) {
            $query->where('user_id', '=', $user->id);
        }
    
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->whereHas('user', function ($q) use ($search) {
                $q->where('name', 'LIKE', "%$search%")
                  ->orWhere('email', 'LIKE', "%$search%");
            });
        }

        $query->orderBy('created_at', 'desc');
    
        $notifications = $query->paginate(10);
    
        return Inertia::render('Notifications/Index', [
            'notifications' => $notifications->items(),
            'pagination' => $notifications,
            'flash' => session('flash'),
        ]);
    }
    

    public function create()
    {
        $notifications = Notification::all();
        $users = User::all();

        return Inertia::render('Notifications/Create', [
            'notifications' => $notifications,
            'users'=> $users
        ]);
    }

    public function store(StoreNotificationRequest $request)
    {
        Notification::create($request->validated());

        return redirect()->route('notifications.index')->with('success', 'Notification created successfully.');
    }


    public function show(Notification $notification)
    {
        return Inertia::render('Notifications/Show', [
            'notification' => $notification,
        ]);
    }

    public function edit(Notification $notification)
    {
        $notifications = Notification::all();
        $users = User::all();

        return Inertia::render('Notifications/Edit', [
            'notification' => $notification,
            'notifications' => $notifications,
            'users'=>$users
        ]);
    }

    public function update(UpdateNotificationRequest $request, Notification $notification)
    {
        $notification->update($request->validated());

        return redirect()->route('notifications.index')->with('success', 'Notification updated successfully.');
    }


    public function destroy(Notification $notification)
    {
        $notification->delete();

        return redirect()->route('notifications.index')->with('success', 'Notification deleted successfully.');
    }
}
