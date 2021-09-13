"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const port = 3000;
class App {
    constructor(port) {
        this.coordinates = {};
        this.port = port;
        const app = express_1.default();
        // app.use(cors({}));
        // app.use(express.static(path.join(__dirname, '../client')));
        this.server = new http_1.default.Server(app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: '*',
                methods: ['GET', 'POST'],
                credentials: true,
            },
        });
        this.io.on('connection', (socket) => {
            console.log(socket.constructor.name);
            console.log('a user connected : ' + socket.id);
            this.coordinates[socket.id] = {};
            socket.emit('id', socket.id);
            socket.on('disconnect', () => {
                console.log('socket disconnected : ' + socket.id);
                delete this.coordinates[socket.id];
                this.io.emit('removePlayer');
            });
            socket.on('update', (message) => {
                this.coordinates[socket.id].p = message.p;
                this.coordinates[socket.id].q = message.q;
            });
        });
        setInterval(() => {
            if (Object.keys(this.coordinates).length < 2)
                return;
            this.io.emit('move', this.coordinates);
        }, 50);
    }
    Start() {
        this.server.listen(this.port, () => {
            console.log(`Server listening on port ${this.port}.`);
        });
    }
}
new App(port).Start();
