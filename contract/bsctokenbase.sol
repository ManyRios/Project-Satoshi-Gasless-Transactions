// SPDX-License-Identifier: MIT
pragma solidity ^0.6.2;

import "./ConvertLib.sol";
import "https://github.com/opengsn/gsn/blob/master/contracts/BaseRelayRecipient.sol";

// This is just a simple example of a coin-like contract.
// It is not standards compatible and cannot be expected to talk to other
// coin/token contracts. If you want to create a standards-compliant
// token, see: https://github.com/ConsenSys/Tokens. Cheers!

//Our contract is a BaseRelayRecipient from OPENGSN
contract Bscoin is BaseRelayRecipient {
    
    //variables to use in our contract
    string public symbol = "BSC";
    string public description = "GSN Sample BSCOIN";
    uint public decimals = 0;

    mapping(address => uint) balances;
    
    //Sent a event when the transfer has done
    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    
    //the constructor will top up our contract 
    constructor(address forwarder) public {
        balances[tx.origin] = 10000;
        trustedForwarder = forwarder;
    }
    //version of the BaseRelayRecipient 
    function versionRecipient() external override view returns (string memory) {
        return "2.0.0";
    }
    //function to send the tokens to a receiver, the gas will be payed by you in tokens, and paymaster with eth, you will transfer this to paymaster
    function transfer(address receiver, uint amount) public returns (bool sufficient) {
        if (balances[_msgSender()] < amount) return false;
        balances[_msgSender()] -= amount;
        balances[receiver] += amount;
        emit Transfer(_msgSender(), receiver, amount);
        return true;
    }
    //function to get the balance of an address
    function balanceOf(address addr) public view returns (uint) {
        return balances[addr];
    }


    mapping(address => bool) minted;

    /**
     * mint some coins for this caller.
     * (in a real-life application, minting is protected for admin, or by other mechanism.
     * but for our sample, any user can mint some coins - but just once..
     */
    function mint() public {
        require(!minted[_msgSender()], "already minted");
        minted[_msgSender()] = true;
        balances[_msgSender()] += 10000;
    }
}