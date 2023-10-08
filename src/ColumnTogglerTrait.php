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
    public function serializeForIndex(NovaRequest $request, $fields = null): array
    {
        $indexFields = $fields ?? parent::indexFields($request);

        $columns = $indexFields->mapWithKeys(fn (Field $field) => [
            $field->attribute => [
                'label' => $field->name,
                'visible' => data_get($field->meta(), 'columnToggleVisible', true),
            ],
        ]);

        return array_merge(parent::serializeForIndex($request, $this->filterFields($request, $indexFields)), [
            'columnToggler' => $columns,
        ]);
    }

    public function indexFields(NovaRequest $request): FieldCollection
    {
        return $this->filterFields($request, parent::indexFields($request));
    }

    private function filterFields(NovaRequest $request, FieldCollection $fields): FieldCollection
    {
        return $fields->when(
            value: $request->has('columnToggler') && !$request->routeIs('nova.column-toggler.fields'),
            callback: function (FieldCollection $fields) use ($request) {

                $value = $request->input('columnToggler');

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
        )->values();
    }
}
