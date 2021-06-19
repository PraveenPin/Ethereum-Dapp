import React, { Component } from 'react';
import { Button, Modal, ListGroup } from 'react-bootstrap';
import Identicon from 'identicon.js';
import Comment from './Comment';
import InputEmoji from "react-input-emoji";
import ipfs from './ipfs';
import { getBytes32FromIpfsHash, getIpfsHashFromBytes32 } from './utils';
import { IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';

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
      activePostComments: [],
      isLoadingCommentsBox: true,
      imagebuffer: null,
      imageIpfsHash: null
    }

    this.createComment = this.createComment.bind(this);
  }

  componentDidMount(){
    this.fetchNetworkIds();
  }

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

  async createComment(postId, comment){
    await this.props.socialNetwork.methods.createComment(postId, comment).send({ from: this.props.account })
    .once('receipt', (receipt) => {
      this.fetchAllComments();
    });
  }

  fetchAllComments = () => {
    this.setState({ isLoadingCommentsBox : true });
    this.props.socialNetwork.methods.fetchAllComments(this.state.activePostData.pid).call({ from: this.props.account })
    .then((result) => {
      console.log("Comment list", result);
      this.setState({ isLoadingCommentsBox: false, activePostComments : result});
    })
  }

  onFileChange = (event) => {
    event.preventDefault();
    console.log("cap file:", this.postImage.value, this.postImage.files[0]);
    const file = this.postImage.files[0];
    const reader = new window.FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = () => {
      this.setState({ imageBuffer: Buffer(reader.result) });
    }
  }

  onPostFormSubmit = (event) => {
    event.preventDefault();
    if(!!this.state.imageBuffer){
      console.log("uploading image....", this.state.imageBuffer);
      ipfs.add(this.state.imageBuffer)
      .then(result => {
        console.log("Upload successfull. Sending a request to create a post",getBytes32FromIpfsHash(result.path));
        this.setState({ imageIpfsHash: result.path }, () => this.props.createPost(this.postContent.value,this.postUrl.value, getBytes32FromIpfsHash(result.path)));    
      })
      .catch(error => console.error(error));
    }
    else{
      console.log("Sending a request to create a post with no image");
      this.props.createPost(this.postContent.value,this.postUrl.value, ""); 
    }

  }

  render() {
    return (
      <div>
        <div className="rowWiseContainer">
              {this.props.heading === 'Explore' ? 
                  (<div className="formContainer">
                      <h4 style={{ marginTop: '24px'}}>&nbsp;Create and share a post:</h4>
                      <form onSubmit={this.onPostFormSubmit}>
                      <div className="form-group mr-sm-2">
                        <input
                          id="postContent"
                          type="text"
                          ref={(input) => { this.postContent = input }}
                          className="form-control postContent"
                          placeholder="What's on your mind?"
                          required /> 
                        <div style={{ width: '100%'}}>
                          <input
                            id="postUrl"
                            type="text"
                            className="form-control postUrl"
                            ref={(input) => { this.postUrl = input }}
                            placeholder="Attach some Urls?"
                          />
                          <input accept="image/*"
                                type="file" 
                                style = {{ display: 'none' }}
                                id="postImage"
                                ref={(input) => { this.postImage = input }}
                                onChange={this.onFileChange}  
                                className="form-control"
                          />
                        </div>
                        <label htmlFor="postImage" style={{ display: 'flex', flexWrap: 'wrap', height:"28px", margin: '10px 0px 0px 14px'}}>
                        {!!this.state.imageBuffer ? <p className="UploadedMessage">Uploaded.. ✅</p> : <p className="UploadedMessage">Add an image</p> }                            
                          <IconButton color="primary" component="span">
                            <AddIcon style={{ fill: '#212529' }}/>
                          </IconButton>
                        </label>            
                      </div>
                      <button type="submit" className="btn btn-primary btn-block">Share</button>
                    </form>
                    <p>&nbsp;</p>
                  </div>) : 
                  (<div className="formContainer">
                      <h4 style={{ marginTop: '24px'}}>&nbsp;Search: </h4>
                      <form onSubmit={(event) => {
                        event.preventDefault();
                        this.props.fetchSearchKeyPosts(this.searchKey.value);
                      }}>
                      <div className="form-group mr-sm-2">
                        <input
                          id="searchKey"
                          type="text"
                          ref={(input) => { this.searchKey = input }}
                          className="form-control"
                          placeholder="Type in any key?"
                          required />
                      </div>
                      <button type="submit" className="btn btn-primary btn-block">Search</button>
                    </form>
                    <p>&nbsp;</p>
                  </div>)}
                  <div className="postsContainer">
                      {this.props.posts.map((post, index) => {
                        return(
                          <div className="card mb-4 cardDiv" key={index} >
                            <div className="card-header">
                              <img
                                className='mr-2'
                                width='30'
                                height='30'
                                alt={`identicon-${index}`}
                                src={`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}
                              />
                              <strong className="text-muted">{post.authorName} : {window.web3.utils.hexToNumber(post.authorId)}</strong>
                            </div>
                            <ul id="postList" className="list-group list-group-flush">
                              <li className="list-group-item">
                                <p>{post.content}</p>
                              </li>
                              <li className="list-group-item">
                                <p>{post.url}</p>
                              </li>
                              {!!post.picIpfsHash && (<li className="list-group-item">
                                <img alt={index} className="postPicture" src={`https://ipfs.io/ipfs/${getIpfsHashFromBytes32(post.picIpfsHash)}`}></img>
                              </li>)}
                              <li key={`li-${index}`} className="list-group-item py-2">
                                <small className="float-left mt-1 text-muted">
                                  TIPS: {window.web3.utils.fromWei(post.tipAmount.toString(), 'Ether')} ETH
                                </small>
                                <div style={{ padding: '4px 0px' }}>
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
                                </div>
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
                    {this.state.isLoadingCommentsBox ? "Comments are loading ...." : 
                    (<div>
                          {this.state.activePostComments.map((obj, index) => 
                          (<Comment
                            index={index}
                            commentData={obj} 
                            account={this.props.account}
                            socialNetwork={this.props.socialNetwork}
                            postAuthor={this.state.activePostData.author}
                            followingIdStringList={this.state.followingIdStringList}
                            triggerFetchAllComments={this.fetchAllComments}
                          />))}
                        <div className="form-group mr-sm-2">                                                     
                          <InputEmoji
                            // value={}
                            cleanOnEnter
                            onEnter={(value) => this.createComment(this.state.activePostData.pid, value)}
                            placeholder="Type a message"
                          />
                        </div>
                    </div>)}
                </ListGroup>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={this.closeCommentsModal}>
                  Close
                </Button>
                {/* <Button variant="primary">Understood</Button> */}
              </Modal.Footer>
            </Modal>
        </div>
    );
  }
}

export default Card;