import FilterMenu from './components/FilterMenu.vue'
import { registerMixin } from './components/ColumToggler'
import Index from '@/views/Index'

Nova.booting(app => {

    registerMixin(Index)

    app.component('ResourceIndex', Index)
    app.component('FilterMenu', FilterMenu)

})
