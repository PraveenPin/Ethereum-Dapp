import React, { Component } from 'react';
import Identicon from 'identicon.js';
import UserList from './UserList.jsx';

class Profile extends Component {

  constructor(props){
    super(props);
    this.state = {
      isLoading: true,
      myFollowingIds: [],
      myFollowerIds: [],
      followingIdStringList: []
    }
  }

  componentDidMount(){
    this.fetchNetworkIds();
  }

  fetchNetworkIds = () => {
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

  render() {
    const {myPosts, userData} = this.props;
    return (
      <div>
        <div className="row" style={{ flexDirection: 'column'}}>
          <div>Id: {window.web3.utils.hexToNumber(userData.id)}</div>
          <div>Name: {userData.name}</div>
          <div>Followers: {window.web3.utils.hexToNumber(userData.followersCount)}</div>
          <div>Following: {window.web3.utils.hexToNumberString(userData.followingCount)}</div>
          <div>Total Tip Obtained : {window.web3.utils.fromWei(userData.tipObtained.toString(), 'Ether')} ETH</div>
          <div>Total Tip Donated  : {window.web3.utils.fromWei(userData.tipDonated.toString(), 'Ether')} ETH</div>
          <div>
              My posts: 
              <div>
              {myPosts.map((post, index) => {
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
                      <small className="text-muted">{post.author}:{window.web3.utils.hexToNumber(post.authorId)}</small>
                    </div>
                    <ul id="postList" className="list-group list-group-flush">
                      <li className="list-group-item">
                        <p>{post.content}</p>
                      </li>
                      <li className="list-group-item">
                        <p>{post.url}</p>
                      </li>
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
              </div>
            </div>
        </div>
      </div>
    );
  }
}

export default Profile;