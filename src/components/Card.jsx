import React, { Component } from 'react';
import Identicon from 'identicon.js';

class Card extends Component {

  render() {
    return (
      <div>
        <div className="row">
          <main role="main" className="col-lg-12 ml-auto mr-auto" style={{ maxWidth: '500px' }}>
            <div className="content mr-auto ml-auto">
              <p>&nbsp;Explore:</p>
                <form onSubmit={(event) => {
                  event.preventDefault();
                  const content = this.postContent.value;
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
                        <button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={post.pid}
                          onClick={(event) => {
                            let tipAmount = window.web3.utils.toWei('0.1', 'Ether');
                            console.log(event.target.name, tipAmount);
                            this.props.tipPost(event.target.name, tipAmount);
                          }}
                        >
                          TIP 0.1 ETH
                        </button>
                        <button
                          className="btn btn-link btn-sm float-right pt-0"
                          name={`follow-${post.pid}`}
                          onClick={(event) => {
                            console.log(event.target.name, "Following the author");
                            this.props.followAuthor(post.authorId);
                          }}
                        >
                          Follow Author
                        </button>
                      </li>
                    </ul>
                  </div>
                )
              })}
            </div>
          </main>
        </div>
      </div>
    );
  }
}

export default Card;