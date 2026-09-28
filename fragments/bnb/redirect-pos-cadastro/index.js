const paginaCartao = configuration.paginaCartao || '/cartao';
const endpoint = (configuration.objectEndpoint || '/o/c/cartaos').replace(/\/$/, '');
const scopeId = (configuration.scopeId || '').trim();

let jaRedirecionou = false;

function irParaCartao(id) {
	if (jaRedirecionou || !id) {
		return;
	}

	jaRedirecionou = true;

	window.location.href = `${paginaCartao}?id=${id}`;
}

function ehPostDoObject(metodo, url) {
	return String(metodo).toUpperCase() === 'POST' && String(url).includes(endpoint);
}

// Estrategia 1: captura o id exato na resposta do submit do Form Container.
const fetchOriginal = window.fetch;

window.fetch = function (...args) {
	const promessa = fetchOriginal.apply(this, args);

	try {
		const alvo = args[0];
		const url = typeof alvo === 'string' ? alvo : (alvo && alvo.url) || '';
		const metodo = (args[1] && args[1].method) || (alvo && alvo.method) || 'GET';

		if (ehPostDoObject(metodo, url)) {
			promessa
				.then((resposta) => resposta.clone().json())
				.then((json) => json && json.id && irParaCartao(json.id))
				.catch(() => {});
		}
	}
	catch (erro) {
		// nunca quebrar o submit por causa do interceptador
	}

	return promessa;
};

const openOriginal = XMLHttpRequest.prototype.open;
const sendOriginal = XMLHttpRequest.prototype.send;

XMLHttpRequest.prototype.open = function (metodo, url, ...resto) {
	this.__bnbMetodo = metodo;
	this.__bnbUrl = url;

	return openOriginal.call(this, metodo, url, ...resto);
};

XMLHttpRequest.prototype.send = function (...args) {
	this.addEventListener('load', () => {
		try {
			if (ehPostDoObject(this.__bnbMetodo, this.__bnbUrl)) {
				const json = JSON.parse(this.responseText);

				if (json && json.id) {
					irParaCartao(json.id);
				}
			}
		}
		catch (erro) {
			// resposta nao-JSON: cai na estrategia 2
		}
	});

	return sendOriginal.apply(this, args);
};

// Estrategia 2 (fallback): detecta a mensagem de sucesso e busca a ultima entrada.
const TEXTOS_SUCESSO = [
	'successfully received',
	'recebida com sucesso',
	'recebidas com sucesso',
	'enviado com sucesso',
	'thank you'
];

function pareceSucesso(elemento) {
	const texto = (elemento.textContent || '').toLowerCase();

	return TEXTOS_SUCESSO.some((frase) => texto.includes(frase));
}

async function buscarUltimaEntrada() {
	const base = scopeId ? `${endpoint}/scopes/${scopeId}` : endpoint;

	const resposta = await fetch(`${base}?pageSize=1&sort=dateCreated:desc`, {
		credentials: 'include',
		headers: {Accept: 'application/json'}
	});

	if (!resposta.ok) {
		console.warn(`[redirect-pos-cadastro] listagem retornou ${resposta.status}`);

		return null;
	}

	const json = await resposta.json();
	const itens = json.items || [];

	return itens.length ? itens[0].id : null;
}

async function aoDetectarSucesso() {
	if (jaRedirecionou) {
		return;
	}

	irParaCartao(await buscarUltimaEntrada());
}

function sucessoJaNoDom() {
	const candidatos = document.querySelectorAll(
		'.alert-success, [role="alert"], .portlet-msg-success'
	);

	return Array.from(candidatos).some(pareceSucesso);
}

const observador = new MutationObserver((mutacoes) => {
	for (const mutacao of mutacoes) {
		for (const no of mutacao.addedNodes) {
			if (no.nodeType === 1 && pareceSucesso(no)) {
				aoDetectarSucesso();

				return;
			}
		}
	}
});

observador.observe(document.body, {childList: true, subtree: true});

if (sucessoJaNoDom()) {
	aoDetectarSucesso();
}
