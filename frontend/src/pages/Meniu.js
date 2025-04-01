import { useNavigate } from "react-router-dom";

const Meniu = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user"); // Ștergem user-ul din localStorage
    navigate("/login", { replace: true });
  };

  return (
    <div>
      <h1>Meniu principal</h1>
      <button onClick={() => navigate("/harta")}>Harta</button>
      <button onClick={() => navigate("/adauga-cerere")}>Adaugă cerere donație</button>
      <button onClick={() => navigate("/top-donatori")}>Top 10 donatori</button>
      <button onClick={() => navigate("/donari-deschise")}>Donații deschise</button>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Meniu;

