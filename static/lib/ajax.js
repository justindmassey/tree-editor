export async function get(url, responseType = "json") {
  return fetch(url, { credentials: "include" }).then(function (response) {
    return response[responseType]();
  });
}

export async function post(url, data, responseType = "json") {
  return fetch(url, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  }).then(function (response) {
    return response[responseType]();
  });
}
