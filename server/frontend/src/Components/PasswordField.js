import React, { Component } from "react";
import '../Components/css/MyAccount.css';

class PasswordField extends Component {
    constructor(props) {
        super(props);
    }
    state = {  }
    render() { 
        return (
            <p className="passwordsub" id="passwordField">*****</p>
          );
    }
}
 
export default PasswordField;