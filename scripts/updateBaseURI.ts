import { ethers } from 'hardhat';
import { SwaprExpeditionsNFT__factory } from '../typechain';
import { address } from '../deployment/deployment.json';

const deploy = async () => {
  const [deployer] = await ethers.getSigners();
  const nft = SwaprExpeditionsNFT__factory.connect(address || '', deployer);
  const tx = await nft.updateBaseURI(
    'ipfs://QmPwWXBidvJjLC1At8f9yoqkPf8UkitwMEKGBRePVkkY3i'
  );

  console.log('Waiting at ' + tx.hash);
  await tx.wait();
  console.log('Update of baseURI completed');
};

deploy();
