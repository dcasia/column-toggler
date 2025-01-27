import isEqual from 'lodash/isEqual'
import cloneDeep from 'lodash/cloneDeep'
import {router} from '@inertiajs/vue3'

export function toList(state) {
    return state.filter(({visible}) => visible).map(({attribute}) => attribute)
}

export function encode(state) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(state))))
}

export function decode(state) {
    return state ? JSON.parse(decodeURIComponent(escape(atob(state)))) : null
}

export async function getStateFromLocalStorage(cacheKey) {

    const value = localStorage.getItem(await generateCacheKey(cacheKey))

    if (value === null) {
        return true
    }

    return decode(value)

}

export async function saveStateToLocalStorage(state, cacheKey) {
    localStorage.setItem(await generateCacheKey(cacheKey), encode(state))
}


export async function generateCacheKey(cacheKey) {
    return [
        'column-toggler',
        cacheKey,
        (await Nova.$router.decryptHistory()).props?.lens,
        Nova.config('column_toggler').enable_sorting,
    ].join('/')
}

export function registerMixin(component) {

    if (component.computed.resourceRequestQueryString === undefined) {
        component = component.mixins.find(({computed}) => typeof computed.resourceRequestQueryString === 'function')
    }

    const originalResourceRequestQueryString = component.computed.resourceRequestQueryString

    component.mixins.push({
        created() {
            Nova.$on(this.columnTogglerEventKey, this.columnTogglerOnStateChange)
        },
        unmounted() {
            Nova.$off(this.columnTogglerEventKey, this.columnTogglerOnStateChange)
        },
        async beforeMount() {
            this.columnTogglerState = await  getStateFromLocalStorage(this.resourceName)
        },
        data() {
            return {
                columnTogglerState: true,
            }
        },
        methods: {
            async columnTogglerOnStateChange(state) {

                const currentState = this.columnTogglerState

                if (isEqual(state, currentState) === false) {

                    await saveStateToLocalStorage(state, this.resourceName)

                    this.columnTogglerState = cloneDeep(state)

                    if (currentState !== true) {
                        this.getResources()
                    }

                }

            },
        },
        computed: {
            columnTogglerEventKey() {
                return `column-toggler:state-changed:${[this.resourceName, this.lens, this.actionQueryString?.viaRelationship].filter(Boolean).join('/')}`
            },
            columnTogglerEncodedColumns() {

                if (typeof this.columnTogglerState === 'boolean') {
                    return this.columnTogglerState
                }
                const columns = toList(this.columnTogglerState)

                if (columns.length === 0) {
                    return false
                }

                return encode(columns)

            },
        },
    })

    component.computed.resourceRequestQueryString = function () {
        return {
            ...originalResourceRequestQueryString.call(this),
            columnToggler: this.columnTogglerEncodedColumns,
        }
    }

}
