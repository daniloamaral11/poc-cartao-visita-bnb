const root = fragmentElement;
const endpoint = (configuration.objectEndpoint || '/o/c/cartaos').replace(/\/$/, '');

const btnExport = root.querySelector('[data-export]');
const btnCopy = root.querySelector('[data-copy]');
const toast = root.querySelector('[data-toast]');

const dados = {cargo: '', email: '', nome: '', telefone: ''};

const PLACEHOLDERS = ['Nome da Pessoa', 'Cargo', '(85) 0000-0000', 'email@bnb.gov.br', '—', ''];

function texto(seletor) {
	const el = root.querySelector(seletor);

	return el ? el.textContent.trim() : '';
}

// Display Page Template: os valores ja vieram mapeados no HTML.
function lerDoDom() {
	dados.nome = texto('[data-nome]');
	dados.cargo = texto('[data-cargo]');
	dados.telefone = texto('[data-telefone]');
	dados.email = texto('[data-email]');
}

function escrever() {
	root.querySelector('[data-nome]').textContent = dados.nome;
	root.querySelector('[data-cargo]').textContent = dados.cargo;
	root.querySelector('[data-telefone]').textContent = dados.telefone;
	root.querySelector('[data-email]').textContent = dados.email;
}

function validar() {
	const ok = dados.nome && !PLACEHOLDERS.includes(dados.nome);

	btnExport.disabled = !ok;
	btnExport.style.cursor = ok ? 'pointer' : 'not-allowed';
	btnExport.style.opacity = ok ? '1' : '.45';
}

// Content Page: busca a entrada pelo ?id= da URL via headless API do Object.
async function carregar() {
	const id = new URLSearchParams(location.search).get('id');

	if (!id) {
		lerDoDom();
		validar();

		return;
	}

	try {
		const resposta = await fetch(`${endpoint}/${id}`, {
			credentials: 'include',
			headers: {Accept: 'application/json'}
		});

		if (!resposta.ok) {
			console.warn(`[cartao-visita] ${endpoint}/${id} retornou ${resposta.status}`);
			lerDoDom();
			validar();

			return;
		}

		const json = await resposta.json();

		dados.nome = json.nome || '';
		dados.cargo = json.cargo || '';
		dados.telefone = json.telefone || '';
		dados.email = json.email || '';

		escrever();
	}
	catch (erro) {
		console.warn('[cartao-visita] falha ao carregar', erro);
		lerDoDom();
	}

	validar();
}

// Exporta em PNG usando Canvas 2D nativo - sem biblioteca externa.
function exportarPng() {
	lerDoDom();

	const largura = 1040;
	const altura = 600;
	const escala = 2;

	const canvas = document.createElement('canvas');

	canvas.width = largura * escala;
	canvas.height = altura * escala;

	const ctx = canvas.getContext('2d');

	ctx.scale(escala, escala);

	ctx.fillStyle = '#fff';
	ctx.fillRect(0, 0, largura, altura);

	const gradiente = ctx.createLinearGradient(0, 0, largura, 0);

	gradiente.addColorStop(0, '#8B1538');
	gradiente.addColorStop(.4, '#B01C2E');
	gradiente.addColorStop(.75, '#E87722');
	gradiente.addColorStop(1, '#FFD100');

	ctx.fillStyle = gradiente;
	ctx.fillRect(0, 0, largura, 20);

	ctx.fillStyle = '#FFD100';
	ctx.fillRect(0, altura - 12, largura, 12);

	ctx.fillStyle = '#8B1538';
	ctx.font = '700 20px system-ui, sans-serif';
	ctx.fillText((configuration.marca || 'Banco do Nordeste').toUpperCase(), 60, 100);

	ctx.fillStyle = '#2B2B2B';
	ctx.font = '800 58px system-ui, sans-serif';
	ctx.fillText(dados.nome, 60, 210);

	ctx.fillStyle = '#B01C2E';
	ctx.font = '600 30px system-ui, sans-serif';
	ctx.fillText(dados.cargo, 60, 268);

	ctx.fillStyle = '#555';
	ctx.font = '400 26px system-ui, sans-serif';
	ctx.fillText(dados.telefone, 60, 350);

	if (dados.email) {
		ctx.fillText(dados.email, 60, 392);
	}

	const link = document.createElement('a');

	link.download = `cartao-${dados.nome.toLowerCase().replace(/\s+/g, '-')}.png`;
	link.href = canvas.toDataURL('image/png');
	link.click();
}

async function copiarLink() {
	try {
		await navigator.clipboard.writeText(location.href);
	}
	catch (erro) {
		// clipboard exige contexto seguro (https ou localhost)
		const campo = document.createElement('textarea');

		campo.value = location.href;
		document.body.appendChild(campo);
		campo.select();
		document.execCommand('copy');
		document.body.removeChild(campo);
	}

	toast.hidden = false;
	setTimeout(() => (toast.hidden = true), 2000);
}

btnExport.addEventListener('click', exportarPng);
btnCopy.addEventListener('click', copiarLink);

carregar();
