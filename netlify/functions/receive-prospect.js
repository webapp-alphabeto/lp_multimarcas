const GEOVENDAS_WEBHOOK_URL = "https://alphabeto.geovendas.app/geovendas360/api/v1/webhook/crm/receive";

const jsonHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json"
};

exports.handler = async function handler(event) {
    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 204,
            headers: jsonHeaders,
            body: ""
        };
    }

    if (event.httpMethod !== "POST") {
        return {
            statusCode: 405,
            headers: jsonHeaders,
            body: JSON.stringify({
                hasError: true,
                message: "Método não permitido."
            })
        };
    }

    const authKey = process.env.GEOVENDAS_WEBHOOK_AUTH_KEY;

    if (!authKey) {
        return {
            statusCode: 500,
            headers: jsonHeaders,
            body: JSON.stringify({
                hasError: true,
                message: "Configuração pendente: GEOVENDAS_WEBHOOK_AUTH_KEY não foi definida no Netlify."
            })
        };
    }

    let payload;

    try {
        payload = JSON.parse(event.body || "{}");
    } catch (error) {
        return {
            statusCode: 400,
            headers: jsonHeaders,
            body: JSON.stringify({
                hasError: true,
                message: "Payload inválido."
            })
        };
    }

    try {
        const response = await fetch(GEOVENDAS_WEBHOOK_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Auth-Key": authKey
            },
            body: JSON.stringify(payload)
        });

        const responseBody = await response.text();

        return {
            statusCode: response.status,
            headers: jsonHeaders,
            body: responseBody || JSON.stringify({
                hasError: !response.ok,
                message: response.ok ? "Cadastro realizado com sucesso!" : "Erro ao enviar os dados."
            })
        };
    } catch (error) {
        console.error("Erro ao enviar prospect para GEOvendas:", error);

        return {
            statusCode: 502,
            headers: jsonHeaders,
            body: JSON.stringify({
                hasError: true,
                message: "Falha ao conectar com o servidor da integração."
            })
        };
    }
};
