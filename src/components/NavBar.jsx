import React, { Component } from 'react';
import Identicon from 'identicon.js';

class NavBar extends Component {
  render() { 
    var data = " ";
    if (this.props.account.length > 0){
        data = new Identicon(this.props.account, 30).toString();
    }
      
    return (
      <div>
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a
            className="navbar-brand col-sm-3 col-md-2 mr-0"
            href="http://www.dappuniversity.com/bootcamp"
            target="_blank"
            rel="noopener noreferrer"
          >
            Ethereum-Dapp
          </a>
            <ul className="navbar-nav-px-3">
              <li className="navbar-item text-nowrap d-none d-sm-none d-sm-block">
                  <small className="text-secondary">
                        <small id="account">{this.props.account}</small>
                  </small>
                  <img className="ml-2" width="30" height="30" alt={`my-identicon`}
                    src={"data:image/png;base64,"+data}
                  />
              </li>
          </ul>
        </nav>
      </div>
    );
  }
}

export default NavBar;
