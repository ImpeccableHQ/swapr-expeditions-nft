import { ethers } from 'hardhat';
import { SwaprExpeditionsNFT__factory } from '../typechain';
import { address } from '../deployment/deployment.json';

const deploy = async () => {
  const [deployer] = await ethers.getSigners();
  const nft = SwaprExpeditionsNFT__factory.connect(address || '', deployer);
  const tx = await nft.addRewards([
    '1.json',
    '2.json',
    '3.json',
    '4.json',
    '5.json',
    '6.json',
    '7.json',
    '8.json',
    '9.json',
    '10.json',
  ]);

  console.log('Waiting at ' + tx.hash);
  await tx.wait();
  console.log('Rewards succesfully added. You can now browse them on opensea');
};

deploy();
