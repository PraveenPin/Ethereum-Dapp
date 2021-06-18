import React, { Component } from 'react';
import Identicon from 'identicon.js';
import { Link } from "react-router-dom";

class NavBar extends Component {
  render() { 
    var data = " ";
    if (this.props.account.length > 0){
        data = new Identicon(this.props.account, 30).toString();
    }
      
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        <Link to="/"> 
            <a
              className="navbar-brand col-sm-3 col-md-2 mr-0"
              rel="noopener noreferrer"
            >
              Decentralised Social Network - Home
            </a>
          </Link>
            <ul className="navbar-nav-px-3">
              <li className="navbar-item text-nowrap d-none d-sm-none d-sm-block">               
                <Link to="/profile">                  
                  <small style={{ color: 'white'}}>
                        <small id="account">{this.props.account}</small>
                  </small>
                  <img className="ml-2" width="30" height="30" alt={`my-identicon`}
                    src={"data:image/png;base64,"+data}
                  />
                </Link>
              </li>
          </ul>
        </nav>
      </div>
    );
  }
}

export default NavBar;
