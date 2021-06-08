import React, { Component } from 'react';
import {Button, Modal, ListGroup} from 'react-bootstrap';
import Identicon from 'identicon.js';

class Card extends Component {

  constructor(props){
    super(props);
    this.state = {
      isLoading: true,
      myFollowingIds: [],
      myFollowerIds: [],
      // accBalance: 0.0,
      posts: this.props.posts,
      followingIdStringList: [],
      showCommentsModal: false,
      activePostData: null,
      activePostComments: []
    }
  }

  componentDidMount(){
    this.fetchNetworkIds();
  }

  // fetchAccountBalance = () => {
  //   window.web3.eth.getBalance(this.props.account).then((accountBalance) => {
  //     const floatBal = parseFloat(window.web3.utils.fromWei(accountBalance, 'Ether'));
  //     console.log("final bal:",floatBal , typeof(floatBal));
  //     this.setState({ accBalance: floatBal });
  //   });
  // }

  fetchNetworkIds = () => {
    this.setState({ isLoading: true });
    this.props.socialNetwork.methods.getAllFollowingIds().call({from: this.props.account})
    .then((result) => {
      this.setState({ isLoading: false, myFollowingIds: result[0] ,myFollowerIds: result[1] }, () => this.convertFollowingIdsFromBNtoStrings());
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

  followAuthor = (authorId) => {
    this.props.socialNetwork.methods.followAuthor(authorId).send({ from: this.props.account })
    .once('receipt', (receipt) => {
      console.log("r:",receipt);
    });
    //notification for following
  }

  unFollowAuthor = (authorId) => {
    this.props.socialNetwork.methods.unFollowAuthor(authorId).send({ from: this.props.account })
    .once('receipt', (receipt) => {
      console.log("r:",receipt);
    });
    //notification for following
  }

  openCommentsModal = (post) => {
    this.setState({ showCommentsModal: true, activePostData: post }, () => this.fetchAllComments());
  }

  closeCommentsModal = () => {
    this.setState({ showCommentsModal: false, activePostData: null, activePostComments: [] });
  }

  createComment = (postId, comment) => {
    this.props.socialNetwork.methods.createComment(postId, comment).send({ from: this.props.account })
    .once('receipt', (receipt) => {
      console.log("receipt",receipt);
    });
    this.fetchAllComments();
  }

  fetchAllComments = () => {
    this.props.socialNetwork.methods.fetchAllComments(this.state.activePostData.pid).call({ from: this.props.account })
    .then((result) => {
      console.log("Comment list", result[1]);
      this.setState({ activePostComments : result[1]});
    })
  }

  render() {
    return (
      <div>
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;Explore:</p>
                <form onSubmit={(event) => {
                  event.preventDefault();
                  this.props.createPost(this.postContent.value,this.postUrl.value);
                }}>
                <div className="form-group mr-sm-2">
                  <input
                    id="postContent"
                    type="text"
                    ref={(input) => { this.postContent = input }}
                    className="form-control"
                    placeholder="What's on your mind?"
                    required /> 
                  <input
                    id="postUrl"
                    type="text"
                    ref={(input) => { this.postUrl = input }}
                    className="form-control"
                    placeholder="Attach some Urls?"
                    />
                </div>
                <button type="submit" className="btn btn-primary btn-block">Share</button>
              </form>
              <p>&nbsp;</p>
              {this.props.posts.map((post, index) => {
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
                      <li key={`li-${index}`} className="list-group-item py-2">
                        <small className="float-left mt-1 text-muted">
                          TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH
                        </small>
                        <button
                          id={`button-tipAmount${index}`}
                          className="btn btn-link btn-sm float-right pt-0"
                          name={post.pid}
                          onClick={(event) => {
                            if(document.getElementById(`tipAmount${index}`).value){
                              let tipAmount = window.web3.utils.toWei(document.getElementById(`tipAmount${index}`).value.toString(), 'Ether');
                              console.log(event.target.name, tipAmount);
                              this.props.tipPost(event.target.name, tipAmount);
                            }
                          }}
                        >
                          TIP Ether
                        </button>                        
                        <input
                            id={`tipAmount${index}`}
                            type="number"
                            className="btn btn-link btn-sm float-right pt-0"
                            placeholder="Tip 0.1 Ether?"
                        />
                      </li>
                      <li key={`open-modal-button-${index}`} className="list-group-item py-2">
                        <button
                          id={`button-comments${index}`}
                          className="btn btn-link btn-sm float-left pt-0"
                          name={post.pid}
                          onClick={() => this.openCommentsModal(post)}
                        >
                          Comments
                        </button>
                        {(this.state.followingIdStringList > 0 && this.state.followingIdStringList.indexOf(post.authorId.toString()) > -1) ? 
                         (<button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={`follow-${post.pid}`}
                          onClick={(event) => {
                            console.log(event.target.name, "Following the author");
                            this.unFollowAuthor(post.authorId);
                          }}
                          disabled={this.props.account.localeCompare(post.author) === 0}
                        >
                          Unfollow Author
                        </button>)
                         :                        
                        (<button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={`follow-${post.pid}`}
                          onClick={(event) => {
                            console.log(event.target.name, "Following the author");
                            this.followAuthor(post.authorId);
                          }}
                          disabled={this.props.account.localeCompare(post.author) === 0}
                        >
                          Follow Author
                        </button>)}
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>

            <Modal
              show={this.state.showCommentsModal}
              onHide={this.closeCommentsModal}
              backdrop="static"
              keyboard={false}
              size={'xl'}
            >
              <Modal.Header closeButton>
                <Modal.Title>Want to add a new comment...?</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <ListGroup variant="flush">
                    {/* <p>&nbsp;Scroll down to see and add a comment:</p> */}
                    {this.state.activePostComments.map((obj, index) => (
                      <div className="form-group mr-sm-2">
                        <textarea rows={2} cols={4} disabled={true} key={`comment-${index}`}>
                          {obj.comment}
                        </textarea>
                      </div>
                    )) }
                    <form onSubmit={(event) => {
                      event.preventDefault();
                      this.createComment(this.state.activePostData.pid, this.postComment.value);
                    }}>
                    <div className="form-group mr-sm-2">
                      <textarea
                        id="postComment"
                        name="postComments"
                        type="text"
                        ref={(input) => { this.postComment = input }}
                        className="form-control"
                        rows={2}
                        cols={40}
                        maxLength={240}
                        placeholder="What's on your mind?"
                        required>

                        </textarea>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block">Submit</button>
                  </form>
                  <p>&nbsp;</p>
                </ListGroup>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.closeCommentsModal}>
                  Close
                </Button>
                {/* <Button variant="primary">Understood</Button> */}
              </Modal.Footer>
            </Modal>            
          </main>
        </div>
      </div>
    );
  }
}

export default Card;