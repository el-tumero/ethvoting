// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

contract Voting {
    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;

    uint256 public candidatesCount;

    constructor() payable {
        candidatesCount = 0;
    }

    function vote(uint256 _id) public payable {
        require(_id < candidatesCount);
        candidates[_id].voteCount++;
    }

    function addCandidate(string memory _name) public payable {
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        candidatesCount++;
    }

    function showCandidates() public view returns (Candidate[] memory) {
        Candidate[] memory _candidates = new Candidate[](candidatesCount);

        for (uint256 i = 0; i < candidatesCount; i++) {
            _candidates[i] = candidates[i];
        }

        return (_candidates);
    }
}
