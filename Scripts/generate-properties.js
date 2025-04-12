const hre = require("hardhat");

async function main() {
  // Get the deployed contract
  const RealEstateToken = await hre.ethers.getContractFactory("RealEstateToken");
  const contract = await RealEstateToken.attach("0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9"); // Replace with your contract address
  
  // Sample property data
  const properties = [
    { location: "123 Main St, New York", price: "1.5" },
    { location: "456 Park Ave, Los Angeles", price: "2.3" },
    { location: "789 Ocean Blvd, Miami", price: "3.1" },
    { location: "101 Lake View, Chicago", price: "1.8" },
    { location: "202 Mountain Rd, Denver", price: "2.0" },
    { location: "303 River St, Austin", price: "1.7" },
    { location: "404 Tech Lane, San Francisco", price: "4.5" },
    { location: "505 Historic Ave, Boston", price: "2.7" },
    { location: "606 Sunny Dr, Phoenix", price: "1.9" },
    { location: "707 Maple St, Seattle", price: "2.2" }
  ];
  
  console.log("Starting to list sample properties...");
  
  // List each property
  for (const property of properties) {
    try {
      const tx = await contract.listProperty(
        property.location, 
        hre.ethers.utils.parseEther(property.price)
      );
      await tx.wait();
      console.log(`Listed property: ${property.location} for ${property.price} ETH`);
    } catch (error) {
      console.error(`Failed to list property ${property.location}:`, error.message);
    }
  }
  
  console.log("Finished listing sample properties!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });