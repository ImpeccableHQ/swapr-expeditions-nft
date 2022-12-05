import { ethers } from 'hardhat';
import { SwaprExpeditionsNFT__factory } from '../typechain';
import { address } from '../deployment/deployment.json';

const deploy = async () => {
  const [deployer] = await ethers.getSigners();
  const nft = SwaprExpeditionsNFT__factory.connect(address || '', deployer);
  const tx = await nft.updateContractURI(
    'ipfs://QmYQ5mLkp9wDDtdHjTMrii6duk2wBjVtw28514m73GNefU'
  );

  console.log('Waiting at ' + tx.hash);
  await tx.wait();
  console.log('Update of contractURI completed');
};

deploy();
