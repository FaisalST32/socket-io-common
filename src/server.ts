import express from 'express';
import path from 'path';
import http from 'http';
import { Server, Socket } from 'socket.io';
import cors from 'cors';

const port: number = 3000;

class App {
	private server: http.Server;
	private port: number;

	private io: Server;
	private coordinates: any = {};

	constructor(port: number) {
		this.port = port;
		const app = express();
		// app.use(cors({}));
		// app.use(express.static(path.join(__dirname, '../client')));

		this.server = new http.Server(app);

		this.io = new Server(this.server, {
			cors: {
				origin: '*',
				methods: ['GET', 'POST'],
				credentials: true,
			},
		});

		this.io.on('connection', (socket: Socket) => {
			console.log(socket.constructor.name);
			console.log('a user connected : ' + socket.id);
			this.coordinates[socket.id] = {};
			socket.emit('id', socket.id);

			socket.on('disconnect', () => {
				console.log('socket disconnected : ' + socket.id);
				delete this.coordinates[socket.id];
				this.io.emit('removePlayer');
			});

			socket.on('update', (message: any) => {
				this.coordinates[socket.id].p = message.p;
				this.coordinates[socket.id].q = message.q;
			});
		});

		setInterval(() => {
			if (Object.keys(this.coordinates).length < 2) return;
			this.io.emit('move', this.coordinates);
		}, 50);
	}

	public Start() {
		this.server.listen(this.port, () => {
			console.log(`Server listening on port ${this.port}.`);
		});
	}
}

new App(port).Start();
