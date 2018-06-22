<template>
    <div class="alert alert-dismissible fade show" :class="['alert-'+_type]" role="alert">
        <slot></slot>
        <button @click="destroy" type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
        </button>
    </div>
</template>
<script>
    export default {
        name: "notification",
        props: ["type"],
        data() {
            return {}
        },
        methods: {
            destroy() {
                this.$destroy();
            }
        },
        computed: {
            _type() {
                return ["success", "info", "warning", "danger"].includes(this.type) ? this.type : "success"
            }
        }
    }
</script>
<style scoped>
</style>


