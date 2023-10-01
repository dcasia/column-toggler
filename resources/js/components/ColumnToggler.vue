<template>

    <Dropdown
        :handle-internal-clicks="false"
        class="flex h-9 hover:bg-gray-100 dark:hover:bg-gray-700 rounded mr-2"
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

    const novaRequest = Nova.request

    const interceptors = []
    const interceptorsInstance = []
    const columnAttributeName = 'columnToggler'

    Nova.request = (...params) => {

        for (const param of params) {

            for (const interceptor of interceptors) {
                interceptor(param)
            }

        }

        const axiosInstance = novaRequest(...params)

        if (axiosInstance instanceof Promise) {
            return axiosInstance
        }

        for (const interceptor of interceptors) {

            interceptorsInstance.push({
                instance: axiosInstance,
                interceptor: axiosInstance.interceptors.request.use(config => interceptor(config)),
            })

        }

        return axiosInstance

    }

    function getStateFromLocalStorage(cacheKey) {
        return decode(localStorage.getItem(cacheKey))
    }

    function saveStateToLocalStorage(state, cacheKey) {
        localStorage.setItem(cacheKey, encode(state))
    }

    function normalizeState(state) {
        return Object.keys(state).filter(key => state[ key ].visible)
    }

    function encode(state) {
        return btoa(JSON.stringify(state))
    }

    function decode(state) {
        return state ? JSON.parse(atob(state)) : null
    }

    interceptors.push(config => {

        if (config.url !== `/nova-api/${ Nova.$router.page.props.resourceName }`) {
            return config
        }

        if (config.params === undefined || config.params === null) {
            config.params = {}
        }

        const cacheKey = `${ Nova.$router.page.props.resourceName }-columns-toggler`
        const state = getStateFromLocalStorage(cacheKey)

        if (state) {

            const normalized = normalizeState(state)

            if (normalized.length) {
                config.params[ columnAttributeName ] = encode(normalized)
            } else {
                config.params[ columnAttributeName ] = false
            }

        }

        if (!config.params.hasOwnProperty(columnAttributeName)) {
            config.params[ columnAttributeName ] = true
        }

        return config

    })

    export default {
        name: 'ColumnToggler',
        props: [ 'resourceName' ],
        emits: [ 'refresh-resources' ],
        data() {
            return {
                state: {},
                originalState: {},
            }
        },
        mounted() {

            Nova.request().get(`/nova-vendor/column-toggler/fields/${ this.resourceName }`).then(({ data }) => {

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
