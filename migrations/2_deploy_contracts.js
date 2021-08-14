const Voting = artifacts.require('Voting.sol');

module.exports = async function(deployer) {
    // Deploy Voting
    await deployer.deploy(Voting);
  };