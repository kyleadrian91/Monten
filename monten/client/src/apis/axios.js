import axios from "axios";

export default axios.create({
  baseURL: "http://localhost:4000",
  headers: { authorization: localStorage.getItem("token") }
});
