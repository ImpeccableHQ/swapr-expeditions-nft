import { ethers } from 'hardhat';
import { expect } from 'chai';
import { SwaprExpeditionsNFT__factory } from '../typechain';

describe('SwaprExpeditionsNFT', () => {
  describe('claimReward', () => {
    it('can be claimed once', async () => {
      const [deployer, tokenEmitter, user] = await ethers.getSigners();

      const domainName = 'SwaprExpeditions';
      const domainVersion = '1';

      const NFT = await new SwaprExpeditionsNFT__factory(deployer).deploy(
        tokenEmitter.address,
        '',
        domainName,
        domainVersion
      );

      const domain = {
        name: domainName,
        version: domainVersion,
        chainId: 31337,
        verifyingContract: NFT.address,
      };

      const types = {
        ClaimingData: [
          { name: 'receiver', type: 'address' },
          { name: 'tokenId', type: 'uint256' },
        ],
      };

      const data = {
        receiver: user.address,
        tokenId: 1,
      };

      const signature = await tokenEmitter._signTypedData(domain, types, data);

      const transaction = await NFT.connect(user).claimReward(1, signature);

      expect(transaction).not.to.be.reverted;
    });
    // it('works only when signature was emitted by tokenEmitter', async () => {});
    // it('works only when collected by correct receiver', async () => {});
    // it('works only when correct token is claimed', async () => {});
    // it('claims only single token', async () => {});
  });
  // describe('addRewards', () => {
  //   it('can add single reward', async () => {});
  //   it('can add multiple rewards', async () => {});
  // });
});
