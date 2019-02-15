export function mainAppBack(objTest){

const fun = require('./functions');

function esperar() {
    return new Promise(
        (resolve, reject) => {
            setTimeout(resolve, 3500);
        }
    )
}

async function executarCreatDialog() {
    for(let i in arrayDialog){
        fun.createNewDialog(arrayDialog[i]);
        await esperar();
    }
}

async function executarUpdateDialog() {
    for(let i in arrayDialog){
        fun.updateDialog(arrayDialog[i]);
        await esperar();
    }
}

//começando a conversação com uma mensagem vazia
//chatbot.message({workspace_id}, trataResposta);

// let fimDeConversar = false;
let arrayDialog = [];
let arrayEntities = [];



const entityGender = {
    'entityTag': 'gender',
    'entities': ['homem','mulher'],
    'homem': ['home', 'homem', 'homen', 'macho', 'cara', 'men', 'man','masc', 'masculino'],
    'mulher': ['mulher', 'muié', 'muie', 'fêmea', 'women', 'mulier', 'fem','femi','femino'],
    'description': 'Entidade Genero'
}
arrayEntities.push(entityGender)

const entityResp = {
    'entityTag': 'resposta',
    'entities': ['sim', 'nao'],
    'sim': ['sim', 'claro', 'posso', 'pode fazer', 'aceito', 'yes', 'go', 'partiu', 'vamos', 'bora'],
    'nao': ['não', 'agora não', 'não posso', 'depois', 'no', 'nope', 'nem'],
    'description': 'Entidade Resposta'
}
arrayEntities.push(entityResp)

const entityOptin = {
    entityTag: 'optin',
    entities: ['optin'],
    optin: ['sms','whats','whatsapp','app','tele','telegram','ligação','tel','fone','msg','zap','zapzap','face','facebook','twitter','tuiti','insta','instagram'],
    description: 'Entidade cores'
}
arrayEntities.push(entityOptin)

const intentResp = {};
intentResp.intentTag = 'responder';
intentResp.description = 'Intenção de responder a pesquisa';
intentResp.examples = [
    'Aceito participar',
    'Posso participar sim',
    'Estou disponével agora',
    'Estou tranquilo agora',
    'Posso responder sim',
    'Agora eu estou livre para responder',
    'Sim',
    'Claro'];

const intentRecusar = {};
intentRecusar.intentTag = 'recusar';
intentRecusar.description = 'Intenção de recusar responder a pesquisa';
intentRecusar.examples = [
    'Agora não',
    'Não posso',
    'Não quero',
    'Estou ocupado',
    'No momento não posso',
    'Mais tarde',
    'Não',
    "Quem sabe mais tarde",
    "Não me incomode mais"
];

function createIntentsAndEntities(arrayEntities){
    arrayEntities.forEach(element => {
        fun.createNewEntity(
            element.entityTag,
            fun.generateEntity(element))
    });

    fun.createNewIntent(
        intentResp.intentTag,
        fun.generateIntent(intentResp),
        intentResp.description)

    fun.createNewIntent(
        intentRecusar.intentTag,
        fun.generateIntent(intentRecusar),
        intentRecusar.description)
}

let axuElement = fun.generateQuestionObject(objTest,arrayEntities);
const dialogObj2 = axuElement[0];
arrayEntities = axuElement[1];

let CountArray = {};
let contrCountArray = 0;
dialogObj2.forEach(element => {
    CountArray['node'+contrCountArray+'_count'] = 0;
    contrCountArray++;
});

//Dialogo inicial
const dialog_welcome = fun.skillObject(
    "Welcome",
    "welcome", 
    {
        "text": {
          "values": [
            "Olá. Você estaria disposto a responder um rápido questionário?",
            "Bom dia, como vai? Você teria um minuto para responder algumas perguntas?",
            "Olá, eu sou a Sofia, posso lhe fazer algumas poucas perguntas?"
          ],
          "selection_policy": "random"
        }
    },
    "Bem-vindo",
    "Dialogo inical",
    undefined,
    undefined,
    undefined,
    CountArray
)

arrayDialog.push(dialog_welcome);

const folder_default = fun.skillObject(
    'folder_default',
    '#responder || @resposta:sim',
    undefined,
    'Default Folder',
    undefined,
    undefined,
    undefined,
    'Welcome',
    undefined,
    'folder'
)
arrayDialog.push(folder_default);


const folder_qsts = fun.skillObject(
    'folder_qsts',
    'false',
    undefined,
    'Questions Folder',
    undefined,
    undefined,
    undefined,
    'folder_default',
    undefined,
    'folder'
)
arrayDialog.push(folder_qsts);


//Dialogo Nome
const dialog_name = fun.skillObject(
    "dialog_name",
    "true",
    {
        generic: [
            {
                values: [
                    {
                        text: "Para começarmos, qual o seu nome?"
                    }
                ],
                response_type: "text",
                selection_policy: "sequential"
            }
        ]
    },
    "Dialog name",
    "Dialogo para obter o nome do entrevistado.",
    'folder_default',
    {
        behavior: "jump_to",
        selector: "user_input",
        dialog_node: "dialog_get_name"
    }
)
arrayDialog.push(dialog_name);

//Dialogo Nome
const dialog_get_name = fun.skillObject(
    "dialog_get_name",
    "true",
    undefined,
    "Dialog name",
    "Dialogo para obter o nome do entrevistado.",
    'dialog_name',
    {
        behavior: "jump_to",
        selector: "condition",
        dialog_node: "dialog_age"
    },
    undefined,
    {
        name: "<?input.text?>"
    }
)
arrayDialog.push(dialog_get_name);


//Dialogo idade
const dialog_age = fun.skillObject(
    'dialog_age',
    'true',
    {
        generic: [
            {
                values: [
                    {
                        text: "Prazer $name! Poderia me informar sua idade?"
                    }
                ],
                response_type: "text",
                selection_policy: "sequential"
            }
        ]
    },
    "Age Question",
    'Etapa para armazenar a idade do entrevista',
    'folder_default',
    undefined,
    'dialog_name',
    {
        age_count: 0
    }
)
arrayDialog.push(dialog_age);

const dialog_get_age = fun.skillObject(
    'dialog_get_age',
    '@sys-number >0',
    {
        "text": {
          "values": [
            "Obrigado por informar sua idade! -> $age. Qual seu gênero?"
          ],
          "selection_policy": "sequential"
        }
    },
    'If Get Age',
    'Dialogo para armazenar a idade caso ela sejá válida',
    'dialog_age',
    {
        "behavior": "jump_to",
        "selector": "condition",
        "dialog_node": "dialog_wait_gender"
    },
    undefined,
    {
        age: "<?@sys-number?>"
    }
)
arrayDialog.push(dialog_get_age);

const dialogo_not_get_age = fun.skillObject(
    'dialog_not_get_age',
    'anything_else && $age_count<2',
    {
        "text": {
          "values": [
            "Não entendi sua resposta, favor reformular."
          ],
          "selection_policy": "sequential"
        }
    },
    'If Not Get Age',
    'Dialogo que ocorre quando a idade informada não é reconhecida',
    'dialog_age',
    {
        "behavior": "jump_to",
        "selector": "body",
        "dialog_node": "dialog_age"
      },
    'dialog_get_age',
    {
        "age_count": "<? $age_count+1 ?>"
    }
)
arrayDialog.push(dialogo_not_get_age);

const dialog_any_age = fun.skillObject(
    'dialog_any_age',
    'anything_else',
    {
        "text": {
          "values": [
            "Sua idade informada foi armazenada! Poderia informar seu gênero?"
          ],
          "selection_policy": "sequential"
        }
    },
    'Get Any Age',
    'Dialogo que armazena qualquer informação enviada pelo entrevistado',
    'dialog_age',
    {
        "behavior": "jump_to",
        "selector": "condition",
        "dialog_node": "dialog_wait_gender"
    },
    'dialog_not_get_age',
    {
        "age": "<? input.text ?>"
    }
)
arrayDialog.push(dialog_any_age);

//Dialogo espera pelo Gênero
const dialog_wait_gender = fun.skillObject(
    'dialog_wait_gender',
    'true',
    undefined,
    'Get Gender',
    'Espera o entrevistado informar seu genêro.',
    'folder_default',
    undefined,
    'dialog_age'
)
arrayDialog.push(dialog_wait_gender);

//Dialogo gênero
const dialog_gender = fun.skillObject(
    "dialog_gender",
    "true",
    {
        generic: [
            {
                values: [
                    {
                        text: "Gênero registrado! Por qual canal você prefere responder às pesquisas(SMS, WhatsAPP,etc)?"
                    }
                ],
                response_type: "text",
                selection_policy: "sequential"
            }
        ]
    },
    "Dialog Gender",
    "Etapa para armazenar o gênero do entrevistado",
    'dialog_wait_gender',
    {
        behavior: "jump_to",
        selector: "user_input",
        dialog_node: "dialog_optin"
    },
    undefined,
    {
        gender: "<?entities[0].value?>"
    }
)
arrayDialog.push(dialog_gender);

//Dialogo Opt-in
const dialog_optin = fun.skillObject(
    'dialog_optin',
    'true',
    {
        generic: [
            {
                values: [
                    {
                        text: "Canal registrado! Você aceita ser contactado pelo canal preferido?"
                    }
                ],
                response_type: "text",
                selection_policy: "sequential"
            }
        ]
    },
    "Aks Opt In",
    'Dialogo para perguntar o Opt In',
    'folder_default',
    {
        behavior: "jump_to",
        selector: "user_input",
        dialog_node: "dialog_final_default"
    },
    'dialog_wait_gender',
    {
        prefChannel: "<?entities[0].value?>"
    }

)
arrayDialog.push(dialog_optin);

//Dialogo Opt-in
const dialog_final_default = fun.skillObject(
    'dialog_final_default',
    'true',
    {
        generic: [
            {
                values: [
                    {
                        text: "Pronto! Vamos começar com as perguntas."
                    }
                ],
                response_type: "text",
                selection_policy: "sequential"
            }
        ]
    },
    "Final Qts Default",
    'Dialogo final da sessão default',
    'folder_default',
    {
        behavior: "jump_to",
        selector: "condition",
        dialog_node: "node0"
    },
    'dialog_optin',
    {
        optin: "<?entities[0].value?>"
    }

)
arrayDialog.push(dialog_final_default);

arrayDialog = fun.generateQuestion(dialogObj2,arrayDialog)

//Dialog End
const dialog_end = fun.skillObject(
    "dialog_end",
    "anything_else || #recusar",
    {
        "text": {
          "values": [
            "Agradeço pelo seu tempo. Tenha um ótimo dia!",
            "Muito obrigado por sua atenção, até a próxima!",
            "Obriagdo por seu tempo, até mais!"
          ],
          "response_type": "text",
          "selection_policy": "random"
        }
    },
    "Em outros casos",
    "Dialogo Final",
    undefined,
    undefined,
    'folder_qsts'
)
arrayDialog.push(dialog_end);

createIntentsAndEntities(arrayEntities);

executarCreatDialog().then(
executarUpdateDialog);

}