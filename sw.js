// Generado al compilar: 2026-11-27T19:16:58.720Z
(function serviceWorker(CACHE, PREFIJO, BASE) {
	const sw = self;
	const SIN_CONEXION = BASE + "/sin-conexion/";
	const ESPERA_MS = 1e3;
	sw.addEventListener("install", (e) => {
		e.waitUntil(caches.open(CACHE).then((c) => c.addAll([SIN_CONEXION, BASE + "/"])).then(() => sw.skipWaiting()));
	});
	sw.addEventListener("activate", (e) => {
		e.waitUntil(caches.keys().then((claves) => Promise.all(claves.filter((k) => (k.startsWith(PREFIJO) || k.startsWith("ckoido-app-")) && k !== CACHE).map((k) => caches.delete(k)))).then(() => sw.clients.claim()));
	});
	const guardar = (pedido, respuesta) => {
		if (respuesta.ok && respuesta.type === "basic") {
			const copia = respuesta.clone();
			caches.open(CACHE).then((c) => c.put(pedido, copia));
		}
		return respuesta;
	};
	sw.addEventListener("fetch", (e) => {
		const pedido = e.request;
		const u = new URL(pedido.url);
		if (pedido.method !== "GET" || u.origin !== sw.location.origin) return;
		if (u.pathname.startsWith(BASE + "/_astro/")) {
			e.respondWith(caches.match(pedido).then((r) => r || fetch(pedido).then((resp) => guardar(pedido, resp))));
			return;
		}
		if (pedido.mode === "navigate") {
			const red = fetch(pedido).then((resp) => guardar(pedido, resp));
			e.waitUntil(red.catch(() => void 0));
			const copia = () => caches.match(pedido, { ignoreSearch: true });
			const esperar = new Promise((listo) => setTimeout(() => copia().then(listo), ESPERA_MS));
			e.respondWith(Promise.race([red, esperar.then((r) => r || red)]).catch(() => copia().then((r) => r || caches.match(SIN_CONEXION)).then((r) => r || Response.error())));
			return;
		}
		e.respondWith(caches.match(pedido).then((guardada) => {
			const red = fetch(pedido).then((resp) => guardar(pedido, resp)).catch(() => guardada || Response.error());
			return guardada || red;
		}));
	});
})("tindershop-app-2026-11-27T19:16:58.720Z", "tindershop-app-", "");
