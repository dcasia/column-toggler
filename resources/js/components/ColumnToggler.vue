<template>

    <Dropdown
        placement="bottom-end"
        v-if="Object.keys(state).length > 0 && tableToolbar.resources.length > 0">

        <Button
            :variant="isDirty ? 'solid' : 'ghost'"
            padding="tight"
            icon="adjustments-vertical"
            trailing-icon="chevron-down"
            :label="isDirty > 0 ? dirtyCount : ''"
            :aria-label="__('Columns Dropdown')"
        />

        <template #menu>

            <DropdownMenu width="260" class="column-toggler">

                <div class="bg-white dark:bg-gray-900">

                    <div ref="theForm" class="divide-y divide-gray-200 dark:divide-gray-800 divide-solid">

                        <div v-if="isDirty" class="bg-gray-100">

                            <button
                                class="py-2 w-full block text-xs uppercase tracking-wide text-center text-gray-500 dark:bg-gray-800 dark:hover:bg-gray-700 font-bold focus:outline-none"
                                @click="handleRestoreDefaultClick">

                                {{ __('Restore Default') }}

                            </button>

                        </div>

                        <h3 class="p-3 px-4 text-xs uppercase font-bold tracking-wide flex justify-between items-center">
                            {{ __('Toggle Columns') }}
                        </h3>

                        <Draggable
                            v-model="state"
                            :disabled="enableSorting === false"
                            class="flex flex-wrap p-4 space-y-2"
                            item-key="attribute"
                            :animation="150">

                            <template #item="{ element }">

                                <CheckboxWithLabel
                                    class="w-full whitespace-nowrap"
                                    v-if="element.label"
                                    :checked="element.visible"
                                    @click.stop
                                    @input="updateCheckedState(element.attribute, $event.target.checked)">

                                    <div class="flex justify-between flex-1 items-center">

                                        <div>{{ element.label }}</div>

                                        <DragIcon v-if="enableSorting" class="text-gray-200 dark:text-gray-800"/>

                                    </div>

                                </CheckboxWithLabel>

                            </template>

                        </Draggable>

                    </div>

                </div>

            </DropdownMenu>

        </template>

    </Dropdown>

</template>

<script>

    import { getStateFromLocalStorage } from './ColumnToggler'
    import cloneDeep from 'lodash/cloneDeep'
    import Draggable from 'vuedraggable'
    import DragIcon from './DragIcon.vue'
    import { Button } from 'laravel-nova-ui'

    export default {
        name: 'ColumnToggler',
        components: { DragIcon, Draggable, Button },
        props: [ 'tableToolbar' ],
        data() {
            return {
                state: {},
                originalState: {},
                enableSorting: Nova.config('column_toggler').enable_sorting,
            }
        },
        computed: {
            dirtyCount() {

                const indexes = Object.keys(this.state)

                let count = indexes
                    .filter(index => this.state[ index ].attribute !== this.originalState[ index ].attribute)
                    .length ? 1 : 0

                for (const index of indexes) {

                    const original = this.originalState[ index ]
                    const fromState = this.state.find(item => item.attribute === original.attribute)

                    if (original?.visible !== fromState?.visible) {
                        count++
                    }

                }

                return count

            },
            isDirty() {

                for (const index in this.originalState) {

                    const original = this.originalState[ index ]
                    const fromState = this.state.find(element => element.attribute === original.attribute)

                    if (original.attribute !== this.state[ index ].attribute) {
                        return true
                    }

                    if (original?.visible !== fromState?.visible) {
                        return true
                    }

                }

                return false

            },
        },
        watch: {
            async 'tableToolbar.resources'(resources) {

                const attributes = resources[ 0 ]?.columnToggler

                if (attributes) {

                    let localStorageState = await getStateFromLocalStorage(this.tableToolbar.resourceName)
                    if (localStorageState && this.isDifferentState(attributes, localStorageState)) {
                        localStorageState = attributes
                    }

                    this.originalState = cloneDeep(attributes)
                    this.state = localStorageState ?? attributes

                }

            },
            state: {
                deep: true,
                handler(state) {
                    Nova.$emit(`column-toggler:state-changed:${ [ this.tableToolbar.resourceName, this.tableToolbar.lens, this.tableToolbar.actionQueryString?.viaRelationship ].filter(Boolean).join('/') }`, state)
                },
            },
        },
        methods: {
            isDifferentState(state, cacheState) {

                if (!Array.isArray(state) || !Array.isArray(cacheState) || typeof state !== typeof cacheState) {
                    return true
                }

                const stateKeys = state.map(state => state.attribute)
                const cacheStateKeys = cacheState.map(state => state.attribute)

                if (stateKeys.length !== cacheStateKeys.length) {
                    return true
                }

                return stateKeys.some(key => !cacheStateKeys.includes(key))

            },
            handleRestoreDefaultClick() {
                this.state = cloneDeep(this.originalState)
            },
            updateCheckedState(attribute, checked) {

                const state = this.state.find(element => element.attribute === attribute)

                if (state) {
                    state.visible = checked
                }

            },
        },
    }

</script>

<style>

    .column-toggler ~ div {
        @apply ml-1
    }

</style>
