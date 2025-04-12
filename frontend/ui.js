export function renderProperties(properties, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    properties.forEach(prop => {
      const card = document.createElement('div');
      card.className = 'property-card';
      card.innerHTML = `
        <h3>${prop.title}</h3>
        <p>${prop.description}</p>
        <p>Price: ${prop.price} ETH</p>
        <p>Owner: ${prop.owner}</p>
        <button onclick="buyProperty(${prop.propertyId})">Buy</button>
        ${window.userAddress === prop.owner ? 
          `<button onclick="deleteProperty(${prop.propertyId})">Delete</button>` : ''}
      `;
      container.appendChild(card);
    });
  }
  