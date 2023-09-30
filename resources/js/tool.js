import CustomFilterMenu from './components/CustomFilterMenu.vue'

Nova.booting((app, store) => {
    app.component('FilterMenu', CustomFilterMenu)
})
