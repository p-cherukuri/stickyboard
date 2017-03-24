'use strict'

import React from 'react';
import ReactDOM from 'react-dom';
import StickyList from './stickyList';
import UserList from './userList';
import 'pubnub';

var username = (localStorage.getItem('username')) ? (localStorage.getItem('username')) : window.prompt('Your name');
username = (!username) ? 'anonymous-' + ~~(Math.random() * 10000) : username;
localStorage.setItem('username', username);

const colors = ['yellow', 'pink', 'green', 'blue', 'purple'];
var color = (localStorage.getItem('color')) ? (localStorage.getItem('color')) : colors[~~(Math.random() * colors.length)];
localStorage.setItem('color', color);

/* PubNub Config */

const publish_key =  'pub-c-e736c2d9-bd93-4726-8912-840a1b14a2e2';
const subscribe_key  = 'sub-c-c54cc950-10d0-11e7-bd0e-0619f8945a4f';

const pubnub = require('pubnub').init({
  publish_key   : publish_key,
  subscribe_key : subscribe_key,
  ssl: true,
  uuid: username
});

const channel = 'sticky-notes';


class StickyCollab extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      stickyList: [],
      userList: []
    }
  }

  componentWillMount() {
    pubnub.subscribe({
      channel: channel,
      restore: true,
      connect: () => this.connect(),
      message: (m) => this.success(m),
      presence: (m) => this.presenceChanged(m)
    });
  }

   // Send state to PubNub with user's data
  componentDidMount() {
    var userdata = {username: this.props.username, color: this.props.color, timestamp: Date.now()};
    pubnub.state({
      channel: channel,
      uuid: this.props.username,
      state: userdata
    });
  }

  // Get data from PubNub History API upon first connection
  connect() {
    pubnub.history({
      channel: channel,
      count: 50,
      callback: (m) => {
        m[0].reverse();
        for (var v of m[0]) {
          let newList = this.state.stickyList.concat(v);
          this.setState({stickyList: newList});
        }
      }
    });
  }

  // At the success callback, update the sticky note list
  success(m) {
    let newList = [m].concat(this.state.stickyList);
    this.setState({stickyList: newList});
  }

  // Watch for metadata when m.action == 'state-change' or 'timeout'.
  // 'join' when user first enters a username
  presenceChanged(m) {
    if(m.data) {
      console.log(m);
      pubnub.here_now({
        channel: channel,
        callback: (m) => this.getUserList(m)
      });
    }
  }

  getUserList(m) {
    this.state.userList.length = 0;

    var i = 0;
    for (var u of m.uuids) {

      pubnub.state({ //get state
        channel: channel,
        uuid: u,
        callback: (s) => {
          if(!s.username) return; // Ignore debugger

          let newList = this.state.userList.concat({username: s.username, color: s.color, timestamp: s.timestamp});

          if(i == m.uuids.length)
          this.setState({userList: newList});
        }
      });
      i++;
    }
  }

  render() {
    return (
      <div>
        <UserList userList={this.state.userList} />
        <StickyWritable username={this.props.username} color={this.props.color} />
        <StickyList stickyList={this.state.stickyList} />
      </div>
    );
  }
}

class StickyWritable extends React.Component {

  handleTextChange(e) {
    if(e.keyCode != 13) return;
    if(e.target.value == '') return;
    if(e.target.value == '\n') {
      e.target.value = '';
      return;
    }

    var data = {
      username: this.props.username,
      color: this.props.color,
      text: e.target.value,
      timestamp: Date.now()
    };

    pubnub.publish({
      channel: channel,
      message: data,
      callback: e.target.value = ''
    });
  }

  render() {
    return (
      <div className={'sticky-note writable ' + this.props.color}>
        <textarea type='text' placeholder='Your new note...' onKeyUp={this.handleTextChange.bind(this)} />
        <p className='username'>{this.props.username}</p>
      </div>
    );
  }

}


/* DOM */

ReactDOM.render(
  <StickyCollab username={username} color={color} />,
  document.getElementById('container')
);
