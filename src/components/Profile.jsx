import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Profile extends Component {

  render() {
    const {myPosts, userData} = this.props;
    return (
      <div>
        <div className="row" style={{ flexDirection: 'column-reverse'}}>
          <div>Author Id: {window.web3.utils.hexToNumber(userData.id)}</div>
          <div>Author Name: {userData.name}</div>
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
              </div>
            </div>
        </div>
      </div>
    );
  }
}

export default Profile;