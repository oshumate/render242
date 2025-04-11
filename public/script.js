document.addEventListener('DOMContentLoaded', () => {
  // Select the links from the sidebar list (specifically within the <ul> element)
  const links = document.querySelectorAll('.sidebar ul li a');
  const output = document.getElementById('output');
  const title  = document.getElementById('title');
  const refreshBtn = document.getElementById('refresh');
  let currentEndpoint = null;

  // Function to fetch data from the API and display it in the output pre element
  async function fetchAndRender(endpoint) {
    try {
      const res = await fetch(endpoint);
      const data = await res.json();
      output.textContent = JSON.stringify(data, null, 2);
    } catch (err) {
      output.textContent = `Error: ${err.message}`;
    }
  }

  // Add event listeners to each API link
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      // Remove active class from all links and add to the current link for highlighting
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Get the API endpoint from the link's data-endpoint attribute
      currentEndpoint = link.dataset.endpoint;
      // Update the title to reflect the selected endpoint and its purpose
      title.textContent = `GET ${link.textContent}`;
      // Fetch and render the JSON data from the endpoint
      fetchAndRender(currentEndpoint);
    });
  });

  // Refresh button to re-fetch data from the currently selected endpoint
  refreshBtn.addEventListener('click', () => {
    if (currentEndpoint) {
      fetchAndRender(currentEndpoint);
    }
  });
});
