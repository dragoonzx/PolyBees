//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

contract TwitterModule {
  mapping(uint256 => TwitterOffer) public offers;
  mapping(address => uint256[]) offersByEmployer;
  mapping(address => uint256[]) offersByInfluencer;
  uint256 counter;

  function newOffer(
    string calldata influencerHandle,
    string calldata requiredText,
    address payable rewardAddress
  ) external payable {
    offers[counter] = TwitterOffer(
      influencerHandle,
      requiredText,
      rewardAddress,
      msg.value,
      msg.sender
    );

    offersByEmployer[msg.sender].push(counter);
    offersByInfluencer[rewardAddress].push(counter);

    counter++;
  }

  function getOffersFromMe() external view returns (TwitterOffer[] memory) {
    uint256[] memory offersIds = offersByEmployer[msg.sender];
    TwitterOffer[] memory result = new TwitterOffer[](offersIds.length);
    for (uint256 i = 0; i < offersIds.length; i++) {
      result[i] = offers[i];
    }

    return result;
  }

  function getOffersToMe() external view returns (TwitterOffer[] memory) {
    uint256[] memory offersIds = offersByInfluencer[msg.sender];
    TwitterOffer[] memory result = new TwitterOffer[](offersIds.length);
    for (uint256 i = 0; i < offersIds.length; i++) {
      result[i] = offers[i];
    }

    return result;
  }

  function resolveOffer(uint256 id) external {
    require(
      msg.sender == 0x1848543e04A38dF7dEEf7Dfd346eFFb4f059a849,
      "This address can't resolve offers"
    );

    TwitterOffer memory offer = offers[id];
    delete offers[id];

    offer.rewardAddress.transfer(offer.rewardAmount);
  }
}

struct TwitterOffer {
  string influencerHandle;
  string requiredText;
  address payable rewardAddress;
  uint256 rewardAmount;
  address author;
}
