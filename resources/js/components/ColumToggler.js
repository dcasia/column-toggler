export function toList(state) {
    return Object.keys(state).filter(key => state[ key ].visible)
}

export function encode(state) {
    return btoa(JSON.stringify(state))
}

export function getStateFromLocalStorage(cacheKey) {

    const value = localStorage.getItem(generateCacheKey(cacheKey))

    if (value === null) {
        return true
    }

    return decode(value)

}

export function saveStateToLocalStorage(state, cacheKey) {
    localStorage.setItem(generateCacheKey(cacheKey), encode(state))
}

export function generateCacheKey(cacheKey) {
    return `column-toggler/${ cacheKey }/${ Nova.$router.page.component }`
}

export function decode(state) {
    return state ? JSON.parse(atob(state)) : null
}

export function registerMixin(component) {

    const originalResourceRequestQueryString = component.computed.resourceRequestQueryString

    component.mixins.push({
        mounted() {
            Nova.$on(`column-toggler:state-changed:${ this.resourceName }`, this.onColumTogglerStateChange)
        },
        unmounted() {
            Nova.$off(`column-toggler:state-changed:${ this.resourceName }`, this.onColumTogglerStateChange)
        },
        data() {
            return {
                columnTogglerState: getStateFromLocalStorage(this.resourceName),
            }
        },
        methods: {
            onColumTogglerStateChange(state) {
                saveStateToLocalStorage(state, this.resourceName)
                this.columnTogglerState = state
                this.getResources()
            },
        },
        computed: {
            encodedColumnTogglerColumns() {

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
            columnToggler: this.encodedColumnTogglerColumns,
        }
    }

}
