<template>
    <div class="container">
        <div ref="notifications">
            <notification v-if="user" type="success"><strong>Login successfull</strong> Logged in as {{user}}</notification>
        </div>
        <div v-if="error">
            <div class="alert alert-danger" role="alert">
                {{error.message}}
                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </button>
            </div>
        </div>
        <div class="py-5 text-center">
            <h1> Eth To-Do</h1>
            <p>Another blockchain-based To-Do app</p>
        </div>
        <div v-if="user">
            <div class="row">
                <div class="col-12">
                    <div class="form-group">
                        <input type="text" class="form-control pb-3" id="todo" v-model="newTodo"
                               placeholder="What needs to be done">
                    </div>
                    <button @click="add" :disabled="!newTodo" type="button" class="btn btn-primary btn-lg btn-block">Add</button>
                </div>
            </div>
            <div id="mytasks">
                <div class="py-5 text-center col-12">
                    <h2>My Tasks</h2>
                    <br>
                    <todo v-for="task in tasks" :text="task.todo" :id="task.id" :tx="task.tx" v-on:error="onerror"></todo>
                    <spinner v-if="isLoadingTasks"></spinner>
                    <div id="alldone" v-if="tasks.length === 0 && !isLoadingTasks">🤘🏻 All done!</div>
                </div>
            </div>
        </div>
        <div v-else>
            <div class="alert alert-info" role="alert">
                Please login to Metamask
            </div>
        </div>
    </div>
</template>
<script>
    import Todo from "./components/ToDo";
    import Vue from "vue";
    import Spinner from "./components/Spinner";
    import Notification from "./components/Notification";

    export default {
        name: "app",
        components: {
            Todo,
            Spinner,
            Notification
        },
        data() {
            return {
                error: undefined,
                newTodo: undefined,
                tasks: [],
                isLoadingTasks: true,
                user: Vue.getUser()
            }
        },
        // computed: {
        //     user() {
        //         return Vue.getUser()
        //     }
        // },
        watch: {
            error(v) {
                console.error(v);
            }
        },
        methods: {
            add() {
                Vue
                    .deployed()
                    .then(contract => contract.add(this.newTodo))
                    .then(receipt => {
                        this.tasks.push({todo: this.newTodo, tx: receipt.tx});
                        this.newTodo = undefined;
                    })
                    .catch(e => this.error = e);
            },
            onerror(e) {
                this.error = e;
            }
        },
        created() {
            console.log("App.vue");
            const initApp = loadTasks.bind(this);
            web3.currentProvider.publicConfigStore.on("update", data => {
                //reload tasks on user change
                if (data.selectedAddress !== this.user) {
                    this.user = Vue.getUser(); //reset user
                    const notiComponent = Vue.extend(Notification);
                    const notiInstance = new notiComponent({propsData: {type: "warning"}});
                    notiInstance.$slots.default = "Current user changed: Logged in as " + this.user;
                    notiInstance.$mount();
                    this.$refs.notifications.appendChild(notiInstance.$el);
                    return initApp();
                }
            });
            initApp()
        }
    };

    function loadTasks() {
        this.tasks = []; //empty tasks
        return Vue
            .deployed()
            .then(contract => contract
                .getMyToDos.call()
                .then(todos => {
                        this.isLoadingTasks = false; //stop spinner
                        todos.map(id => {
                            const dId = window.web3.toDecimal(id);
                            contract.getById
                                .call(dId)
                                .then(todo => this.tasks.push({id: dId, todo})) //add tasks to list
                        })
                    }
                )
            );
    }

</script>
<style scoped>
</style>