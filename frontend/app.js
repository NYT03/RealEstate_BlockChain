let signer, contract;

// Initialize the page when it loads
window.addEventListener('DOMContentLoaded', function() {
  // Check if wallet was previously connected
  if (localStorage.getItem('walletConnected') === 'true') {
    connectWallet();
  }
  
  // Highlight the active page in navigation
  const currentPage = window.location.pathname.split('/').pop();
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks.forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
});

async function connectWallet() {
  try {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    signer = provider.getSigner();

    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    const address = await signer.getAddress();
    document.getElementById("walletAddress").innerText = `Connected: ${address}`;
    
    // Store connection state
    localStorage.setItem('walletConnected', 'true');
    
    // Display contract owner
    await displayContractOwner();
    
    // Load properties based on current page
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'index.html' || currentPage === '' || currentPage === 'buy-property.html') {
      loadProperties();
    }
    
    if (currentPage === 'set-for-sale.html' || currentPage === 'delete-property.html') {
      loadUserProperties();
    }
  } catch (error) {
    console.error("Error connecting wallet:", error);
    alert("Failed to connect wallet: " + (error.reason || error.message || "Unknown error"));
  }
}

document.getElementById("connectWallet").onclick = connectWallet;

async function listProperty() {
  try {
    const location = document.getElementById("propertyLocation").value;
    const price = ethers.utils.parseEther(document.getElementById("propertyPrice").value);
    
    // Check if the current user is the owner
    const contractOwner = await contract.owner();
    const currentUser = await signer.getAddress();
    
    if (contractOwner.toLowerCase() !== currentUser.toLowerCase()) {
      alert("Only the contract owner can list properties. Please connect with the owner wallet.");
      return;
    }
    
    const tx = await contract.listProperty(location, price);
    await tx.wait();
    alert("Property listed successfully!");
    
    // Clear form fields
    document.getElementById("propertyLocation").value = "";
    document.getElementById("propertyPrice").value = "";
  } catch (error) {
    console.error("Error listing property:", error);
    alert("Failed to list property: " + (error.reason || error.message || "Unknown error"));
  }
}

async function setForSale() {
  try {
    const id = document.getElementById("propertyIdSetSale").value;
    const price = ethers.utils.parseEther(document.getElementById("salePrice").value);
    const tx = await contract.setForSale(id, price);
    await tx.wait();
    alert("Property set for sale successfully!");
    
    // Clear form fields
    document.getElementById("propertyIdSetSale").value = "";
    document.getElementById("salePrice").value = "";
    
    // Reload user properties
    loadUserProperties();
  } catch (error) {
    console.error("Error setting property for sale:", error);
    alert("Failed to set property for sale: " + (error.reason || error.message || "Unknown error"));
  }
}

async function buyProperty() {
  try {
    const id = document.getElementById("buyPropertyId").value;
    const prop = await contract.properties(id);
    const tx = await contract.buyProperty(id, { value: prop.price });
    await tx.wait();
    alert("Property purchased successfully!");
    
    // Clear form field
    document.getElementById("buyPropertyId").value = "";
    
    // Reload properties
    loadProperties();
  } catch (error) {
    console.error("Error buying property:", error);
    alert("Failed to buy property: " + (error.reason || error.message || "Unknown error"));
  }
}

async function deleteProperty() {
  try {
    const id = document.getElementById("deletePropertyId").value;
    
    // Instead of transferring to zero address, call a specific burn or delete function
    // If your contract has a burn function:
    const tx = await contract.burn(id);
    // If your contract doesn't have a burn function but has a specific delete function:
    // const tx = await contract.deleteProperty(id);
    
    await tx.wait();
    alert("Property deleted successfully!");
    
    // Clear form field
    document.getElementById("deletePropertyId").value = "";
    
    // Reload user properties if on the appropriate page
    if (document.getElementById("userProperties")) {
      loadUserProperties();
    }
  } catch (error) {
    console.error("Error deleting property:", error);
    alert("Failed to delete property: " + (error.reason || error.message || "Unknown error"));
  }
}

async function loadProperties() {
  const container = document.getElementById("marketplace");
  if (!container) return;
  
  container.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    try {
      const prop = await contract.properties(i);
      const owner = await contract.ownerOf(i);
      const div = document.createElement("div");
      div.className = "card";
      div.innerHTML = `
        <p><strong>ID:</strong> ${i}</p>
        <p><strong>Location:</strong> ${prop.location}</p>
        <p><strong>Price:</strong> ${ethers.utils.formatEther(prop.price)} ETH</p>
        <p><strong>Owner:</strong> ${owner}</p>
      `;
      container.appendChild(div);
    } catch (err) {
      continue; // If property doesn't exist
    }
  }
}

async function loadUserProperties() {
  const container = document.getElementById("userProperties");
  if (!container) return;
  
  const currentUser = await signer.getAddress();
  container.innerHTML = "";
  
  for (let i = 0; i < 10; i++) {
    try {
      const owner = await contract.ownerOf(i);
      
      // Only show properties owned by the current user
      if (owner.toLowerCase() === currentUser.toLowerCase()) {
        const prop = await contract.properties(i);
        const div = document.createElement("div");
        div.className = "card";
        div.innerHTML = `
          <p><strong>ID:</strong> ${i}</p>
          <p><strong>Location:</strong> ${prop.location}</p>
          <p><strong>Price:</strong> ${ethers.utils.formatEther(prop.price)} ETH</p>
        `;
        container.appendChild(div);
      }
    } catch (err) {
      continue; // If property doesn't exist
    }
  }
}

async function displayContractOwner() {
  try {
    const ownerAddress = await contract.owner();
    const currentAddress = await signer.getAddress();
    
    // Check if element already exists
    let ownerElement = document.getElementById('contractOwner');
    
    // If it doesn't exist, create it
    if (!ownerElement) {
      ownerElement = document.createElement('div');
      ownerElement.id = 'contractOwner';
      
      // Insert after wallet address
      const walletAddressElement = document.getElementById('walletAddress');
      walletAddressElement.parentNode.insertBefore(ownerElement, walletAddressElement.nextSibling);
    }
    
    // Update the content
    ownerElement.innerHTML = `<strong>Contract Owner:</strong> ${ownerAddress}`;
    ownerElement.style.textAlign = 'center';
    ownerElement.style.marginBottom = '20px';
    ownerElement.style.fontFamily = 'monospace';
    ownerElement.style.padding = '10px';
    ownerElement.style.borderRadius = '4px';
    ownerElement.style.backgroundColor = '#e8f4fd';
    
    // Highlight if current user is the owner
    if(ownerAddress.toLowerCase() === currentAddress.toLowerCase()) {
      ownerElement.style.backgroundColor = '#d4edda';
      ownerElement.innerHTML += ' <span style="color: #28a745">(You are the owner)</span>';
    }
  } catch (error) {
    console.error("Error getting contract owner:", error);
  }
}
