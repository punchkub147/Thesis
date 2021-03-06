import React, { Component } from 'react';
import Styled from 'styled-components'
import AppStyle from '../../config/style'

import Layout from '../layouts'

import FormEditWork from '../components/FormEditWork';

class EditWork extends Component {

  componentDidMount() {
    window.scrollTo(0, 0)
  }
  render() {
    const workId = this.props.params.id
    return (
      <Style>
        <Layout {...this.props}>
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