import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { expect } from 'chai';
import {
  SwaprExpeditionsNFT__factory,
  SwaprExpeditionsNFT,
} from '../typechain';
import { BigNumberish } from 'ethers';

type ClaimingData = {
  receiver: string;
  tokenId: BigNumberish;
};

describe('SwaprExpeditionsrNFT', () => {
  const domainName = 'SwaprExpeditions';
  const domainVersion = '1';
  const chainId = 31337;
  const baseURI = 'ipfs://abcd1234/';
  const contractURI = 'ipfs://1234abc';
  const name = 'Name';
  const uris = ['1.json', '2.json', '3.json'];

  let owner: SignerWithAddress;
  let tokenEmitter: SignerWithAddress;
  let user: SignerWithAddress;

  let nft: SwaprExpeditionsNFT;

  let createSignature: (
    data: ClaimingData,
    signer?: SignerWithAddress
  ) => Promise<string>;

  beforeEach(async () => {
    [owner, tokenEmitter, user] = await ethers.getSigners();

    nft = await new SwaprExpeditionsNFT__factory(owner).deploy(
      tokenEmitter.address,
      name,
      contractURI,
      baseURI,
      domainName,
      domainVersion
    );

    createSignature = async (
      data: ClaimingData,
      signer?: SignerWithAddress
    ) => {
      signer = signer || tokenEmitter;

      const domain = {
        name: domainName,
        version: domainVersion,
        chainId: chainId,
        verifyingContract: nft.address,
      };

      const types = {
        ClaimingData: [
          { name: 'receiver', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
      };

      const signature = await signer._signTypedData(domain, types, data);

      return signature;
    };
  });
  describe('updateName', () => {
    it('reverts when called by non-owner', async () => {
      await expect(nft.connect(user).updateName('newName')).to.be.reverted;
    });

    it('updates name', async () => {
      const newName = 'newName';
      const previousName = await nft.name();
      expect(previousName).to.equal(name);

      const tx = await nft.connect(owner).updateName(newName);
      await tx.wait();

      const newNameResult = await nft.name();

      expect(newNameResult).to.equal(newName);
    });
  });
  describe('updateTokenEmitter', () => {
    it('reverts when called by non-owner', async () => {
      await expect(nft.connect(user).updateTokenEmitter(user.address)).to.be
        .reverted;
    });

    it('reverts when new token emitter is address zero', async () => {
      await expect(
        nft.connect(owner).updateTokenEmitter(ethers.constants.AddressZero)
      ).to.be.reverted;
    });

    it('updates tokenEmitter', async () => {
      const previousTokenEmitter = await nft.tokenEmitter();
      expect(previousTokenEmitter).to.equal(tokenEmitter.address);

      const tx = await nft.connect(owner).updateTokenEmitter(user.address);
      await tx.wait();

      const newTokenEmitter = await nft.tokenEmitter();

      expect(newTokenEmitter).to.equal(user.address);
    });
  });
  describe('updateContractURI', () => {
    it('reverts when called by non-owner', async () => {
      await expect(nft.connect(user).updateContractURI('new contract uri')).to
        .be.reverted;
    });

    it('updates contract uri', async () => {
      const newContractURI = 'newContractURI';
      const previousContractURI = await nft.contractURI();
      expect(previousContractURI).to.equal(contractURI);

      const tx = await nft.connect(owner).updateContractURI(newContractURI);
      await tx.wait();

      const newContractURIResult = await nft.contractURI();

      expect(newContractURIResult).to.equal(newContractURI);
    });
  });

  describe('updateBaseURI', () => {
    it('reverts when called by non-owner', async () => {
      await expect(nft.connect(user).updateBaseURI('newUri')).to.be.reverted;
    });
    it('updates base uri', async () => {
      const tx = await nft.connect(owner).addRewards([uris[0]]);
      await tx.wait();

      const updatedBaseURI = 'test/';

      const uriUpdateTx = await nft.updateBaseURI(updatedBaseURI);
      await uriUpdateTx.wait();

      const updatedResolvedURI = await nft.uri(1);
      expect(updatedResolvedURI).to.equal(`${updatedBaseURI}${uris[0]}`);
    });
  });
  describe('updateURI', () => {
    it('reverts when called by non-owner', async () => {
      const tx = await nft.connect(owner).addRewards([uris[0]]);
      await tx.wait();

      await expect(nft.connect(user).updateURI(1, 'test')).to.be.reverted;
    });
    it('reverts for non-existing reward', async () => {
      await expect(nft.connect(owner).updateURI(1, 'test')).to.be.reverted;
    });
    it('updates uri', async () => {
      const tx = await nft.connect(owner).addRewards([uris[0]]);
      await tx.wait();

      const updatedURI = 'test';

      const uriUpdateTx = await nft.updateURI(1, updatedURI);
      await uriUpdateTx.wait();

      const updatedResolvedURI = await nft.uri(1);
      expect(updatedResolvedURI).to.equal(`${baseURI}${updatedURI}`);
    });
  });

  describe('addRewards', () => {
    it('reverts when called by non-owner', async () => {
      await expect(nft.connect(user).addRewards(['a', 'b'])).to.be.reverted;
    });
    it('adds single reward', async () => {
      const tx1 = await nft.connect(owner).addRewards([uris[0]]);
      await tx1.wait();

      const resolvedURI1 = await nft.uri(1);
      expect(resolvedURI1).to.equal(`${baseURI}${uris[0]}`);

      const tx2 = await nft.connect(owner).addRewards([uris[1]]);
      await tx2.wait();

      const resolvedURI2 = await nft.uri(2);
      expect(resolvedURI2).to.equal(`${baseURI}${uris[1]}`);
    });
    it('adds multiple rewards', async () => {
      const tx = await nft.connect(owner).addRewards(uris);
      await tx.wait();

      const resolvedURI1 = await nft.uri(1);
      const resolvedURI2 = await nft.uri(2);
      const resolvedURI3 = await nft.uri(3);
      expect(resolvedURI1).to.equal(`${baseURI}${uris[0]}`);
      expect(resolvedURI2).to.equal(`${baseURI}${uris[1]}`);
      expect(resolvedURI3).to.equal(`${baseURI}${uris[2]}`);
    });
  });

  describe('claimReward', () => {
    beforeEach(async () => {
      const tx = await nft.connect(owner).addRewards([uris[0]]);
      await tx.wait();
    });

    it('reverts when signature was not signed by tokenEmitter', async () => {
      const signature = await createSignature(
        {
          receiver: user.address,
          tokenId: 1,
        },
        user
      );

      await expect(nft.connect(user).claimReward(1, signature)).to.be.reverted;
    });
    it('reverts when collected by incorrect receiver', async () => {
      const signature = await createSignature({
        receiver: tokenEmitter.address,
        tokenId: 1,
      });

      await expect(nft.connect(user).claimReward(1, signature)).to.be.reverted;
    });
    it('reverts when incorrect token is claimed', async () => {
      const tx = await nft.connect(owner).addRewards([uris[1]]);
      await tx.wait();

      const signature = await createSignature({
        receiver: user.address,
        tokenId: 1,
      });

      await expect(nft.connect(user).claimReward(2, signature)).to.be.reverted;
    });
    it('reverts when reward does not exists', async () => {
      const signature = await createSignature({
        receiver: user.address,
        tokenId: 10,
      });

      await expect(nft.connect(user).claimReward(10, signature)).to.be.reverted;
    });
    it('reverts when already claimed', async () => {
      const signature = await createSignature({
        receiver: user.address,
        tokenId: 1,
      });

      const tx = await nft.connect(user).claimReward(1, signature);
      await tx.wait();

      await expect(nft.connect(user).claimReward(1, signature)).to.be.reverted;
    });
    it('can be claimed', async () => {
      const signature = await createSignature({
        receiver: user.address,
        tokenId: 1,
      });

      const transaction = await nft.connect(user).claimReward(1, signature);

      expect(transaction).not.to.be.reverted;

      const userBalance = await nft.balanceOf(user.address, 1);
      expect(userBalance.toString()).to.equal('1');
    });
  });
  describe.only('getRewardsStatus', () => {
    it('returns correct status of claimed rewards', async () => {
      const tx = await nft.connect(owner).addRewards(uris);
      await tx.wait();

      const token1Sig = await createSignature({
        receiver: user.address,
        tokenId: 1,
      });
      await nft.connect(user).claimReward(1, token1Sig);

      const token3Sig = await createSignature({
        receiver: user.address,
        tokenId: 3,
      });

      await nft.connect(user).claimReward(3, token3Sig);

      const rewardsBalance = await nft.connect(user).getRewardsStatus();

      expect(rewardsBalance[0]).to.be.true;
      expect(rewardsBalance[1]).to.be.false;
      expect(rewardsBalance[2]).to.be.true;
    });
  });
});
