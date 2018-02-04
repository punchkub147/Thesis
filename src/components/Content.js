import React, { Component } from 'react';

class Content extends Component {

  render() {
    return (
      <div className="container">
        <div className="row justify-content-center" style={{margin: '0 -10px'}}>
          <div className='col-xs-12 col-sm-8' style={{padding: '0 10px'}}>
            {this.props.children}
          </div>
        </div>
      </div>
    );
  }
}

export default Content;

//col-xs-12 col-sm-8 col-md-6 col-lg-5  mobile only