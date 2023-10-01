<template>

    <ColumnToggler :resource-name="resourceName"/>

    <OriginalFilterMenu
        v-bind="$props"
        @clear-selected-filters="$emit('clear-selected-filters', $event)"
        @filter-changed="$emit('filter-changed', $event)"
        @trashed-changed="$emit('trashed-changed', $event)"
        @per-page-changed="$emit('per-page-changed', $event)"
    />

</template>

<script>

    import OriginalFilterMenu from '@/components/FilterMenu.vue'
    import ColumnToggler from './ColumnToggler.vue'

    export default {
        name: 'FilterMenu',
        emits: OriginalFilterMenu.emits,
        props: OriginalFilterMenu.props,
        components: { OriginalFilterMenu, ColumnToggler },
    }

</script>
