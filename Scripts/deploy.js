const hre = require("hardhat");

async function main() {
  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  
  // Deploy the contract
  const contract = await RealEstateToken.deploy();
  
  // Wait for the contract to be deployed (ethers v6 syntax)
  await contract.waitForDeployment();
  
  // Get the contract address (ethers v6 syntax)
  const address = await contract.getAddress();
  
  console.log("Contract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

