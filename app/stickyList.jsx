import React from 'react';
import ReactDOM from 'react-dom';
import ReactCSSTransitionGroup from 'react/lib/ReactCSSTransitionGroup';
import Sticky from './sticky';
import webfontloader from 'webfontloader'

// from Google Fonts
webfontloader.load({
  google: {
    families: ['Indie Flower', 'Neucha']
  }
});

export default class StickyList extends React.Component {

  render() {
    let items = (this.props.stickyList || []).map((item) =>
      <li key={item.username + '-' + item.timestamp} >
        <div className="stickyWrapper">
          <Sticky text={item.text} color={item.color} username={item.username}/>
        </div>
      </li>);

    return (
      <ReactCSSTransitionGroup transitionName='animation' transitionEnterTimeout={500} transitionLeaveTimeout={500} component='ul' id="stickysList">
        {items}
      </ReactCSSTransitionGroup>
    )
  }

}
