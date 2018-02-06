import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import Layout from '../layouts'

import FormEditProfile from '../components/FormEditProfile';


export default class extends Component {

  render() {
    const uid = this.props.params.id
    return (
      <Style>
        <Layout {...this.props}>
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-10 col-lg-6">
              <FormEditProfile uid={uid}/>
            </div>
          </div>
        </Layout>
      </Style>
    );
  }
}

const Style = Styled.div`
  
`