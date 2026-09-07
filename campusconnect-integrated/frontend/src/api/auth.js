import { api, setToken } from "./client";

// fastapi-users' JWT login endpoint expects OAuth2 password-flow form
// encoding (username + password), not JSON.
export async function login(email, password) {
  const form = new URLSearchParams();
  form.set("username", email);
  form.set("password", password);
  const result = await api.postForm("/auth/jwt/login", form);
  setToken(result.access_token);
  return result;
}

export function logout() {
  setToken(null);
}

export async function getCurrentUser() {
  // /whoami is simpler than /users/me for this purpose — it already
  // returns exactly the role/department/committee fields the UI needs.
  return api.get("/whoami");
}
