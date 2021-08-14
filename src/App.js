import { Container, Row, Col, InputGroup, Button, FormControl, Spinner, Alert } from 'react-bootstrap'
import './style.css'
import React, {useEffect, useState } from 'react';
import Web3 from 'web3';
import Voting from './build/contracts/Voting.json'

async function createWeb3() {
  // Modern dapp browsers...
  if (window.ethereum) {
      const web3 = new Web3(
        window.ethereum
      );

      try {
          // Request account access if needed
          await window.ethereum.enable();
      } catch (error) {
          // User denied account access...
      }

      return web3;
  }
  console.log('Non-Ethereum browser detected. You should consider trying MetaMask!');
  return null;
}

function App() {

  const [web3, setWeb3] = useState();
  const [accounts, setAccounts] = useState();
  const [balance, setBalance] = useState();
  const [votingContract, setContract ] = useState();
  const [candidate, setCandidate] = useState();
  const [candidates, setCandidates ] = useState();
  const [disable, setDisable] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);


  useEffect(() => {
    if (web3) {
        return;
    }
    (async () => {
        const _web3 = await createWeb3();
        setWeb3(_web3);
  
        const _accounts = [window.ethereum.selectedAddress];
        setAccounts(_accounts);
  
        if (_accounts && _accounts[0]) {
            const _balance = await _web3.eth.getBalance(_accounts[0]);
            setBalance(_balance);
        }
    })();
  },[web3]);

  useEffect(() => {
    if(web3) initContract();
      async function initContract(){
        const networkId = await web3.eth.net.getId();
        const contractNetwork = Voting.networks[networkId]
        if(contractNetwork){
          const contract = new web3.eth.Contract(Voting.abi, contractNetwork.address);
          setContract(contract);
        }
        else{
          window.alert('Token contract not deployed to detected network. Use Rinkeby Testnet instead!')
        } 
      }
  }, [web3]);

  useEffect(() => {
    if(votingContract){
      fetchData();
    }

    async function fetchData(){
        const list = await votingContract.methods.showCandidates().call();
        var candidatesArray = [];
        for(var i = 0; i<list.length; i++){
          candidatesArray[i] = {"id": list[i][0], "name": list[i][1], "votes": list[i][2]}
          //candidatesArray[i] = [list[i][0], list[i][1], list[i][2]]
        }
        setCandidates(candidatesArray);
        setLoading(false);
    }
  }, [votingContract])


  function handleChange(e) {
    setCandidate(e.target.value)
  }

  async function vote(e) {
    e.preventDefault();
    setDisable(true);
    setShow(true);
    const result = await votingContract.methods.vote(e.target.value).send({
      from: accounts[0],
    })

    window.location.reload()

    console.log(result);

  }


  async function addCandidate(e) {
    setDisable(true);
    e.preventDefault();
    setShow(true);

    const result = await votingContract.methods.addCandidate(candidate).send({
      from: accounts[0],
    })

    window.location.reload()

    console.log(result)
  }


  function CandidatesList() {
    if(candidates){
    const listCandidates = candidates.map((obj, index) => {
        return(
          <div key={index}>id:{obj.id} name:{obj.name} votes:{obj.votes} <Button disabled={disable} onClick={vote} value={obj.id}>Vote</Button></div>
        )
    });

    return (
      <div>{listCandidates}</div>
    );
    }
    else return(
      <div></div>
    );
  }


  function AlertTransaction() {
    if (show) {
      return (
        <Alert variant="warning" onClose={() => setShow(false)} dismissible>
          <Alert.Heading>Transaction in progress...</Alert.Heading>
          <p>This may take a while!</p><Spinner animation="border" size="sm" />
        </Alert>
      )
    }
    if (!show) return (<div></div>)
  }



if(loading === false){
  return (
    <div>
      <Container className='content'>
        <Row>
        <Col></Col>
        <Col><h1>ETH Voting Dapp</h1></Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col><h6 className="info">Rinkeby Testnet version</h6></Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col><h5>Your ETH address: {accounts?.[0]}</h5></Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col><h6>Your ETH funds: {balance/1000000000000000000} ETH</h6></Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col><h2>Vote for a candidate:</h2></Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col>
        <CandidatesList />
        </Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col><h3>Add a candidate: </h3></Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col>
        <form onSubmit={addCandidate}>
        <InputGroup className="mb-3">
          <FormControl placeholder="Candidate name" onChange={handleChange} />
          <Button id="button-addon2" disabled={disable} type="submit">
            Add
          </Button>
        </InputGroup>
        </form>
        </Col>
        <Col></Col>
        </Row>
        <Row>
          <Col></Col>
          <Col><AlertTransaction></AlertTransaction></Col>
          <Col></Col>
        </Row>
      </Container>
    </div>
  );
  }
  if(loading === true){
    return(
      <div>
        <Container className='content'>
          <Row>
            <Col />
            <Col>
            <Spinner className="loader" animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
            </Col>
            <Col />
          </Row>
        </Container>

      </div>
    )
  }
}

export default App;
