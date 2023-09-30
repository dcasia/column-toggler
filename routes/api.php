<?php

declare(strict_types = 1);

use DigitalCreative\ColumnToggler\Http\Controllers\FieldsController;
use Illuminate\Support\Facades\Route;

Route::get('/fields/{resource}', FieldsController::class)->name('nova.column-toggler.fields');
