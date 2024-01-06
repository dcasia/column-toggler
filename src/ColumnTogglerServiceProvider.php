<?php

declare(strict_types = 1);

namespace DigitalCreative\ColumnToggler;

use Illuminate\Support\ServiceProvider;
use Laravel\Nova\Events\ServingNova;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Nova;

class ColumnTogglerServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        Field::macro('hideByDefault', function ($hiddenByDefault = true) {
            return $this->withMeta([ 'columnToggleVisible' => !$hiddenByDefault ]);
        });

        Nova::serving(function (ServingNova $event): void {

            Nova::provideToScript([
                'column_toggler' => config('nova.vendors.column_toggler'),
            ]);

            Nova::script('column-toggler', __DIR__ . '/../dist/js/tool.js');
            Nova::style('column-toggler', __DIR__ . '/../dist/css/tool.css');

        });
    }

    public function register(): void
    {
        $this->mergeConfigFrom(
            __DIR__ . '/../config/nova.php', 'nova.vendors.column_toggler',
        );
    }
}
