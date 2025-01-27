import ColumnToggler from './components/ColumnToggler.vue'
import {registerMixin} from './components/ColumnToggler'
import {createVNode, render} from 'vue'

try {

    const page = Nova.pages['Nova.Lens']
    if (!page || typeof page.setup !== 'function') {
        throw new Error('Nova.Lens page or setup function not found');
    }

    const originalSetup = page.setup;

    page.setup = (...args) => {
        const result = originalSetup(...args);

        if (typeof result === 'function') {
            return (...renderArgs) => {
                const vnode = result(...renderArgs);
                if (vnode.type?.name === 'Lens') {
                    registerMixin(vnode.type);
                }

                return vnode;
            };
        }

        console.warn('Setup did not return a render function');
        return result;
    };
} catch (e) {
    console.error('ColumnToggler: Unable to register mixin for Lens view', e)

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

                const container = document.createElement('div')
                container.classList.add('column-toggler')

                const relationship = this.actionQueryString?.viaRelationship
                const resourceName = this.isLensView ? this.lens : this.resourceName

                let target

                if (relationship) {
                    target = `[dusk="${resourceName}-index-component"][data-relationship="${relationship}"] div.h-9.ml-auto.flex.items-center.pr-2.md\\:pr-3 > div.hidden.md\\:flex.px-2`
                } else if (this.isLensView) {
                    target = `[dusk="${resourceName}-lens-component"] div.h-9.ml-auto.flex.items-center.pr-2.md\\:pr-3 > div.hidden.md\\:flex.px-2`
                } else {
                    target = `[dusk="${resourceName}-index-component"] div.h-9.ml-auto.flex.items-center.pr-2.md\\:pr-3 > div.hidden.md\\:flex.px-2`
                }

                const element = this._.vnode.el.querySelector(target)

                if (element) {

                    element.insertAdjacentElement('afterend', container)

                    const vnode = createVNode(ColumnToggler, {tableToolbar: this})
                    vnode.appContext = app._context

                    render(vnode, container)

                }

            }

        },
    })

})
