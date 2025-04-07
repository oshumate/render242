import React, { useState, useEffect } from 'react';

function AllDishes() {
  const [dishes, setDishes] = useState([]);

  useEffect(() => {
    fetch('https://your-render-app-url/api/dishes')
      .then(response => response.json())
      .then(data => setDishes(data))
      .catch(error => console.error('Error fetching dishes:', error));
  }, []);

  return (
    <div>
      <h1>All Dishes</h1>
      <div>
        {dishes.map(dish => (
          <div key={dish._id}>
            <h2>{dish.dishName}</h2>
            <p>{dish.description}</p>
            <p>{dish.price}</p>
            <img src={dish.img_name} alt={dish.dishName} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AllDishes;
