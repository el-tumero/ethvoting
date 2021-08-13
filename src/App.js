import { Container, Row, Col, InputGroup, Button, FormControl, Spinner, Alert } from 'react-bootstrap'
import './style.css'
import React, {useEffect, useState } from 'react';
import Web3 from 'web3';
import { PolyjuiceHttpProvider } from '@polyjuice-provider/web3';
import { CONFIG } from './config'
import { AddressTranslator } from './nervos-godwoken-integration';
import Voting from './build/contracts/Voting.json'

async function createWeb3() {
  // Modern dapp browsers...
  if (window.ethereum) {
      const godwokenRpcUrl = CONFIG.WEB3_PROVIDER_URL;
      const providerConfig = {
          rollupTypeHash: CONFIG.ROLLUP_TYPE_HASH,
          ethAccountLockCodeHash: CONFIG.ETH_ACCOUNT_LOCK_CODE_HASH,
          web3Url: godwokenRpcUrl
      };

      const provider = new PolyjuiceHttpProvider(godwokenRpcUrl, providerConfig);
      const web3 = new Web3(provider || Web3.givenProvider);

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
  const [l2Balance, setL2Balance] = useState();
  const [polyjuiceAddress, setPolyjuiceAddress] = useState();
  const [votingContract, setContract ] = useState();
  const [candidate, setCandidate] = useState();
  const [candidates, setCandidates ] = useState();
  const [disable, setDisable] = useState(false); 
  const [loading, setLoading] = useState(true);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (accounts?.[0]) {
        const addressTranslator = new AddressTranslator();
        setPolyjuiceAddress(addressTranslator.ethAddressToGodwokenShortAddress(accounts?.[0]));
    } else {
        setPolyjuiceAddress(undefined);
    }
  }, [accounts]);

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
            const _l2Balance = await _web3.eth.getBalance(_accounts[0]);
            setL2Balance(_l2Balance);
        }
    })();
  },[web3]);

  useEffect(() => {
    if(web3){
      const contract = new web3.eth.Contract(Voting.abi, CONFIG.CONTRACT_ADDRESS);
      setContract(contract);
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
      ...CONFIG.DEFAULT_SEND_OPTIONS,
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
      ...CONFIG.DEFAULT_SEND_OPTIONS,
      from: accounts[0],
    });

    window.location.reload();

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
          <p>This may take up to 2 minutes! Press F12 (devtools) and open console for details!</p><Spinner animation="border" size="sm" />
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
        <Col><h1>Polyjuice Voting Dapp</h1></Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col><h5>Your ETH address: {accounts?.[0]}</h5></Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col><h5>Your Polyjuice address: {polyjuiceAddress}</h5></Col>
        <Col></Col>
        </Row>
        <Row>
        <Col></Col>
        <Col><h6>Your Layer 2 funds: {l2Balance/100000000} CKB</h6></Col>
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
