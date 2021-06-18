import React from "react";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useRouteMatch,
  useParams
} from "react-router-dom";
import Web3 from 'web3';
import SocialNetwork from '../abis/SocialNetwork.json';
import HomePage from './HomePage';
import NavBar from './NavBar';
import Profile from './Profile';
import { Loader } from './utils';
import './App.css';

export default class App extends React.Component{
  constructor(props){
    super(props);
    this.state = {
      firstTimeLogin: 0,
      account: '',
      socialNetwork: null,
      isLoading: true,
      userData: null
    }
  }

  async componentDidMount(){
    await this.loadWeb3();
    await this.loadBlockChainData();
  }

  async loadWeb3(){
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      try {
          // Request account access if needed
          await window.ethereum.enable();
          // Acccounts now exposed
          // web3.eth.sendTransaction({/* ... */});
      } catch (error) {
          // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(Web3.currentProvider);
      // Acccounts always exposed
      // web3.eth.sendTransaction({/* ... */});
    }
    // Non-dapp browsers...
    else {
      console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
    }
  }

  async loadBlockChainData(){
    this.setState({ isLoading : true });
    const web3 = window.web3;
    const accounts = await web3.eth.getAccounts();
    this.setState({ account : accounts[0]});
    await this.loadSmartContract();    
  }

  async loadSmartContract(){
    //Network Id, address, ABI
    const web3 = window.web3;
    const networkId = await web3.eth.net.getId();
    const networkData = SocialNetwork.networks[networkId];
    if(networkData){
      //bad to override transactionConfirmationBlocks' value, overridden here for test environment
      const socialNetwork = web3.eth.Contract(SocialNetwork.abi, networkData.address, {transactionConfirmationBlocks: 1});
      this.setState({ socialNetwork: socialNetwork });
      const user = await socialNetwork.methods.getUserIdFromAddress(this.state.account).call();
      if(!(web3.utils.hexToNumber(user) > 0)){
        this.setState({ isLoading: false, firstTimeLogin: -1 });
      }
      else{        
        const userInfo = await socialNetwork.methods.getUserInfo().call({from: this.state.account});
        this.setState({ isLoading: false, userData: {
          id: userInfo[0],
          name: userInfo[1],
          followersCount: userInfo[2],
          followingCount: userInfo[3],
          tipObtained: userInfo[4],
          tipDonated: userInfo[5]
        }});
      }
    }
    else{
      window.alert("Social Network contract not deployed to detected network");
    }
  }

  createUser = (userName) => {
    this.state.socialNetwork.methods.autoCreateUser(userName).send({from: this.state.account})
    .once('receipt', (receipt) => {
      this.setState({ isLoading: false, firstTimeLogin: 0 }, () => this.loadSmartContract());
    });
  }

  render(){
    console.log("Inside App js", this.state);
    return (
      <Router>
        <div>
        {this.state.firstTimeLogin === -1 ? 
          (<div>
              <form onSubmit={(event) => {
                    event.preventDefault();
                  this.createUser(this.userName.value);
                }}>
                <div className="form-group mr-sm-2">
                  <input
                    id="userName"
                    type="text"
                    ref={(input) => { this.userName = input }}
                    className="form-control"
                    placeholder="Enter any user name"
                    required />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Create An Account</button>
              </form>
              <p>&nbsp;</p>
          </div>) : 
          this.state.firstTimeLogin === -1 ? (<div>
            Creating an account .............
          </div>) : 
          <div>
            {this.state.isLoading ? <Loader/> :  
            <div>
              <NavBar account = {this.state.account}/>
              <Switch>
                <Route path="/profile">
                  <Profile account={this.state.account} socialNetwork={this.state.socialNetwork} userData={this.state.userData}/>
                </Route>
                <Route path="/">
                  <HomePage account={this.state.account} socialNetwork={this.state.socialNetwork} userData={this.state.userData}/>
                </Route>
              </Switch>
            </div>}
          </div>}
        </div>
      </Router>
    );
  }
}