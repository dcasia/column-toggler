<template>

    <Dropdown
        :handle-internal-clicks="false"
        class="flex h-9 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        :class="{
            'bg-primary-500 hover:bg-primary-600 border-primary-500': isDirty,
            'dark:bg-primary-500 dark:hover:bg-primary-600 dark:border-primary-500': isDirty,
        }">

        <span class="sr-only">{{ __('Columns Dropdown') }}</span>

        <DropdownTrigger
            class="toolbar-button px-2"
            :class="{ 'text-white hover:text-white dark:text-gray-800 dark:hover:text-gray-800': isDirty }">

            <Icon type="adjustments"/>

            <span v-if="isDirty"
                  :class="{ 'text-white dark:text-gray-800': isDirty }"
                  class="ml-2 font-bold">

                {{ dirtyCount }}

            </span>

        </DropdownTrigger>

        <template #menu>

            <DropdownMenu width="260">

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

                        <div class="flex flex-wrap p-4 space-y-1">

                            <CheckboxWithLabel
                                class="w-full leading-none whitespace-nowrap mr-4"
                                v-for="({ label, visible }, attribute) in state"
                                :checked="visible"
                                @input="updateCheckedState(attribute, $event.target.checked)">

                                <span>{{ label }}</span>

                            </CheckboxWithLabel>

                        </div>

                    </div>

                </div>

            </DropdownMenu>

        </template>

    </Dropdown>

</template>

<script>

    import { getStateFromLocalStorage } from './ColumnToggler'
    import cloneDeep from 'lodash/cloneDeep'

    export default {
        name: 'ColumnToggler',
        props: [ 'resourceName' ],
        data() {
            return {
                extraParams: {},
                state: {},
                originalState: {},
            }
        },
        mounted() {

            Nova.$on('custom-relationship-field:extra-params', this.appendToRequestCallback)
            Nova.$emit('custom-relationship-field:request-extra-params')

            const queryString = new URLSearchParams(this.extraParams)

            Nova.request().get(`/nova-vendor/column-toggler/fields/${ this.resourceName }?${ queryString }`).then(({ data }) => {

                let localStorageState = getStateFromLocalStorage(this.resourceName)

                if (localStorageState && this.isDifferentState(data.attributes, localStorageState)) {
                    localStorageState = data.attributes
                }

                this.originalState = cloneDeep(data.attributes)
                this.state = localStorageState ?? data.attributes

            })

        },
        unmounted() {
            Nova.$off('custom-relationship-field:extra-params', this.appendToRequestCallback)
        },
        computed: {
            dirtyCount() {

                return Object
                    .keys(this.state)
                    .filter(key => this.state[ key ].visible !== this.originalState[ key ].visible).length

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
                deep: true,
                handler(state) {
                    Nova.$emit(`column-toggler:state-changed:${ this.resourceName }`, state)
                },
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
                this.state = cloneDeep(this.originalState)
            },
            updateCheckedState(attribute, checked) {
                this.state[ attribute ].visible = checked
            },
            appendToRequestCallback(params) {
                this.extraParams = { ...this.extraParams, ...params }
            },
        },
    }

</script>

<style>

    #column-toggler ~ div {
        margin-left: .5rem;
    }

</style>
