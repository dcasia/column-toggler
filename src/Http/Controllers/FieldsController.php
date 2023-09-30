<?php

declare(strict_types = 1);

namespace DigitalCreative\ColumnToggler\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Laravel\Nova\Fields\Field;
use Laravel\Nova\Http\Requests\ResourceIndexRequest;
use Laravel\Nova\Http\Resources\IndexViewResource;

class FieldsController
{
    public function __invoke(ResourceIndexRequest $request): JsonResponse
    {
        IndexViewResource::make()->authorizedResourceForRequest($request);

        return response()->json([
            'status' => 200,
            'attributes' => $request->newResource()->indexFields($request)->mapWithKeys(fn (Field $field) => [
                $field->attribute => [
                    'label' => $field->name,
                    'visible' => data_get($field->meta(), 'columnToggleVisible', true),
                ],
            ]),
        ]);
    }
}
