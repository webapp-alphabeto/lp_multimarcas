document.addEventListener("DOMContentLoaded", function () {
    // Seleção de elementos do DOM
    const carousel = document.querySelector(".carousel");
    const images = document.querySelectorAll(".carousel img");
    const prevButton = document.querySelector(".prev");
    const nextButton = document.querySelector(".next");
    const indicators = document.querySelectorAll(".indicator");
    const form = document.querySelector(".form");
    const ufSelect = document.querySelector("#uf");
    const citySelect = document.querySelector("#city");
    const cnpjInput = document.querySelector("#cnpj");
    const faturamentoMensalSelect = document.querySelector("#faturamento_mensal");

    let currentIndex = 0;

    function atualizarIndicadores() {
        indicators.forEach((indicator, index) => {
            indicator.classList.toggle("active", index === currentIndex);
        });
    }

    function atualizarCarousel() {
        if (!carousel || images.length === 0) return;

        const offset = -currentIndex * 100;
        carousel.style.transform = `translateX(${offset}%)`;
        atualizarIndicadores();
    }

    function iniciarCarousel() {
        if (!carousel || images.length === 0) return;

        prevButton?.addEventListener("click", () => {
            currentIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
            atualizarCarousel();
        });

        nextButton?.addEventListener("click", () => {
            currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
            atualizarCarousel();
        });

        indicators.forEach((indicator, index) => {
            indicator.addEventListener("click", () => {
                currentIndex = index;
                atualizarCarousel();
            });
        });

        atualizarCarousel();

        setInterval(() => {
            currentIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
            atualizarCarousel();
        }, 3000);
    }

    function iniciarFooterResponsivo() {
        const mediaMobile = window.matchMedia("(max-width: 768px)");

        document.querySelectorAll(".expandable").forEach(header => {
            const list = header.nextElementSibling;
            if (!list) return;

            header.addEventListener("click", () => {
                if (!mediaMobile.matches) return;

                const isOpen = list.classList.toggle("is-open");
                header.classList.toggle("is-open", isOpen);
            });
        });
    }

    // Função para remover acentos e caracteres especiais
    function removerAcentos(texto) {
        return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ç/g, "c").replace(/Ç/g, "C");
    }

    function obterParametroUrl(nome) {
        const params = new URLSearchParams(window.location.search);
        return (params.get(nome) || "").trim();
    }

    function somenteDigitos(valor) {
        return valor.replace(/\D/g, "");
    }

    function formatarWhatsapp(celular) {
        return celular.startsWith("55") ? celular : `55${celular}`;
    }

    function obterTextoSelecionado(select) {
        return select.options[select.selectedIndex]?.textContent?.trim() || "";
    }

    // Função para validar CNPJ
    function validarCNPJ(cnpj) {
        cnpj = cnpj.replace(/[^\d]+/g, ""); // Remove caracteres não numéricos

        if (cnpj.length !== 14) return false;
        if (/^(\d)\1+$/.test(cnpj)) return false; // Verifica se todos os números são iguais

        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        let resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(0))) return false;

        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;

        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }

        resultado = soma % 11 < 2 ? 0 : 11 - (soma % 11);
        if (resultado !== parseInt(digitos.charAt(1))) return false;

        return true;
    }

    iniciarCarousel();
    iniciarFooterResponsivo();

    // Evento de submissão do formulário
    form?.addEventListener("submit", async function (event) {
        event.preventDefault();

        // Captura os valores do formulário, converte para caixa alta e remove acentos
        const nome = removerAcentos(document.querySelector("#name").value.trim().toUpperCase());
        const email = removerAcentos(document.querySelector("#email").value.trim().toUpperCase());
        const celular = somenteDigitos(document.querySelector("#phone").value.trim());
        const instagram = removerAcentos(document.querySelector("#instagram").value.trim().toUpperCase());
        const uf = removerAcentos(ufSelect.value.trim().toUpperCase());
        const cidade = removerAcentos(citySelect.value.trim().toUpperCase());
        const cidadeNome = removerAcentos(obterTextoSelecionado(citySelect).toUpperCase());
        const cnpj = somenteDigitos(cnpjInput.value.trim());
        const faturamentoMensal = faturamentoMensalSelect.value.trim();
        const utmSource = obterParametroUrl("utm_source") || "LP Multimarcas";
        const utmCampaign = obterParametroUrl("utm_campaign") || "SEM UTM";
        const utmContent = obterParametroUrl("utm_content") || "SEM UTM";

        // Validação antes do envio
        if (!nome || !email || !celular || !uf || !cidade || !cnpj || !faturamentoMensal) {
            alert("Preencha todos os campos obrigatórios!");
            return;
        }

        if (!validarCNPJ(cnpj)) {
            alert("CNPJ inválido! Verifique e tente novamente.");
            return;
        }

        const codIbge = cidade;
        const whatsapp = formatarWhatsapp(celular);

        const payload = {
            cnpj_qualified: cnpj,
            razaoSocial: nome,
            nomeFantasia: nome,
            email: email,
            phone_number: celular,
            whatsapp: whatsapp,
            instagram: instagram,
            observacao: `Lead recebido pela LP Multimarcas. Cidade IBGE: ${codIbge}.`,
            city: cidadeNome,
            state: uf,
            contatos: [
                {
                    nome: nome,
                    email: email,
                    phone_number: celular,
                    whatsapp: whatsapp
                }
            ],
            camposIntegracao: {
                instagram_: instagram,
                faturamento_mensal: faturamentoMensal,
                lead_source: utmSource,
                loja_fisica: "Sim",
                utm_campaign: utmCampaign,
                utm_content: utmContent,
                utm_source: utmSource
            }
        };

        enviarDados(payload, form);
    });

    // Função para enviar os dados para a API
    async function enviarDados(payload, form) {
        const url = "/.netlify/functions/receive-prospect";

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await response.json().catch(() => null);

            if (response.ok && !data?.hasError) {
                alert("Cadastro realizado com sucesso!");
                form.reset();
            } else {
                alert(data?.message || data?.error || "Erro ao enviar os dados.");
            }
        } catch (error) {
            console.error("Erro ao enviar os dados:", error);
            alert("Falha ao conectar com o servidor.");
        }
    }

    // Função para carregar os Estados no dropdown
    async function carregarEstados() {
        try {
            ufSelect.innerHTML = '<option value="">Carregando Estados...</option>';

            const response = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados");
            const data = await response.json();

            ufSelect.innerHTML = '<option value="">Selecione um Estado</option>';

            data.sort((a, b) => a.nome.localeCompare(b.nome)).forEach(estado => {
                const option = document.createElement("option");
                option.value = estado.sigla;
                option.textContent = estado.nome;
                ufSelect.appendChild(option);
            });

            citySelect.disabled = true;
        } catch (error) {
            console.error("Erro ao carregar Estados:", error);
            ufSelect.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    // Função para carregar as Cidades do Estado selecionado
    async function carregarCidades(uf) {
        try {
            citySelect.innerHTML = '<option value="">Carregando Cidades...</option>';

            const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
            const data = await response.json();

            citySelect.innerHTML = '<option value="">Selecione a Cidade</option>';

            data.forEach(cidade => {
                const option = document.createElement("option");
                option.value = cidade.id; // Código IBGE da cidade
                option.textContent = cidade.nome;
                citySelect.appendChild(option);
            });
        } catch (error) {
            console.error("Erro ao carregar Cidades:", error);
            citySelect.innerHTML = '<option value="">Erro ao carregar</option>';
        }
    }

    // Quando um Estado for selecionado, carregar as cidades correspondentes
    ufSelect?.addEventListener("change", async function () {
        const uf = ufSelect.value;
        if (uf) {
            citySelect.disabled = false;
            await carregarCidades(uf);
        } else {
            citySelect.innerHTML = '<option value="">Selecione um estado primeiro</option>';
            citySelect.disabled = true;
        }
    });

    // Carregar estados ao iniciar
    if (ufSelect && citySelect) {
        carregarEstados();
    }
});
