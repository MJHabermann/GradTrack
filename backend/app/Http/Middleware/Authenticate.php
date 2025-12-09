<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    /**
     * Get the path the user should be redirected to when they are not authenticated.
     */
    protected function redirectTo(Request $request): ?string
    {
        return $request->expectsJson() ? null : route('login');
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next, ...$guards): mixed
    {
        // For API requests, use sanctum guard
        if ($request->is('api/*')) {
            $guards = ['sanctum'];
        }

        return $this->authenticate($request, $guards) ?: $next($request);
    }
}
