export async function get(url, responseType = "json") {
  return fetch(url, { credentials: "include" }).then(function (response) {
    return response[responseType]();
  });
}

export async function post(url, data, responseType = "json") {
  let contentType;
  if(typeof data == 'string') {
    contentType = "text/plain"
  } else {
    contentType = "application/json"
    data = JSON.stringify(data)
  }
  return fetch(url, {
    credentials: "include",
    method: "POST",
    headers: { "Content-Type": contentType },
    body: data,
  }).then(function (response) {
    return response[responseType]();
  });
}
