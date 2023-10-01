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
        extends: OriginalFilterMenu,
        name: 'FilterMenu',
        components: { OriginalFilterMenu, ColumnToggler },
        data() {
            return {
                state: {},
                originalState: {},
            }
        },
        mounted() {

            Nova.request().get('/nova-vendor/column-toggler/fields/' + this.resourceName).then(({ data }) => {

                let localStorageState = getStateFromLocalStorage(this.cacheKey)

                if (localStorageState && this.isDifferentState(data.attributes, localStorageState)) {

                    localStorageState = data.attributes

                    Nova.$emit('refresh-resources')

                }

                this.originalState = JSON.parse(JSON.stringify(data.attributes))
                this.state = localStorageState ?? data.attributes

            })

        },
        computed: {
            cacheKey() {
                return `${ this.resourceName }-columns-toggler`
            },
            dirtyCount() {
                return Object.keys(this.state).filter(key => this.state[ key ].visible !== this.originalState[ key ].visible).length
            },
            isDirty() {

                for (const key in this.originalState) {

                    if (this.originalState[ key ].visible !== this.state[ key ].visible) {
                        return true
                    }

                }

                return false

            },
        },
        watch: {
            state: {
                handler(state) {
                    saveStateToLocalStorage(state, this.cacheKey)
                },
                deep: true,
            },
        },
        methods: {
            isDifferentState(state, cacheState) {

                const stateKeys = Object.keys(state)
                const cacheStateKeys = Object.keys(cacheState)

                if (stateKeys.length !== cacheStateKeys.length) {
                    return true
                }

                return stateKeys.some(key => !cacheStateKeys.includes(key))

            },
            handleRestoreDefaultClick() {

                this.state = JSON.parse(JSON.stringify(this.originalState))

                Nova.$emit('refresh-resources')

            },
            updateCheckedState(attribute, checked) {

                this.state[ attribute ].visible = checked

                Nova.$emit('refresh-resources')

            },
        },
    }

</script>
