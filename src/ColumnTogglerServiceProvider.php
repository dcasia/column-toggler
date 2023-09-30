<?php

declare(strict_types = 1);

namespace DigitalCreative\ColumnToggler;

use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Laravel\Nova\Events\ServingNova;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Nova;

class ColumnTogglerServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->app->booted(function (): void {
            $this->routes();
        });

        Field::macro('hideByDefault', function () {
            return $this->withMeta([ 'columnToggleVisible' => false ]);
        });

        Nova::serving(function (ServingNova $event): void {

            Nova::script('column-toggler', __DIR__ . '/../dist/js/tool.js');

        });
    }

    protected function routes(): void
    {
        if ($this->app->routesAreCached()) {
            return;
        }

        Route::middleware([ 'nova' ])
            ->prefix('nova-vendor/column-toggler')
            ->group(__DIR__ . '/../routes/api.php');
    }
}
