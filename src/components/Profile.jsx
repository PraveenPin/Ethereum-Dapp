import React, { Component } from 'react';
import Identicon from 'identicon.js';
import UserList from './UserList.jsx';
import { getIpfsHashFromBytes32 } from './utils';
import { Alert } from 'react-bootstrap';

class Profile extends Component {

  constructor(props){
    super(props);
    this.state = {
      isLoading: true,
      myPosts: [],
      myFollowingIds: [],
      myFollowerIds: [],
      followingIdStringList: []
    }
  }

  componentDidMount(){
    if(!!this.props.userData){
      this.fetchMyPosts();
      this.fetchMySocialNetworkIds();
    }
  }

  async fetchMyPosts(){    
    const myPosts = await this.props.socialNetwork.methods.getMyPosts(this.props.userData.id).call({from: this.props.account});
    this.setState({ myPosts: myPosts[1] });
  }

  fetchMySocialNetworkIds = () => {
    this.setState({ isLoading: true });
    this.props.socialNetwork.methods.getAllFollowingIds().call({from: this.props.account})
    .then((result) => {
      console.log("Ner",result, this.state);
      this.setState({ isLoading: false, myFollowingIds: result[0] ,myFollowerIds: result[1]} , () => this.convertFollowingIdsFromBNtoStrings());
    });
  }

  convertFollowingIdsFromBNtoStrings = () => {
    this.setState({ isLoading: true });
    let followingIdStringList = [];
    this.state.myFollowingIds.map((idBN,index) => {
      followingIdStringList.push(idBN.toString());
    });
    this.setState({ isLoading: false, followingIdStringList: followingIdStringList });
  }

  getAllHistory = () => {    
    this.props.socialNetwork.events.PostCreated({
      filter: {}, // Using an array means OR: e.g. 20 or 23
      fromBlock: 0
    }, function(error, event){ 
      
      console.log(event); 
    })
    .on('data', function(event){
        console.log("Inside events:", event); 
        this.setState({ logMessage: "Hide All Logs"});// same results as the optional callback above
    })
    .on('changed', function(event){
        // remove event from local database
    })
    .on('error', console.error);
  }

  render() {
    const {userData} = this.props;
    return (
      <div style={{ width: '100%' }}>
        {!!this.props.userData ? (<div className="row" style={{ flexDirection: 'column'}}>
          <div>Id: {window.web3.utils.hexToNumber(userData.id)}</div>
          <div>Name: {userData.name}</div>
          <div>Followers: {window.web3.utils.hexToNumber(userData.followersCount)}</div>
          <div>Following: {window.web3.utils.hexToNumberString(userData.followingCount)}</div>
          <div>Total Tip Obtained : {window.web3.utils.fromWei(userData.tipObtained.toString(), 'Ether')} ETH</div>
          <div>Total Tip Donated  : {window.web3.utils.fromWei(userData.tipDonated.toString(), 'Ether')} ETH</div>
          <div>
              My posts: 
              <div>
              {this.state.myPosts.map((post, index) => {
                return(
                  <div className="card mb-4" key={index} >
                    <div className="card-header">
                      <img
                        className='mr-2'
                        width='30'
                        height='30'
                        alt={`identicon-${index}`}
                        src={`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}
                      />
                      <small className="text-muted">{post.authorName} : {window.web3.utils.hexToNumber(post.authorId)}</small>
                    </div>
                    <ul id="postList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p>{post.content}</p>
                      </li>
                      <li className="list-group-item">
                        <p>{post.url}</p>
                      </li>
                      {!!post.picIpfsHash && (<li className="list-group-item">
                        <img alt={index} width= "100%" height="100%" src={`https://ipfs.io/ipfs/${getIpfsHashFromBytes32(post.picIpfsHash)}`}></img>
                      </li>)}
                      <li key={index} className="list-group-item py-2">
                        <small className="float-left mt-1 text-muted">
                          TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH
                        </small>
                      </li>
                    </ul>
                </div>)})}
                <div>{this.state.isLoading ? "Loading Following List...." : 
                  <UserList 
                    heading={"Following"}
                    idList={this.state.myFollowingIds}
                    followingIdStringList={this.state.followingIdStringList}
                    socialNetwork={this.props.socialNetwork}
                    account={this.props.account}
                    tipPost={this.props.tipPost}
                  />}
                </div>
                <div>{this.state.isLoading ? "Loading Followers List...." : 
                  <UserList 
                    heading={"Followers"} 
                    idList={this.state.myFollowerIds}
                    followingIdStringList={this.state.followingIdStringList}
                    socialNetwork={this.props.socialNetwork}
                    account={this.props.account}
                    tipPost={this.props.tipPost}
                  />}
                </div>
                <div> 
                  {/* <Button variant="primary" onClick={this.getAllHistory}>
                    {this.state.logMessage}
                  </Button> */}
                </div>
              </div>
            </div>
        </div>) 
        : (
          <Alert variant="danger">
            Please open this page from the home screen
          </Alert>)}
      </div>
    );
  }
}

export default Profile;