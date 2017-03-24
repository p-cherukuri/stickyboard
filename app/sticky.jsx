import React from 'react';
import ReactDOM from 'react-dom';

export default class Sticky extends React.Component {

  render() {
    return (
      <div className={'sticky-note ' + this.props.color} >
        <p className='note'>{this.props.text}</p>
        <p className='username'>{this.props.username}</p>
      </div>
    );
  }
}
