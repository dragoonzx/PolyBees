import { expect, use } from "chai";
import { Contract, Wallet } from "ethers";
import { ethers } from "hardhat";
import { deployContract, MockProvider, solidity } from 'ethereum-waffle';
import { decryptJsonWalletSync } from "@ethersproject/json-wallets";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { TwitterModule } from "../typechain";

describe("TwitterModule", function () {

  let twitterModule : TwitterModule;
  let wallet1: SignerWithAddress;
  let wallet2: SignerWithAddress;

  beforeEach(async function () {
    const TwitterModule = await ethers.getContractFactory("TwitterModule");
    twitterModule = await TwitterModule.deploy();
    await twitterModule.deployed();

    const wallets = await ethers.getSigners();
    wallet1 = wallets[0];
    wallet2 = wallets[1];
  });

  it("Place offer", async function () {
    await twitterModule.connect(wallet1).newOffer("@test", "test!", wallet2.address);
    const myOffers = await twitterModule.connect(wallet1).callStatic.getOffersFromMe();
    expect(myOffers.length == 1);

    const offersByWorker = await twitterModule.connect(wallet2).callStatic.getOffersToMe();
    expect(offersByWorker.length == 1);
  });
});
