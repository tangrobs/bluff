import { Injectable, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as io from 'socket.io-client';
import { Subject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private socket: SocketIOClient.Socket; // the client instance of socket.io
  private allPlayersSource = new Subject<any>();
  private gameStateSource = new Subject<any>();
  private winSource = new Subject<any>();

  allPlayers$ = this.allPlayersSource.asObservable();
  gameState$ = this.gameStateSource.asObservable();
  win$ = this.winSource.asObservable();
  state: any;
  id: any;
  winner: any;  // for showing stats
  playersList: any;


  constructor(private _http: HttpClient) {
    this.socket = io();

    this.socket.on('player_list', function(data) {
      console.log('got our player list: ', data);
      this.allPlayersSource.next(data);
    }.bind(this));

    this.socket.on('game_state', function(state) {
      console.log('getting game state in SERVICE!');
      this.state = state;
      for (const player of state.players) {
        if (this.id === player.socketid) {
          const temphand = player.hand.slice(0);
          player.hand = temphand.sort((a, b) => a.value - b.value);
        }
      }
      this.gameStateSource.next(state);
      this.winSource.next(state.winner);
      this.winner = state.winner; // part of showing stats
      this.playersList = state.players;  // for splash screen players list
      console.log('in the service, i am setting winner', this.winSource);
    }.bind(this));
  }

  addPlayer(name) {
    this.socket.emit('player_name', name);
    this.socket.on('yourid', (socketid) => {
      this.id = socketid;
      console.log(this.id);
    });
  }

  startGame() {
    this.socket.emit('startgame', 'whatever data here');
    console.log('starting game!');
  }
  callBluff() {
    this.socket.emit('callbluff', 'dummy data');
    console.log('calling bluff!');
  }
  pass() {
    this.socket.emit('pass', 'dummy data');
    console.log('I pass!');
  }
  getState() {
    this.socket.on('game_state', function(state) {
      for (const player of state.players) {
        if (this.id === player.socketid) {
          const temphand = player.hand.slice(0);
          player.hand = temphand.sort((a, b) => a.value - b.value);
        }
      }
      this.gameStateSource.next(state);
      this.winSource.next(state.winner);
      this.winner = state.winner; // part of showing stats
      this.playersList = state.players;  // for splash screen players list
      console.log('in the service, i am setting winner', this.winSource);
    }.bind(this));
  }
  playCards(choosen_card, selected_cards) {
    this.socket.emit('play', {
        choosen_card: choosen_card,
        selected_cards: selected_cards
    });
  }
}
