import React, { Component } from 'react';
import { Picker, WhiteSpace  } from 'antd-mobile';
import _ from 'lodash'

let hour = -1
const hours = _.times(24, () => {
  hour++
  return {
    label: `${hour}`, 
    value: `${hour}`,
  }
});

const data = [
  hours,
  [
    {
      label: '00',
      value: '00',
    },
    {
      label: '15',
      value: '15',
    },
    {
      label: '30',
      value: '30',
    },
    {
      label: '45',
      value: '45',
    },
  ],
];
export default class PickerViewExample extends React.Component {
  state = {
    value: ['5','15'],
    visible: true,
  };
  onChange = (value) => {
    console.log(value);
    this.setState({
      value,
    });
  }
  onScrollChange = (value) => {
    console.log(value);
  }
  render() {
    return (
      <div>
        <Picker
          visible={this.props.visible}
          onChange={this.onChange}
          onScrollChange={this.onScrollChange}
          value={this.state.value}
          data={data}
          cascade={false}
          onDismiss={() => this.setState({ visible: false })}
        />
      </div>
    );
  }
}

