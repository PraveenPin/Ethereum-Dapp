const SocialNetwork = artifacts.require("SocialNetwork"); /*Artifacts are json files created after compilation 
                                                            .. look in abis folder in src*/

module.exports = function(deployer) {
  deployer.deploy(SocialNetwork);
};