import ColumnToggler from './components/ColumnToggler.vue'
import { registerMixin } from './components/ColumnToggler'
import { createVNode, render } from 'vue'

try {

    registerMixin(Nova.pages[ 'Nova.Lens' ].components[ 'ResourceLens' ])

} catch {

    console.error('ColumnToggler: Unable to register mixin for Lens view')

}

Nova.booting(app => {

    const componentFn = app.component

    app.component = function (name, component) {

        if (name === 'ResourceIndex') {
            registerMixin(component)
        }

        return componentFn.call(this, name, component)

    }

    app.mixin({
        mounted() {

            if (this._.type?.__file?.endsWith('ResourceTableToolbar.vue')) {

                const toolbarTarget = '[dusk$="-index-component"] div.h-9.ml-auto.flex.items-center.pr-2.md\\:pr-3 > div.hidden.md\\:flex.px-2'
                const lensToolbarTarget = '[dusk$="-lens-component"] div.h-9.ml-auto.flex.items-center.pr-2.md\\:pr-3 > div.hidden.md\\:flex.px-2'

                const container = document.createElement('div')
                container.id = 'column-toggler'

                const element = this._.vnode.el.querySelector(this.isLensView ? lensToolbarTarget : toolbarTarget)

                if (element) {

                    element.insertAdjacentElement('afterend', container)

                    const vnode = createVNode(ColumnToggler, {
                        resourceName: this._.props.resourceName,
                        tableToolbar: this,
                    })
                    vnode.appContext = app._context

                    render(vnode, container)

                }

            }

        },
    })

})
