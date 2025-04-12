require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: {
    version: "0.8.21", // 👈 Match your pragma
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
