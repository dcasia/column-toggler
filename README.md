# Column Toggler

[![Latest Version on Packagist](https://img.shields.io/packagist/v/digital-creative/column-toggler)](https://packagist.org/packages/digital-creative/column-toggler)
[![Total Downloads](https://img.shields.io/packagist/dt/digital-creative/column-toggler)](https://packagist.org/packages/digital-creative/column-toggler)
[![License](https://img.shields.io/packagist/l/digital-creative/column-toggler)](https://github.com/dcasia/column-toggler/blob/main/LICENSE)

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/dcasia/column-toggler/main/screenshots/dark.png">
  <img alt="Column Toggler in Action" src="https://raw.githubusercontent.com/dcasia/column-toggler/main/screenshots/light.png">
</picture>

This package provides the ability to toggle columns in the index view of any resource.

# Installation

You can install the package via composer:

```
composer require digital-creative/column-toggler
```

## Basic Usage

Add the `DigitalCreative\ColumnToggler\ColumnTogglerTrait` to all your resources. The best way to do it is to add it directly to your `App\Nova\Resource` class.

```php
namespace App\Nova\Resources;

use DigitalCreative\ColumnToggler\ColumnTogglerTrait;
use Laravel\Nova\Resource as NovaResource;

abstract class Resource extends NovaResource
{
    use ColumnTogglerTrait;
}
```

By default, all columns will be selected/visible on the first page load, however you can define which should be hidden by calling `->hideByDefault()` on any nova field.

```php
public function fieldsForIndex(NovaRequest $request): array
{
    return [
        ID::make()->sortable(),

        Text::make('First Name', 'first_name')
            ->sortable(),

        Text::make('Last Name', 'last_name')
            ->sortable(),

        Text::make('Favorite Color', 'favorite_color')
            ->sortable()
            ->hideByDefault(),

        Boolean::make('Active', 'active')
            ->hideByDefault(),
    ];
}
```

Done, now a new icon will appear in the top right corner of any table resource.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/dcasia/column-toggler/main/screenshots/bar-dark.png">
  <img alt="Column Toggler in Action" src="https://raw.githubusercontent.com/dcasia/column-toggler/main/screenshots/bar-light.png">
</picture>

## Configuration

You can enable / disable column sorting by adding the following to your `config/nova.php` file:

```php
// config/nova.php

'vendors' => [
    'column_toggler' => [
        'enable_sorting' => false,
    ]
]
```

## ⭐️ Show Your Support

Please give a ⭐️ if this project helped you!

### Other Packages You Might Like

- [Nova Welcome Card](https://github.com/dcasia/nova-welcome-card) - A configurable version of the `Help card` that comes with Nova.
- [Icon Action Toolbar](https://github.com/dcasia/icon-action-toolbar) - Replaces the default boring action menu with an inline row of icon-based actions.
- [Expandable Table Row](https://github.com/dcasia/expandable-table-row) - Provides an easy way to append extra data to each row of your resource tables.
- [Collapsible Resource Manager](https://github.com/dcasia/collapsible-resource-manager) - Provides an easy way to order and group your resources on the sidebar.
- [Resource Navigation Tab](https://github.com/dcasia/resource-navigation-tab) - Organize your resource fields into tabs.
- [Resource Navigation Link](https://github.com/dcasia/resource-navigation-link) - Create links to internal or external resources.
- [Nova Mega Filter](https://github.com/dcasia/nova-mega-filter) - Display all your filters in a card instead of a tiny dropdown!
- [Nova Pill Filter](https://github.com/dcasia/nova-pill-filter) - A Laravel Nova filter that renders into clickable pills.
- [Nova Slider Filter](https://github.com/dcasia/nova-slider-filter) - A Laravel Nova filter for picking range between a min/max value.
- [Nova Range Input Filter](https://github.com/dcasia/nova-range-input-filter) - A Laravel Nova range input filter.
- [Nova FilePond](https://github.com/dcasia/nova-filepond) - A Nova field for uploading File, Image and Video using Filepond.
- [Custom Relationship Field](https://github.com/dcasia/custom-relationship-field) - Emulate HasMany relationship without having a real relationship set between resources.
- [Column Toggler](https://github.com/dcasia/column-toggler) - A Laravel Nova package that allows you to hide/show columns in the index view.
- [Batch Edit Toolbar](https://github.com/dcasia/batch-edit-toolbar) - Allows you to update a single column of a resource all at once directly from the index page.

## License

The MIT License (MIT). Please see [License File](https://raw.githubusercontent.com/dcasia/column-toggler/master/LICENSE) for more information.
