import React from "react";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Bine ai venit!</h1>
      <Link to="/signup">Înregistrare</Link> | <Link to="/login">Autentificare</Link>
    </div>
  );
}

export default Home;
