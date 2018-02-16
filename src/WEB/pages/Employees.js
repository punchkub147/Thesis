import React, { Component } from 'react';
import { browserHistory, Link } from 'react-router';
import Styled from 'styled-components'
import AppStyle from '../../config/style'
import _ from 'lodash'
import moment from 'moment'
import store from 'store'

import Layout from '../layouts'

import Table from '../components/Table';
import { auth, db } from '../../api/firebase'
import EmployeeData from '../components/EmployeeData';

export default class extends Component {
  
  state = {
    employer: store.get('employer'),
    employees: []
  }

  async componentDidMount() {
    window.scrollTo(0, 0)
    
    const { employer } = this.state

    let employees = []
    await db.collection('working').where('employer_id', '==', employer.uid)
    .get().then(snap => {
      snap.forEach(doc => {
        employees.push({employee_id: doc.data().employee_id})
      })
    })
    //employees = _.uniqWith(employees, _.isEqual)

    this.setState({
      employees
    })
  }
  render() {
    const { employees } = this.state

    console.log('Stateee', employees)

    return (
      <Style>
        <Layout {...this.props}>
          <div className="row">
             
            {_.map(employees, employee =>
              <div className="col-md-3 card">
                <EmployeeData uid={employee.employee_id}/>
              </div>
            )}
              
          </div>
        </Layout>
      </Style>
    );
  }
}

const Style = Styled.div`
  .card{
    padding: 0 -5px;
    margin-bottom: 10px;
  }
`