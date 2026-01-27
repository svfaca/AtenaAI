import { isAuthenticated } from "./auth.js";

console.log("GUARD TOKEN:", localStorage.getItem("access_token"));

if (!isAuthenticated()) {
  window.location.href = "login.html";
}
