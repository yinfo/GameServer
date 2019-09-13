// import Vue from 'vue'
// Vue.component('v-alert', {});
// Vue.component('v-app', {});

new Vue({
    el: '#app',
    data () {
        return {
            active: null,
            sessionId:'awle46q4jnn5jua8',
            text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
        }
    },
    methods: {
        next () {
            const active = parseInt(this.active)
            this.active = (active < 2 ? active + 1 : 0)
        },
        sendMessage() {
            const message = {
                text: this.message
            }

            socket.emit('message:create', message, err => {
                if (err) {
                    console.error(err)
                } else {
                    this.message = ''
                }
            })
        },
        initializeConnection() {
            socket.on('message:new', message => {
                this.messages.push(message)
            })
        }
    },
    mounted() {
        // this.initializeConnection()
        let host = 'localhost'
        let ws = new WebSocket('ws://' + host + ':8080');
        ws.onmessage = function (event) {
            console.log(event.data)
        };
    }
})





// try {
//     document.getElementById('logpass').value
//         = localStorage.getItem("logpass")
//         || '{"scr":"login","login":"12345","password":"12345"}'
//
// } catch (e) {
//     console.log(e.message)
// }
//
//
// let host = window.document.location.host.replace(/:.*/, '');
// let ws = new WebSocket('ws://' + host + ':8080');
// ws.onmessage = function (event) {
//     console.log(event.data)
// };
//
// function login() {
//     let logpassValue = document.getElementById('logpass').value
//     localStorage.setItem("logpass", logpassValue)
//     ws.send(logpassValue)
// }
