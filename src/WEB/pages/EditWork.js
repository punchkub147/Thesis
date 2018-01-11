import React, { Component } from 'react';
import { Router, browserHistory, Route, Link, hashHistory } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import Layout from '../layouts'

import FormEditWork from '../components/FormEditWork';
import { db } from '../../api/firebase'

class EditWork extends Component {

  render() {
    const workId = this.props.params.id
    return (
      <Style>
        <Layout>
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-10 col-lg-6">
              <FormEditWork workId={workId}/>
            </div>
          </div>
        </Layout>
      </Style>
    );
  }
}

export default EditWork;

const Style = Styled.div`
  
`