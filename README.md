# Simple-Social-Network
A simple ethereum-dapp with Soilidity and React

Technologies Used:
  1. Truffle Framework
  2. Solidity (For backend and deployment code), Testing in Javascript with chai assertion library.
  3. Node, React Framework, Web3js (to interact with deployed smart contract), Javascript, HTML, CSS -> For Front end UI development.
  4. InterPlanetary File System (to store pictures)
  5. Ganache - Personal Ethereum blockchain used for migrating Ethereum Smart Contracts locally. 
  6. Metamask - Crypto Wallet to interact with Ethereum blockchain. All transactions from Web Appliction to Smart Contract are done through this.


# Application Overview:
Simple Social Network is an application similar to all social networking applications, where an user can follow others, create and share posts.

The main features of this D-App are:
1. User:
  * Asks for a username during signing in the for first time.
  * Login/Sign-in is automatic if you have metamask in your phone/ browser.
2. Post :  
  * content (any unicode text format), this whole content string is indexed for keyword search.
  * Links can be attached
  * A single photo can be attached (irrespective of format, size and dimensions).      
          i. Every photo is uploaded to IPFS and its respective link is stored on blockchain.
  * Tips - A user can obtain tips from others, if they like the content of your post. (Logs are also maintained.)
3. Comment for every post:
  * No limit in number of comments for any post.
  * Each comment supports emoji.
  * Clickable comment, to open the profile of the commenter.

Any user can add a comment to any post, and comments are unicode compatible.
This app contains three section :- 
  * Explore Section (Home Page)
  * Profile Section (Username, followers/following list, tips donated/obtained, other activity).
  * Search Section (User can type in a keyword, fetches all posts that contains keyword in their content.
  
 ** All the above data is stored on blockchain, that's what D-App and smart contracts are for. Duh !! 

  
