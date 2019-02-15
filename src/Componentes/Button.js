import React from 'react';
import RaisedButton from 'material-ui/RaisedButton';
import {mainAppBack} from '../appBack'

const style = {
  margin: 0,
};

export default class Button extends React.Component {
  state = {
    dialog: ""
  };

  onSubmit = e => {
    e.preventDefault();
    mainAppBack(this.props.dados)
  };

  
  render () {
    return (
      <div>
        <RaisedButton label='Criar Dialogo' primary fullWidth style={style} onClick={e => this.onSubmit(e)}/>
        {/* <RaisedButton label = 'Criar Dialogo' primary fullWidth style = {style} onClick={e => tryy("TRYYYY")} /> */}
        <br />
      </div>
    )
  }
}
