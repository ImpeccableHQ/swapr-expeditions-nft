import { ethers } from 'hardhat';
import { SwaprExpeditionsNFT__factory } from '../typechain';
import deployment from '../deployment/deployment.json';

const deploy = async () => {
  const [deployer] = await ethers.getSigners();
  const address = process.env.NFT_ADDRESS;
  const nft = SwaprExpeditionsNFT__factory.connect(address || '', deployer);
  const domain = {
    name: deployment.domainName,
    version: deployment.version,
    chainId: 5,
    verifyingContract: deployment.address,
  };

  const types = {
    ClaimingData: [
      { name: 'receiver', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  };

  const data = {
    tokenId: 1,
    receiver: deployment.address,
  };

  const signature = await deployer._signTypedData(domain, types, data);

  const tx = await nft.claimReward(1, signature);

  console.log('Waiting at ' + tx.hash);
  await tx.wait();
  console.log('Claimed successfully');
};

deploy();
