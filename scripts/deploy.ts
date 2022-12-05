import { ethers } from 'hardhat';
import { SwaprExpeditionsNFT__factory } from '../typechain';
import { writeFile } from 'fs/promises';
import path from 'path';

const deploy = async () => {
  const [deployer] = await ethers.getSigners();

  const deploymentParams = {
    deployer: deployer.address,
    tokenEmitter: deployer.address,
    name: 'Test Collection Name',
    contractURI: 'ipfs://QmbhiYwsaw7E2Nxfrqj4oHGGsJt7N2xkiJGkzSZEserWEe',
    baseURI: 'ipfs://QmbMQrGigoRnNeLFX4zb9WGV8kboh8ZEfGHqgHswd6Kd2A/',
    domainName: 'Swapr Expeditions',
    version: '1',
    address: '',
  };

  const nft = await new SwaprExpeditionsNFT__factory(deployer).deploy(
    deploymentParams.tokenEmitter,
    deploymentParams.name,
    deploymentParams.contractURI,
    deploymentParams.baseURI,
    deploymentParams.domainName,
    deploymentParams.version
  );

  console.log('Submitted at ' + nft.deployTransaction.hash);
  console.log('Waiting for confirmation...');

  await nft.deployed();
  console.log('Successfully deployed at ' + nft.address);

  deploymentParams.address = nft.address;

  await writeFile(
    path.resolve(__dirname, '..', 'deployment', 'deployment.json'),
    JSON.stringify(deploymentParams, null, 2)
  );
};

deploy();
