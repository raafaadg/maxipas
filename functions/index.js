const functions = require('firebase-functions');
const watson = require('watson-developer-cloud/assistant/v1')
require('dotenv').config()

const cors = require('cors')({ origin: true })

const chatbot = new watson({
    username: process.env.REACT_APP_USERNAME_WATSON,
    password: process.env.REACT_APP_PASSWORD,
    version: process.env.REACT_APP_VERSION,
});

const workspace_id = process.env.WORKSPACE_ID;

exports.conversa = functions.https.onRequest((req, res) => {
    cors(req, res, () => {
        let payload = {
            workspace_id,
            context: req.body.context || {},
            input: req.body.input || {}
        };
        chatbot.message(payload, (err, data) => {
            if (err) {
                return res.status(err.code || 500).json(err);
            }

            return res.json(trataResposta(payload, data));
        })
    })
})

const trataResposta = (payload, resposta) => {
    console.log('watson disse: ', resposta.output.text[0]);
    return resposta;
}