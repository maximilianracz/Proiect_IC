import { useNavigate } from "react-router-dom";

const DonariDeschise = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h2>Donări Active</h2>
      {/* Conținutul paginii */}
      <button onClick={() => navigate("/meniu")}>Back to Meniu</button>
    </div>
  );
};

export default DonariDeschise;
