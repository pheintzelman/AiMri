import axios from "axios";

const API_BASE = "http://localhost:8000"; // Change if hosted

export async function fetchActivations(prompt) {
  const res = await axios.post(`${API_BASE}/activate`, { prompt });
  return res.data.activations;
}

export async function fetchTokens(prompt) {
  const res = await axios.post(`${API_BASE}/tokens`, { prompt });
  return res.data.tokens;
}

export async function fetchLayers() {
  const res = await axios.get(`${API_BASE}/layers`);
  return res.data;
}
