document.addEventListener('DOMContentLoaded', () => {
    const links = document.querySelectorAll('.sidebar a');
    const output = document.getElementById('output');
    const title  = document.getElementById('title');
    const refreshBtn = document.getElementById('refresh');
    let currentEndpoint = null;
  
    async function fetchAndRender(endpoint) {
      try {
        const res = await fetch(endpoint);
        const data = await res.json();
        output.textContent = JSON.stringify(data, null, 2);
      } catch (err) {
        output.textContent = `Error: ${err.message}`;
      }
    }
  
    links.forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        // highlight
        links.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
  
        currentEndpoint = link.dataset.endpoint;
        title.textContent = `GET ${currentEndpoint}`;
        fetchAndRender(currentEndpoint);
      });
    });
  
    refreshBtn.addEventListener('click', () => {
      if (currentEndpoint) fetchAndRender(currentEndpoint);
    });
  });
  