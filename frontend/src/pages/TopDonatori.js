import { useNavigate } from "react-router-dom";

const Top10Donatori = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Top 10 Donatori</h2>
      {/* Conținutul paginii */}
      <button onClick={() => navigate("/meniu")}>Back to Meniu</button>
    </div>
  );
};

export default Top10Donatori;
