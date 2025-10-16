import axios from 'axios'

// cambiar o no se ahi ustedes vean es su parte
const API_URL = 'http://127.0.0.1:8000';

export const loginApi = async (email, password) => {
  const res = await axios.post(`${API_URL}/administrador/login`, { email, password })
  return res.data
}
