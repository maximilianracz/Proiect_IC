import { useNavigate } from "react-router-dom";

const AdaugaCerere = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Adaugă Donare</h2>
      {/* Conținutul paginii */}
      <button onClick={() => navigate("/meniu")}>Back to Meniu</button>
    </div>
  );
};

export default AdaugaCerere;
