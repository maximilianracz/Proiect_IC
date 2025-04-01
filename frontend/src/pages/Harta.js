import { useNavigate } from "react-router-dom";

const Harta = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Harta</h2>
      {/* Conținutul paginii */}
      <button onClick={() => navigate("/meniu")}>Back to Meniu</button>
    </div>
  );
};

export default Harta;
