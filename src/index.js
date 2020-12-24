import {network} from './network';
//the OpenGSN contract from BS-tesnet
const GSN = require('@opengsn/gsn');
const RelayProvider = GSN.RelayProvider
//bscoin artifacts contract
const bscoinArtifacts = require('../contracts/bscoin.json');
//Initialize the bscoin contract
let BSCoin =''

// This constant are the address for each contract in OpenGSN 
const RelayHub = network.RelayHub;
const PayMaster = network.PayMaster;
const Forwarder = network.Forwarder;
const StakeManager = network.StakeManager;
const VersionRegistry = network.VersionRegistry;
//Initialize the variables that will contain the account or accounts of the owner
let account, accounts;

//the entire app that will interact with our contract 
const App = {
  //we start here 
  start: async function(){
    const self = this 
    //config the RelayHub and Paymaster on Binance Tesnet Addresses 
    const gsnConfig = {
      loggerConfigration: {
        logLevel: window.location.href.includes('verbose') ? 'debug' : 'error'
      },
      paymasterAddress: PayMaster
    }
    var provider = RelayProvider.newProvider({ provider: web3.currentProvider, config: gsnConfig })
    await provider.init()
    web3.setProvider(provider)

    // Bootstrap the MetaCoin abstraction for Use.
    BSCoin.setProvider(web3.currentProvider)
    //Get the accounts of the owner 
    accounts = await web3.eth.getAccounts();
    account = accounts[0];
    
    console.log(accounts, 'a');

    // Bootstrap the BSCoin abstraction for Use.
    BSCoin.setProvider(web3.currentProvider)
    //calling the balance refreshing 
    self.refreshBalance();
  },

  //The function to refresh the balance of all address 
  refreshBalance: async function(){
    // instead of use "this" we gonna use "self"
    const self = this;
    //Get the balance of all address with this token BSCoin (BSC)
    async function getBalances(address, name ){
      let bal = await BSCoin.methods.balanceOf( address ).call()
      putItem(name, bal);
    }
    //Set the html value of a element
    function putItem (name, val) {
      const item = document.getElementById(name)
      item.innerHTML = val
    }
    //Set address to a html element
    function putAddr (name, addr) {
      putItem(name, self.addressLink(addr))
    }

    //Use the function getBalances to show them in the html
    let bsc = getBalances( account, 'balance' )

     putAddr('balanceAddress', account );
     putItem('balance', bsc );
    
    //Get the balance of the external address in BNB like the paymaster
    
    await web3.eth.getBalance(RelayHub).then((res)=>{
      putItem('paybal', (res / 1e18) )
    })

    //Address of externals contracts and paymaster / relayhub balance in BNB to the HTML
     putAddr('bscoin', BSCoin._address);
     putAddr('paymaster', PayMaster);
     putAddr('relayhub', RelayHub );
     putAddr('forwarder', Forwarder);
  },
  //Function to show the status 
  setStatus: function (message) {
    const status = document.getElementById('status')
    status.innerHTML = message
  },
  //setting the link of baseurl
  link: function (path, text) {
    return '<a href="' + network.baseurl + path + '">' + text + '</a>'
  },
  //set a link to the address
  addressLink: function (addr) {
    return '<a href="' + network.addressUrl + addr + '" target="_info">' + addr + '</a>'
  },
  //set the link to a transaction hash
  txLink: function (addr) {
    return '<a href="' + network.txUrl + addr + '" target="_info">' + addr + '</a>'
  },
  //get some coins to test the contract
  mint: function () {
    const self = this

    BSCoin.methods.mint().send({from: account, useGSN: false }).then( (instance)=>{
      //self.setStatus('Mint: Initiating transaction... (please wait)')
      return instance;
    }).then( (res)=>{
      self.refreshBalance()
      //self.setStatus('Mint transaction complete!<br>\n' ) //+ self.txLink( res ))
    }).catch( (err)=>{
      console.log('mint error:', err)
      //self.setStatus('Error getting balance; see log.')
    });
  },//After the click in send bsc button this function fires
  transfer: document.getElementById('send').addEventListener('click', async ( e ) => {
    e.preventDefault();//this prevent the refreshing browser
    //get the values of the html elements 
    const amount = parseInt(document.getElementById('amount').value)
    const receiver = document.getElementById('address').value
    //make the transfer to an address and you will pay gas with token
    await BSCoin.methods.transfer( receiver, amount ).send({from: account}).then((res) => {
      console.log(res.tx)
    }) 
    
    console.log('res ', receiver, 'amount ', amount )

  }) 
  
}
 window.App = App;
  window.addEventListener("load", async () => {
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      console.log('metamask');
      try {
        // Request account access if needed
        await window.ethereum.enable();
      } catch (error) {
        // User denied account access...
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
    }
    // Non-dapp browsers...
    else {
      console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }

    //INitialize myContract BSCoin
    BSCoin = new web3.eth.Contract( bscoinArtifacts.abi, network.Bscoin );
   
   await App.start();
  
  });


    
    


