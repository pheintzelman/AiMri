import { useEffect, useState } from "react";
import { fetchLayers, fetchTokens } from "../services/api";

export default function LayerSelector({ onChange, prompt }) {
  const [numLayers, setNumLayers] = useState(0);
  const [sublayers, setSubLayers] = useState({});
  const [tokens, setTokens] = useState([]); // You can pass this in instead if preferred
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedSublayer, setSelectedSublayer] = useState("hook_resid_pre");
  const [selectedToken, setSelectedToken] = useState(0);

  useEffect(() => {
    async function fetchLayerInfo() {
      try {
        const data = await fetchLayers();
        setNumLayers(data.num_layers || 0);
        setSubLayers(data.sub_layers);
      } catch (err) {
        console.error("Failed to fetch layer info", err);
      }
    }

    async function fetchTokenInfo(prompt) {
      try {
        const data = await fetchTokens(prompt);
        console.log(data);
        setTokens(data);
      } catch (err) {
        console.error("Failed to fetch tokens", err);
      }
    }

    fetchLayerInfo();
    fetchTokenInfo(prompt);
  }, []);

  useEffect(() => {
    onChange?.({
      layer: selectedLayer,
      sublayer: selectedSublayer,
      token: selectedToken,
    });
  }, [selectedLayer, selectedSublayer, selectedToken]);

  return (
    <div
      style={{
        display: "flex",
        gap: "1rem",
        alignItems: "center",
        marginBottom: "1rem",
      }}
    >
      <div>
        <label>Layer: </label>
        <select
          value={selectedLayer}
          onChange={(e) => setSelectedLayer(Number(e.target.value))}
        >
          {Array.from({ length: numLayers }, (_, i) => (
            <option key={i} value={i}>
              Layer {i}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Sublayer: </label>
        <select
          value={selectedSublayer}
          onChange={(e) => setSelectedSublayer(e.target.value)}
        >
          {Object.values(sublayers).map((sublayer) => (
            <option key={sublayer.name} value={sublayer.name}>
              {sublayer.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label>Token: </label>
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(Number(e.target.value))}
        >
          {Array.isArray(tokens) ? (
            tokens.map((token) => (
              <option key={token.id || token.index} value={token.index}>
                {token.token === "<|endoftext|>" ? "[END]" : token.token} (
                {token.index})
              </option>
            ))
          ) : (
            <option>Loading tokens...</option>
          )}
        </select>
      </div>
    </div>
  );
}
