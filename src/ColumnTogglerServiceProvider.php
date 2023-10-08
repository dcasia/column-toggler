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
        Field::macro('hideByDefault', function () {
            return $this->withMeta([ 'columnToggleVisible' => false ]);
        });

        Nova::serving(function (ServingNova $event): void {
            Nova::script('column-toggler', __DIR__ . '/../dist/js/tool.js');
        });
    }
}
