<?php

declare(strict_types = 1);

namespace DigitalCreative\ColumnToggler;

use Laravel\Nova\Fields\Field;
use Laravel\Nova\Fields\FieldCollection;
use Laravel\Nova\Http\Requests\NovaRequest;
use Laravel\Nova\Resource;

/**
 * @mixin Resource
 */
trait ColumnTogglerTrait
{
    public function indexFields(NovaRequest $request): FieldCollection
    {
        return parent::indexFields($request)->when(
            value: $request->has('column-toggler') && !$request->routeIs('nova.column-toggler.fields'),
            callback: function (FieldCollection $fields) use ($request) {

                $value = $request->input('column-toggler');

                /**
                 * If the value is a boolean we return all fields, since this is the very first request
                 * we don't have any columns to filter by yet.
                 */
                if ($value === 'true') {

                    return $fields->filter(function (Field $field) {
                        return data_get($field->meta(), 'columnToggleVisible', true);
                    });

                }

                if ($value === 'false') {
                    return new FieldCollection();
                }

                $columns = collect(json_decode(base64_decode($value)));

                return $fields->filter(function (Field $field) use ($columns) {
                    return $columns->contains($field->attribute);
                });

            },
        );
    }
}
