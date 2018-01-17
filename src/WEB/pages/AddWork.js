import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import Layout from '../layouts'

import FormEditWork from '../components/FormEditWork';


class AddWork extends Component {

  render() {

    return (
      <Style>
        <Layout>
          <div className="row">
            <div className="col-xs-12 col-sm-12 col-md-10 col-lg-6">
              <FormEditWork/>
            </div>
          </div>
        </Layout>
      </Style>
    );
  }
}

export default AddWork;

const Style = Styled.div`
  
`