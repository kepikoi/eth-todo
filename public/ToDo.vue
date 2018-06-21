<template>
    <div :class="{done : isDone}">
        <div class="input-group my-2">
            <input type="text" class="form-control" placeholder="ToDo" aria-label="ToDo" v-model="text" readonly>
            <div class="input-group-append">
                <button v-if="isDone" type="button" @click="undo" class="btn btn-light">Undo</button>
                <button v-else type="button" @click="complete" class="btn btn-dark">Done</button>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "todo",
        props: ["text"],
        data() {
            return {
                isDone: false,
                id: null
            };
        },
        methods: {
            complete() {
                this.isDone = true;
                return App.contracts.ToDoFactory
                    .deployed()
                    .then(contract => contract
                        .complete.call()
                        .then(todos => {

                        })
                    );
            },
            undo() {
                this.isDone = false;
            }
        }
    };
</script>
<style scoped>
</style>
